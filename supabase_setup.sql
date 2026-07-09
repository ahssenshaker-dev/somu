-- =============================================
-- CRM Dashboard - Supabase Setup
-- شغّل هذا في Supabase > SQL Editor
-- =============================================

-- 1. أنشئ الجدول الرئيسي
create table if not exists public.records (
  id          uuid primary key default gen_random_uuid(),
  day         integer,
  employee    text,
  name        text default '',
  phone       text not null,
  city        text default 'الرياض',
  type        text,
  source      text,
  contact     text,
  request     text,
  details     text default '',
  full_date   date,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- 2. فعّل Row Level Security
alter table public.records enable row level security;

-- 3. سياسة: كل الزوار يقدرون يقرأون ويكتبون (عدّلها حسب احتياجك)
create policy "allow_all" on public.records
  for all using (true) with check (true);

-- 4. Index للأداء
create index if not exists idx_records_full_date on public.records(full_date);
create index if not exists idx_records_source    on public.records(source);

-- 5. فعّل Realtime
alter publication supabase_realtime add table public.records;

-- =============================================
-- بعد ما تشغّل هذا:
-- 1. روح Project Settings > API
-- 2. انسخ: Project URL  و  anon public key
-- 3. ضعهم في ملف index.html في المتغيرات في الأعلى
-- =============================================
