-- Dranbleiben — Datenbank-Setup für den Geräte-Sync
-- Im Supabase-Dashboard unter "SQL Editor" einfügen und ausführen.

-- Eine Zeile pro Nutzer: der komplette App-Zustand als JSON.
create table if not exists public.vaults (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb       not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- Row Level Security: jeder sieht und ändert AUSSCHLIESSLICH die eigene Zeile.
alter table public.vaults enable row level security;

drop policy if exists "eigene Zeile lesen"     on public.vaults;
drop policy if exists "eigene Zeile anlegen"   on public.vaults;
drop policy if exists "eigene Zeile aendern"   on public.vaults;

create policy "eigene Zeile lesen" on public.vaults
  for select using (auth.uid() = user_id);

create policy "eigene Zeile anlegen" on public.vaults
  for insert with check (auth.uid() = user_id);

create policy "eigene Zeile aendern" on public.vaults
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at automatisch mitführen (wird für die Konflikt-Auflösung gebraucht).
create or replace function public.vaults_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists vaults_touch on public.vaults;
create trigger vaults_touch before update on public.vaults
  for each row execute function public.vaults_touch();
