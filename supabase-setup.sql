create extension if not exists "pgcrypto";

-- =========================================
-- Tables
-- =========================================

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year text not null,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('student', 'admin')),
  class_id uuid references public.classes(id),
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  statement text not null,
  image_url text,
  image_alt text,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  option_e text not null,
  correct_option text not null check (correct_option in ('A', 'B', 'C', 'D', 'E')),
  explanation text not null,
  exam_year integer,
  knowledge_area text not null,
  subject text not null,
  topic text not null,
  difficulty text not null check (difficulty in ('facil', 'media', 'dificil')),
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  knowledge_area text,
  exam_year integer,
  time_limit_minutes integer not null,
  active boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.exam_questions (
  id uuid primary key default gen_random_uuid(),
  exam_id uuid references public.exams(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  position integer not null
);

create table if not exists public.student_attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  started_at timestamptz default now(),
  finished_at timestamptz,
  total_questions integer default 0,
  correct_answers integer default 0,
  score_percent numeric default 0,
  total_time_seconds integer default 0
);

create table if not exists public.student_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid references public.student_attempts(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  selected_option text not null check (selected_option in ('A', 'B', 'C', 'D', 'E')),
  is_correct boolean not null,
  time_spent_seconds integer default 0,
  answered_at timestamptz default now()
);

create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  icon text,
  trigger_type text not null,
  trigger_value integer,
  active boolean default true
);

create table if not exists public.student_achievements (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  unlocked_at timestamptz default now()
);

-- =========================================
-- Constraints / indexes
-- =========================================

create unique index if not exists idx_exam_questions_unique_link
  on public.exam_questions (exam_id, question_id);

create index if not exists idx_profiles_class_id on public.profiles(class_id);
create index if not exists idx_questions_area on public.questions(knowledge_area);
create index if not exists idx_student_attempts_student on public.student_attempts(student_id);
create index if not exists idx_student_answers_student on public.student_answers(student_id);
create index if not exists idx_exam_questions_exam on public.exam_questions(exam_id);

-- =========================================
-- Storage
-- =========================================

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

-- =========================================
-- Helpers
-- =========================================

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

-- =========================================
-- Views
-- =========================================

create or replace view public.student_overall_progress as
select
  p.id as student_id,
  p.full_name,
  p.email,
  p.class_id,
  coalesce(sum(sa.is_correct::int), 0) as total_correct,
  count(sa.id) as total_answered,
  case
    when count(sa.id) = 0 then 0
    else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2)
  end as score_percent
from public.profiles p
left join public.student_answers sa on sa.student_id = p.id
group by p.id;

create or replace view public.student_area_performance as
select
  p.id as student_id,
  q.knowledge_area,
  count(sa.id) as total_answered,
  sum(sa.is_correct::int) as total_correct,
  case
    when count(sa.id) = 0 then 0
    else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2)
  end as score_percent
from public.student_answers sa
join public.questions q on q.id = sa.question_id
join public.profiles p on p.id = sa.student_id
group by p.id, q.knowledge_area;

create or replace view public.student_topic_difficulties as
select
  p.id as student_id,
  q.topic,
  q.subject,
  q.knowledge_area,
  count(sa.id) as total_answered,
  sum(sa.is_correct::int) as total_correct,
  case
    when count(sa.id) = 0 then 0
    else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2)
  end as score_percent
from public.student_answers sa
join public.questions q on q.id = sa.question_id
join public.profiles p on p.id = sa.student_id
group by p.id, q.topic, q.subject, q.knowledge_area;

create or replace view public.class_ranking as
select
  c.id as class_id,
  c.name as class_name,
  p.id as student_id,
  p.full_name,
  coalesce(sum(sa.is_correct::int), 0) as total_correct,
  count(sa.id) as total_answered,
  case
    when count(sa.id) = 0 then 0
    else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2)
  end as score_percent
from public.profiles p
left join public.student_answers sa on sa.student_id = p.id
left join public.classes c on c.id = p.class_id
where p.role = 'student'
group by c.id, c.name, p.id, p.full_name
order by score_percent desc, total_answered desc;

create or replace view public.admin_area_summary as
select
  q.knowledge_area,
  count(sa.id) as total_answered,
  sum(sa.is_correct::int) as total_correct,
  case
    when count(sa.id) = 0 then 0
    else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2)
  end as score_percent
from public.student_answers sa
join public.questions q on q.id = sa.question_id
group by q.knowledge_area;

create or replace view public.students_attention_list as
select *
from public.student_overall_progress
where score_percent < 50;

create or replace view public.student_questions_public as
select
  q.id,
  q.statement,
  q.image_url,
  q.image_alt,
  q.option_a,
  q.option_b,
  q.option_c,
  q.option_d,
  q.option_e,
  q.explanation,
  q.exam_year,
  q.knowledge_area,
  q.subject,
  q.topic,
  q.difficulty,
  q.active,
  q.created_at
from public.questions q
where q.active = true
  and exists (
    select 1
    from public.exam_questions eq
    join public.exams e on e.id = eq.exam_id
    where eq.question_id = q.id and e.active = true
  );

-- =========================================
-- Security / RLS
-- =========================================

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.student_attempts enable row level security;
alter table public.student_answers enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;

drop policy if exists "profiles self or admin select" on public.profiles;
create policy "profiles self or admin select" on public.profiles
  for select
  using (id = auth.uid() or public.is_admin_user());

drop policy if exists "profiles admin manage" on public.profiles;
create policy "profiles admin manage" on public.profiles
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "classes admin manage" on public.classes;
create policy "classes admin manage" on public.classes
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "questions admin manage" on public.questions;
create policy "questions admin manage" on public.questions
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "questions student read public view only" on public.questions;
create policy "questions student read public view only" on public.questions
  for select
  using (public.is_admin_user() or exists (
    select 1
    from public.exam_questions eq
    join public.exams e on e.id = eq.exam_id
    where eq.question_id = questions.id
      and e.active = true
  ));

drop policy if exists "exams admin manage" on public.exams;
create policy "exams admin manage" on public.exams
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "exams student select active" on public.exams;
create policy "exams student select active" on public.exams
  for select
  using (active = true or public.is_admin_user());

drop policy if exists "exam_questions admin manage" on public.exam_questions;
create policy "exam_questions admin manage" on public.exam_questions
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "attempts self or admin select" on public.student_attempts;
create policy "attempts self or admin select" on public.student_attempts
  for select
  using (student_id = auth.uid() or public.is_admin_user());

drop policy if exists "attempts self insert" on public.student_attempts;
create policy "attempts self insert" on public.student_attempts
  for insert
  with check (student_id = auth.uid() or public.is_admin_user());

drop policy if exists "attempts admin update" on public.student_attempts;
create policy "attempts admin update" on public.student_attempts
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "answers self or admin select" on public.student_answers;
create policy "answers self or admin select" on public.student_answers
  for select
  using (student_id = auth.uid() or public.is_admin_user());

drop policy if exists "answers self insert" on public.student_answers;
create policy "answers self insert" on public.student_answers
  for insert
  with check (student_id = auth.uid() or public.is_admin_user());

drop policy if exists "answers admin update" on public.student_answers;
create policy "answers admin update" on public.student_answers
  for update
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "achievements admin manage" on public.achievements;
create policy "achievements admin manage" on public.achievements
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "student achievements self or admin select" on public.student_achievements;
create policy "student achievements self or admin select" on public.student_achievements
  for select
  using (student_id = auth.uid() or public.is_admin_user());

drop policy if exists "student achievements admin manage" on public.student_achievements;
create policy "student achievements admin manage" on public.student_achievements
  for all
  using (public.is_admin_user())
  with check (public.is_admin_user());

drop policy if exists "question-images public read" on storage.objects;
create policy "question-images public read" on storage.objects
  for select
  using (bucket_id = 'question-images');

drop policy if exists "question-images admin insert" on storage.objects;
create policy "question-images admin insert" on storage.objects
  for insert
  with check (bucket_id = 'question-images' and public.is_admin_user());

drop policy if exists "question-images admin update" on storage.objects;
create policy "question-images admin update" on storage.objects
  for update
  using (bucket_id = 'question-images' and public.is_admin_user())
  with check (bucket_id = 'question-images' and public.is_admin_user());

drop policy if exists "question-images admin delete" on storage.objects;
create policy "question-images admin delete" on storage.objects
  for delete
  using (bucket_id = 'question-images' and public.is_admin_user());

grant usage on schema public to anon, authenticated;
grant select on public.student_overall_progress to authenticated;
grant select on public.student_area_performance to authenticated;
grant select on public.student_topic_difficulties to authenticated;
grant select on public.class_ranking to authenticated;
grant select on public.admin_area_summary to authenticated;
grant select on public.students_attention_list to authenticated;
grant select on public.student_questions_public to authenticated;

-- =========================================
-- Seed data
-- Obs.: não cria auth.users por SQL.
-- =========================================

insert into public.classes (id, name, year, active)
values
  ('11111111-1111-1111-1111-111111111111', '2A EM', '2026', true),
  ('22222222-2222-2222-2222-222222222222', '2B EM', '2026', true),
  ('33333333-3333-3333-3333-333333333333', '3A EM', '2026', true)
on conflict (id) do nothing;

insert into public.achievements (id, name, description, icon, trigger_type, trigger_value, active)
values
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Primeira questão respondida', 'Marcou presença na Base ENEM.', 'sparkles', 'questions_answered', 1, true),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '10 questões respondidas', 'Começou a ganhar ritmo.', 'target', 'questions_answered', 10, true),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '50 questões respondidas', 'Volume consistente de treino.', 'target', 'questions_answered', 50, true),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '100 questões respondidas', 'Forte rotina de estudos.', 'target', 'questions_answered', 100, true),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '7 dias seguidos estudando', 'Consistência acima da média.', 'flame', 'streak_days', 7, true),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '70% de acerto geral', 'Bom caminho para a aprovação.', 'award', 'score_percent', 70, true),
  ('99999999-9999-9999-9999-999999999999', '80% de acerto geral', 'Desempenho muito forte.', 'award', 'score_percent', 80, true),
  ('88888888-8888-8888-8888-888888888888', 'Primeiro simulado concluído', 'Primeiro passo do ciclo de estudos.', 'check-circle-2', 'attempts_finished', 1, true),
  ('77777777-7777-7777-7777-777777777777', 'Melhorando em Matemática', 'Sua base em Matemática está ficando mais forte.', 'trending-up', 'math_progress', 60, true),
  ('66666666-6666-6666-6666-666666666666', 'Melhorando em Natureza', 'Sua base em Natureza está crescendo.', 'trending-up', 'nature_progress', 60, true)
on conflict (id) do nothing;

insert into public.questions (
  id, statement, image_url, image_alt,
  option_a, option_b, option_c, option_d, option_e,
  correct_option, explanation, exam_year, knowledge_area, subject, topic, difficulty, active
)
values
  (
    '10000000-0000-0000-0000-000000000001',
    'Em uma leitura de gráfico, a variação percentual de uma grandeza é dada por...',
    null,
    null,
    'diferença entre o maior e o menor valor',
    'razão entre variação e valor inicial',
    'soma dos valores observados',
    'produto entre a média e o desvio',
    'mediana da distribuição',
    'B',
    'A variação percentual relaciona a diferença ao valor inicial.',
    2024,
    'Matemática',
    'Matemática',
    'Porcentagem',
    'media',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'A função da linguagem predominante em um texto publicitário é...',
    null,
    null,
    'emotiva',
    'referencial',
    'poética',
    'conativa',
    'metalinguística',
    'D',
    'Textos publicitários buscam persuadir o leitor.',
    2023,
    'Linguagens',
    'Português',
    'Funções da linguagem',
    'facil',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'A Revolução Industrial alterou principalmente a relação entre...',
    null,
    null,
    'campo e cidade',
    'alfabetização e imprensa',
    'religião e ciência',
    'nobreza e clero',
    'língua e gramática',
    'A',
    'A industrialização intensificou a urbanização e o êxodo rural.',
    2022,
    'Ciências Humanas',
    'História',
    'Revolução Industrial',
    'media',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    'A base da cadeia alimentar é formada, em geral, por...',
    null,
    null,
    'consumidores terciários',
    'decompositores',
    'produtores',
    'predadores de topo',
    'parasitas',
    'C',
    'Os produtores transformam energia para sustentar a cadeia.',
    2024,
    'Ciências da Natureza',
    'Biologia',
    'Ecologia',
    'facil',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'O gráfico de posição versus tempo com inclinação positiva constante representa...',
    null,
    null,
    'repouso',
    'movimento uniforme',
    'aceleração negativa',
    'movimento circular',
    'variação instantânea nula',
    'B',
    'Inclinação constante em s x t indica velocidade constante.',
    2021,
    'Ciências da Natureza',
    'Física',
    'Cinemática',
    'media',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000006',
    'Um texto com argumentação direta e foco em convencer o leitor normalmente apresenta...',
    null,
    null,
    'função conativa',
    'função fática',
    'função metalinguística',
    'função poética',
    'função referencial',
    'A',
    'A função conativa destaca a intenção de persuadir.',
    2024,
    'Linguagens',
    'Português',
    'Funções da linguagem',
    'facil',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000007',
    'O processo de urbanização acelerada no Brasil está ligado principalmente a...',
    null,
    null,
    'expansão industrial e migração do campo',
    'queda do setor de serviços',
    'redução da produção agrícola',
    'fim do trabalho assalariado',
    'isolamento das capitais',
    'A',
    'A migração campo-cidade acompanhou o crescimento industrial.',
    2023,
    'Ciências Humanas',
    'Geografia',
    'Urbanização',
    'media',
    true
  ),
  (
    '10000000-0000-0000-0000-000000000008',
    'Na química ambiental, a poluição atmosférica pode ser agravada por...',
    null,
    null,
    'redução de combustíveis fósseis',
    'uso de fontes renováveis',
    'emissão de particulados e gases',
    'aumento da vegetação urbana',
    'reciclagem de resíduos',
    'C',
    'A emissão de poluentes intensifica a degradação do ar.',
    2024,
    'Ciências da Natureza',
    'Química',
    'Poluição',
    'dificil',
    true
  )
on conflict (id) do nothing;

insert into public.exams (
  id, title, description, knowledge_area, exam_year, time_limit_minutes, active
)
values
  (
    '20000000-0000-0000-0000-000000000001',
    'Simulado Base ENEM - Diagnóstico 1',
    'Avaliação inicial com foco em leitura, interpretação e resolução básica.',
    null,
    2024,
    60,
    true
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Simulado Base ENEM - Revisão 2',
    'Simulado misto com foco em recuperação de dificuldades.',
    null,
    2025,
    50,
    false
  )
on conflict (id) do nothing;

insert into public.exam_questions (id, exam_id, question_id, position)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 2),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 3),
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 4),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000005', 5),
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 1),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000004', 2),
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', 3),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000007', 4),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000008', 5)
on conflict (exam_id, question_id) do nothing;

-- =========================================
-- Access grants for views/functions
-- =========================================

grant execute on function public.is_admin_user() to authenticated;
