-- Enforce max 2 members in couple_spaces.data.users at DB layer.
-- Run in Supabase SQL Editor.

create or replace function public.enforce_couple_space_two_members()
returns trigger
language plpgsql
as $$
declare
  users_len integer;
begin
  if new.data is null then
    return new;
  end if;

  if jsonb_typeof(new.data -> 'users') = 'array' then
    users_len := jsonb_array_length(new.data -> 'users');
    if users_len > 2 then
      raise exception 'couple_spaces users cannot exceed 2 members';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_enforce_couple_space_two_members on public.couple_spaces;
create trigger trg_enforce_couple_space_two_members
before insert or update of data on public.couple_spaces
for each row
execute function public.enforce_couple_space_two_members();
