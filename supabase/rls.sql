-- Enable RLS
alter table public.forms enable row level security;
alter table public.questions enable row level security;
alter table public.responses enable row level security;
alter table public.answers enable row level security;

-- Ownership policies (simplified owner/team)
create policy if not exists forms_owner_read on public.forms for select using (
  auth.uid() = owner_id or team_id in (
    select team_id from public.team_members tm where tm.user_id = auth.uid()
  )
);
create policy if not exists forms_owner_write on public.forms for all using (
  auth.uid() = owner_id or (
    team_id in (select team_id from public.team_members tm where tm.user_id = auth.uid() and tm.role in ('owner','editor'))
  )
);

create policy if not exists questions_owner_all on public.questions for all using (
  exists (select 1 from public.forms f where f.id = form_id and (
    auth.uid() = f.owner_id or f.team_id in (
      select team_id from public.team_members tm where tm.user_id = auth.uid() and tm.role in ('owner','editor')
    )
  ))
);

create policy if not exists responses_owner_read on public.responses for select using (
  exists (select 1 from public.forms f where f.id = form_id and (
    auth.uid() = f.owner_id or f.team_id in (
      select team_id from public.team_members tm where tm.user_id = auth.uid()
    )
  ))
);
create policy if not exists answers_owner_read on public.answers for select using (
  exists (
    select 1 from public.responses r join public.forms f on f.id = r.form_id
    where r.id = response_id and (
      auth.uid() = f.owner_id or f.team_id in (
        select team_id from public.team_members tm where tm.user_id = auth.uid()
      )
    )
  )
);

-- Public insert for anonymous/nominative forms (no auth)
create policy if not exists responses_public_insert on public.responses for insert to anon with check (
  exists (
    select 1 from public.forms f
    where f.id = form_id and f.is_published = true and f.is_active = true and f.access_mode in ('anonymous','nominative')
  )
);

create policy if not exists answers_public_insert on public.answers for insert to anon with check (
  exists (
    select 1 from public.responses r join public.forms f on f.id = r.form_id
    where r.id = response_id and f.is_published = true and f.is_active = true and f.access_mode in ('anonymous','nominative')
  )
);

-- Public read for published forms and their questions
create policy if not exists forms_public_read on public.forms for select to anon using (
  is_published = true and is_active = true
);

create policy if not exists questions_public_read on public.questions for select to anon using (
  exists (select 1 from public.forms f where f.id = form_id and f.is_published = true and f.is_active = true)
);


