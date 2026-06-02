alter table public.questions add column if not exists image_url text;
alter table public.questions add column if not exists image_alt text;

create unique index if not exists idx_exam_questions_unique_link
  on public.exam_questions (exam_id, question_id);

insert into storage.buckets (id, name, public)
values ('question-images', 'question-images', true)
on conflict (id) do update
set name = excluded.name,
    public = excluded.public;

drop policy if exists "exams student select active" on public.exams;
create policy "exams student select active" on public.exams
  for select
  using (active = true or public.is_admin_user());

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
