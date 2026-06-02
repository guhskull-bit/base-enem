create extension if not exists "pgcrypto";

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
  active boolean default true,
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

create index if not exists idx_profiles_class_id on public.profiles(class_id);
create index if not exists idx_questions_area on public.questions(knowledge_area);
create index if not exists idx_student_attempts_student on public.student_attempts(student_id);
create index if not exists idx_student_answers_student on public.student_answers(student_id);
create index if not exists idx_exam_questions_exam on public.exam_questions(exam_id);

create or replace function public.is_admin_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace view public.student_overall_progress as
select
  p.id as student_id,
  p.full_name,
  p.email,
  p.class_id,
  coalesce(sum(sa.is_correct::int), 0) as total_correct,
  count(sa.id) as total_answered,
  case when count(sa.id) = 0 then 0 else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2) end as score_percent
from public.profiles p
left join public.student_answers sa on sa.student_id = p.id
group by p.id;

create or replace view public.student_area_performance as
select
  p.id as student_id,
  q.knowledge_area,
  count(sa.id) as total_answered,
  sum(sa.is_correct::int) as total_correct,
  case when count(sa.id) = 0 then 0 else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2) end as score_percent
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
  case when count(sa.id) = 0 then 0 else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2) end as score_percent
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
  case when count(sa.id) = 0 then 0 else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2) end as score_percent
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
  case when count(sa.id) = 0 then 0 else round((sum(sa.is_correct::int)::numeric / count(sa.id)) * 100, 2) end as score_percent
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

create or replace function public.get_question_feedback(p_question_id uuid)
returns table (
  correct_option text,
  explanation text
)
language sql
stable
security definer
set search_path = public
as $$
  select q.correct_option, q.explanation
  from public.questions q
  where q.id = p_question_id
    and (
      public.is_admin_user()
      or exists (
        select 1
        from public.student_answers sa
        where sa.question_id = q.id
          and sa.student_id = auth.uid()
      )
    );
$$;

alter table public.classes enable row level security;
alter table public.profiles enable row level security;
alter table public.questions enable row level security;
alter table public.exams enable row level security;
alter table public.exam_questions enable row level security;
alter table public.student_attempts enable row level security;
alter table public.student_answers enable row level security;
alter table public.achievements enable row level security;
alter table public.student_achievements enable row level security;

create policy "profiles self or admin select" on public.profiles
  for select using (id = auth.uid() or public.is_admin_user());
create policy "profiles admin manage" on public.profiles
  for all using (public.is_admin_user()) with check (public.is_admin_user());

create policy "classes admin manage" on public.classes
  for all using (public.is_admin_user()) with check (public.is_admin_user());

create policy "questions admin manage" on public.questions
  for all using (public.is_admin_user()) with check (public.is_admin_user());
create policy "questions student read public view only" on public.questions
  for select using (public.is_admin_user());

create policy "exams admin manage" on public.exams
  for all using (public.is_admin_user()) with check (public.is_admin_user());
create policy "exam_questions admin manage" on public.exam_questions
  for all using (public.is_admin_user()) with check (public.is_admin_user());

create policy "attempts self or admin select" on public.student_attempts
  for select using (student_id = auth.uid() or public.is_admin_user());
create policy "attempts self insert" on public.student_attempts
  for insert with check (student_id = auth.uid() or public.is_admin_user());
create policy "attempts admin update" on public.student_attempts
  for update using (public.is_admin_user()) with check (public.is_admin_user());

create policy "answers self or admin select" on public.student_answers
  for select using (student_id = auth.uid() or public.is_admin_user());
create policy "answers self insert" on public.student_answers
  for insert with check (student_id = auth.uid() or public.is_admin_user());
create policy "answers admin update" on public.student_answers
  for update using (public.is_admin_user()) with check (public.is_admin_user());

create policy "achievements admin manage" on public.achievements
  for all using (public.is_admin_user()) with check (public.is_admin_user());
create policy "student achievements self or admin select" on public.student_achievements
  for select using (student_id = auth.uid() or public.is_admin_user());
create policy "student achievements admin manage" on public.student_achievements
  for all using (public.is_admin_user()) with check (public.is_admin_user());

grant usage on schema public to anon, authenticated;
grant select on public.student_overall_progress to authenticated;
grant select on public.student_area_performance to authenticated;
grant select on public.student_topic_difficulties to authenticated;
grant select on public.class_ranking to authenticated;
grant select on public.admin_area_summary to authenticated;
grant select on public.students_attention_list to authenticated;
grant select on public.student_questions_public to authenticated;
grant execute on function public.get_question_feedback(uuid) to authenticated;
