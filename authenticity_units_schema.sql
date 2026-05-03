create table if not exists public.product_auth_units (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  serial_number integer not null,
  public_unit_id text not null unique,
  authenticity_code text not null unique,
  status text not null default 'available' check (status in ('available', 'assigned', 'archived')),
  order_id uuid references public.orders(id) on delete set null,
  assigned_to_email text,
  assigned_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, serial_number)
);

alter table public.product_auth_units
  add column if not exists order_id uuid references public.orders(id) on delete set null;

alter table public.product_auth_units
  add column if not exists assigned_to_email text;

alter table public.product_auth_units
  add column if not exists assigned_at timestamptz;

create index if not exists idx_product_auth_units_product_id
  on public.product_auth_units(product_id);

create index if not exists idx_product_auth_units_public_unit_id
  on public.product_auth_units(public_unit_id);

alter table public.product_auth_units enable row level security;

drop policy if exists "Public can read product authenticity units" on public.product_auth_units;
create policy "Public can read product authenticity units"
  on public.product_auth_units
  for select
  using (true);

drop policy if exists "Authenticated users can manage product authenticity units" on public.product_auth_units;
create policy "Authenticated users can manage product authenticity units"
  on public.product_auth_units
  for all
  to authenticated
  using (true)
  with check (true);
