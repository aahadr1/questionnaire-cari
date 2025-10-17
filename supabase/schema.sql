-- Profiles
create table if not exists public.profiles (
  id uuid primary key,
  email text,
  full_name text,
  created_at timestamptz default now()
);

-- Teams
create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  owner_id uuid not null,
  created_at timestamptz default now()
);

create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  team_id uuid references public.teams(id) on delete cascade,
  user_id uuid not null,
  role text not null check (role in ('owner','editor','viewer')),
  created_at timestamptz default now()
);

-- Forms
create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null,
  team_id uuid,
  title text not null default 'Sans titre',
  description text,
  slug text unique,
  access_mode text not null default 'anonymous' check (access_mode in ('anonymous','nominative','authenticated')),
  identification_fields jsonb default '[]'::jsonb,
  is_published boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Questions
create table if not exists public.questions (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade,
  index int not null,
  type text not null check (type in ('short_text','long_text','single_choice','multiple_choice','number','date','file')),
  label text not null,
  description text,
  is_required boolean default false,
  options jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

-- Responses
create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  form_id uuid references public.forms(id) on delete cascade,
  submitted_at timestamptz default now(),
  responder_name text,
  responder_email text,
  responder_auth_user_id uuid,
  responder_metadata jsonb,
  created_at timestamptz default now()
);

-- Answers
create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  response_id uuid references public.responses(id) on delete cascade,
  question_id uuid references public.questions(id) on delete cascade,
  value jsonb
);

-- Indices utiles
create index if not exists idx_questions_form on public.questions(form_id, index);
create index if not exists idx_responses_form on public.responses(form_id);
create index if not exists idx_answers_response on public.answers(response_id);


