-- Invitation code table for server-side validation and single-use consumption
-- Run in Supabase SQL Editor.

create table if not exists public.invitation_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  space_code text not null,
  created_by text not null,
  consumed_by text null,
  expires_at timestamptz not null,
  consumed_at timestamptz null,
  created_at timestamptz not null default now()
);

create index if not exists invitation_codes_space_code_idx
  on public.invitation_codes (space_code);

create index if not exists invitation_codes_active_lookup_idx
  on public.invitation_codes (code, space_code, consumed_at, expires_at);

alter table public.invitation_codes enable row level security;

-- For anon-key clients, allow create and consume only while active.
-- If you already have stricter auth-based policies, replace these.
drop policy if exists "invitation_codes_insert_all" on public.invitation_codes;
create policy "invitation_codes_insert_all"
on public.invitation_codes
for insert
to anon, authenticated
with check (true);

drop policy if exists "invitation_codes_update_active" on public.invitation_codes;
create policy "invitation_codes_update_active"
on public.invitation_codes
for update
to anon, authenticated
using (consumed_at is null and expires_at > now())
with check (true);

drop policy if exists "invitation_codes_select_all" on public.invitation_codes;
create policy "invitation_codes_select_all"
on public.invitation_codes
for select
to anon, authenticated
using (true);
