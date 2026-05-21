create extension if not exists "pgcrypto";

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.user_profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  login text not null unique,
  profile text not null check (
    profile in (
      'Administrador',
      'Administrativo',
      'Técnico Mecânica',
      'Técnico Usinagem',
      'Técnico Elétrica',
      'Gestor',
      'Cliente'
    )
  ),
  sector text,
  linked_employee_id text,
  linked_client_id text,
  status text not null default 'Ativo' check (status in ('Ativo', 'Inativo')),
  last_access timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.resolve_login_email(login_text text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email
  from public.user_profiles
  where lower(login) = lower(login_text)
    and status = 'Ativo'
  limit 1;
$$;

create or replace function public.current_gpm_profile()
returns table(profile text, linked_client_id text, sector text)
language sql
stable
security definer
set search_path = public
as $$
  select current_profile.profile, current_profile.linked_client_id, current_profile.sector
  from public.user_profiles current_profile
  where current_profile.auth_user_id = auth.uid()
    and current_profile.status = 'Ativo'
  limit 1;
$$;

create table if not exists public.gpm_records (
  id uuid primary key default gen_random_uuid(),
  collection text not null,
  record_id text not null,
  payload jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (collection, record_id)
);

drop trigger if exists touch_gpm_records_updated_at on public.gpm_records;
create trigger touch_gpm_records_updated_at
before update on public.gpm_records
for each row execute function public.touch_updated_at();

create or replace function public.replace_gpm_collection(collection_name text, records jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_profile text;
begin
  select profile
  into user_profile
  from public.user_profiles
  where auth_user_id = auth.uid()
    and status = 'Ativo'
  limit 1;

  if user_profile is null or user_profile = 'Cliente' then
    raise exception 'Sem permissão para sincronizar dados do GPM.';
  end if;

  delete from public.gpm_records
  where collection = collection_name
    and record_id not in (
      select item->>'record_id'
      from jsonb_array_elements(records) item
    );

  insert into public.gpm_records (collection, record_id, payload)
  select
    item->>'collection',
    item->>'record_id',
    item->'payload'
  from jsonb_array_elements(records) item
  on conflict (collection, record_id) do update
  set payload = excluded.payload,
      updated_at = now();
end;
$$;

alter table public.user_profiles enable row level security;
alter table public.gpm_records enable row level security;

drop policy if exists "read own profile" on public.user_profiles;
create policy "read own profile"
on public.user_profiles
for select
to authenticated
using (auth.uid() = auth_user_id);

drop policy if exists "admin reads all profiles" on public.user_profiles;
create policy "admin reads all profiles"
on public.user_profiles
for select
to authenticated
using (exists (select 1 from public.current_gpm_profile() current_profile where current_profile.profile = 'Administrador'));

drop policy if exists "update own last access" on public.user_profiles;
create policy "update own last access"
on public.user_profiles
for update
to authenticated
using (auth.uid() = auth_user_id)
with check (auth.uid() = auth_user_id);

drop policy if exists "read gpm records by profile" on public.gpm_records;
create policy "read gpm records by profile"
on public.gpm_records
for select
to authenticated
using (
  exists (
    select 1
    from public.current_gpm_profile() current_profile
    where (
        current_profile.profile <> 'Cliente'
        or (
          current_profile.profile = 'Cliente'
          and (
            (collection = 'clients' and record_id = current_profile.linked_client_id)
            or (collection = 'motors' and payload->>'clientId' = current_profile.linked_client_id)
            or (collection = 'orders' and payload->>'clientId' = current_profile.linked_client_id)
            or collection in ('history')
          )
        )
      )
  )
);

drop policy if exists "write gpm records by internal profile" on public.gpm_records;
create policy "write gpm records by internal profile"
on public.gpm_records
for all
to authenticated
using (
  exists (
    select 1
    from public.current_gpm_profile() current_profile
    where current_profile.profile <> 'Cliente'
  )
)
with check (
  exists (
    select 1
    from public.current_gpm_profile() current_profile
    where current_profile.profile <> 'Cliente'
  )
);

grant usage on schema public to anon, authenticated;
grant select on public.user_profiles to authenticated;
grant update (last_access) on public.user_profiles to authenticated;
grant select, insert, update, delete on public.gpm_records to authenticated;
grant execute on function public.resolve_login_email(text) to anon, authenticated;
grant execute on function public.current_gpm_profile() to authenticated;
grant execute on function public.replace_gpm_collection(text, jsonb) to authenticated;

-- Depois de criar o usuário admin@gmail.com em Authentication > Users com senha 123456,
-- rode este bloco para vincular o perfil inicial usado pelo frontend.
delete from public.user_profiles
where email in (
  'admin@gpm.com',
  'adm@gpm.com',
  'mecanica@gpm.com',
  'usinagem@gpm.com',
  'eletrica@gpm.com',
  'gestor@gpm.com',
  'cliente@gpm.com'
);

insert into public.user_profiles (auth_user_id, name, email, login, profile, sector, status)
select id, 'Carla Andrade', email, 'admin', 'Administrador', 'Gestão', 'Ativo'
from auth.users
where email = 'admin@gmail.com'
on conflict (email) do update set
  auth_user_id = excluded.auth_user_id,
  login = excluded.login,
  profile = excluded.profile,
  sector = excluded.sector,
  status = excluded.status;
