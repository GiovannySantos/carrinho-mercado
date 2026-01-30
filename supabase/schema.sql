-- Extensions
create extension if not exists pgcrypto;

-- CARTS
create table if not exists public.carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  status text not null default 'OPEN' check (status in ('OPEN','CLOSED')),
  notes text,
  total_cents int not null default 0,
  items_count int not null default 0,
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create unique index if not exists carts_user_date_uq on public.carts(user_id, date);
create index if not exists carts_user_month_idx on public.carts(user_id, date);

-- ITEMS
create table if not exists public.items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references public.carts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  product_name text not null,
  product_key text not null,
  category text,
  store text,
  brand text,
  quantity numeric(10,3) not null,
  quantity_type text not null default 'UNIT' check (quantity_type in ('UNIT','WEIGHT')),
  unit_price_cents int not null,
  total_cents int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  client_updated_at timestamptz not null default now()
);

create index if not exists items_cart_idx on public.items(cart_id);
create index if not exists items_user_product_idx on public.items(user_id, product_key);
create index if not exists items_user_created_idx on public.items(user_id, created_at);

-- PRICE HISTORY
create table if not exists public.price_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_key text not null,
  date date not null,
  store text,
  unit_price_cents int not null,
  created_at timestamptz not null default now()
);

create index if not exists price_history_user_product_date_idx
  on public.price_history(user_id, product_key, date);

-- updated_at trigger for items
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists trg_items_updated_at on public.items;
create trigger trg_items_updated_at
before update on public.items
for each row execute function public.set_updated_at();

-- RLS
alter table public.carts enable row level security;
alter table public.items enable row level security;
alter table public.price_history enable row level security;

-- Policies - carts
drop policy if exists "carts_select_own" on public.carts;
create policy "carts_select_own"
on public.carts for select
using (user_id = auth.uid());

drop policy if exists "carts_insert_own" on public.carts;
create policy "carts_insert_own"
on public.carts for insert
with check (user_id = auth.uid());

drop policy if exists "carts_update_own" on public.carts;
create policy "carts_update_own"
on public.carts for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "carts_delete_own" on public.carts;
create policy "carts_delete_own"
on public.carts for delete
using (user_id = auth.uid());

-- Policies - items
drop policy if exists "items_select_own" on public.items;
create policy "items_select_own"
on public.items for select
using (user_id = auth.uid());

drop policy if exists "items_insert_own" on public.items;
create policy "items_insert_own"
on public.items for insert
with check (user_id = auth.uid());

drop policy if exists "items_update_own" on public.items;
create policy "items_update_own"
on public.items for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "items_delete_own" on public.items;
create policy "items_delete_own"
on public.items for delete
using (user_id = auth.uid());

-- Policies - price_history
drop policy if exists "ph_select_own" on public.price_history;
create policy "ph_select_own"
on public.price_history for select
using (user_id = auth.uid());

drop policy if exists "ph_insert_own" on public.price_history;
create policy "ph_insert_own"
on public.price_history for insert
with check (user_id = auth.uid());

drop policy if exists "ph_update_own" on public.price_history;
create policy "ph_update_own"
on public.price_history for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "ph_delete_own" on public.price_history;
create policy "ph_delete_own"
on public.price_history for delete
using (user_id = auth.uid());
