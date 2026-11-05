-- Esquema del catálogo del menú drive-thru
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(8,2) not null check (price >= 0),
  image_url text,
  category text not null check (category in
    ('bebida_fria','bebida_caliente','cafe','frappe','desayuno','postre','snack')),
  temperature text check (temperature in ('fria','caliente')),
  tags text[] not null default '{}',
  emoji text not null default '🍽️',
  available boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;

-- Lectura pública (anon) solo de productos disponibles; sin escritura desde el cliente.
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated
  using (available = true);
