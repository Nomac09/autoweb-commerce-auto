-- AUTOWEB COMMERCE — initial schema
-- Cars inventory: public read-only, writes reserved to service role.

-- Vehicle status (enum, not boolean — future-proofs "reserved")
do $$
begin
  if not exists (select 1 from pg_type where typname = 'car_status') then
    create type car_status as enum ('available', 'sold', 'reserved');
  end if;
end$$;

create table if not exists public.cars (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  make            text not null,
  model           text not null,
  version         text,
  year            int  not null,
  color           text,
  fuel            text,
  gearbox         text,
  mileage_km      int,
  power_hp        int,
  power_kw        int,
  doors           int,
  seats           int,
  price_eur       int,
  -- true = fair-market estimate (never a real sale price); false = owner-confirmed price
  price_estimated boolean not null default false,
  status          car_status not null default 'available',
  ct_valid_until  date,
  registration_date text,
  options         text[] not null default '{}',
  photos          text[] not null default '{}',
  sort_order      int not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists cars_status_idx on public.cars (status);
create index if not exists cars_sort_idx   on public.cars (sort_order asc, created_at desc);

-- Row Level Security: anyone may read, nobody may write with the anon key.
alter table public.cars enable row level security;

drop policy if exists "public read cars" on public.cars;
create policy "public read cars"
  on public.cars for select
  using (true);

-- Public storage bucket for car photos.
insert into storage.buckets (id, name, public)
values ('cars', 'cars', true)
on conflict (id) do update set public = true;

drop policy if exists "public read car photos" on storage.objects;
create policy "public read car photos"
  on storage.objects for select
  using (bucket_id = 'cars');
