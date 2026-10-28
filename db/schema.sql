-- Server-only tables. No direct access through Supabase's public Data API.
create schema if not exists cybergarden;
revoke all on schema cybergarden from public, anon, authenticated;
create table if not exists cybergarden.pages (
  id text primary key,
  document jsonb not null,
  revision bigint not null default 1,
  updated_at timestamptz not null default now()
);
create table if not exists cybergarden.runtime (
  id text primary key,
  ciphertext text not null,
  updated_at timestamptz not null default now()
);
alter table cybergarden.pages enable row level security;
alter table cybergarden.runtime enable row level security;
revoke all on all tables in schema cybergarden from public, anon, authenticated;
