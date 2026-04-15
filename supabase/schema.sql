-- Scout: Property Management + Deal Hunter
-- Run this in Supabase SQL editor

-- Structures (buildings/areas on the 100 acres)
create table structures (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('house', 'cabin', 'portable', 'shed', 'campsite', 'pool', 'forest', 'other')),
  status text not null default 'untouched' check (status in ('untouched', 'in_progress', 'ready', 'revenue')),
  notes text,
  priority int default 3 check (priority between 1 and 5),
  lat float,
  lng float,
  cover_photo text,
  created_at timestamptz default now()
);

-- Rooms within a structure
create table rooms (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  name text not null,
  notes text,
  ai_description text,
  photos text[] default '{}',
  created_at timestamptz default now()
);

-- Work orders (tasks per structure)
create table work_orders (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  category text check (category in ('cleaning', 'repair', 'paint', 'electrical', 'plumbing', 'inspection', 'landscaping', 'other')),
  estimated_cost numeric,
  actual_cost numeric,
  assigned_to text,
  due_date date,
  photos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Wishlist: things you're hunting for
create table wishlist_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text check (category in ('furniture', 'appliance', 'lighting', 'bedding', 'decor', 'tools', 'cleaning', 'outdoor', 'other')),
  max_price numeric,
  radius_km int default 50,
  notes text,
  room_id uuid references rooms(id),
  active boolean default true,
  created_at timestamptz default now()
);

-- Scraped listings from all sources
create table listings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('kijiji', 'craigslist', 'facebook', 'homedepot', 'ikea', 'walmart', 'rona', 'wayfair', 'flipp', 'redflagdeals', 'other')),
  external_id text,
  title text not null,
  description text,
  price numeric,
  location text,
  distance_km numeric,
  url text,
  photos text[] default '{}',
  ai_score int check (ai_score between 1 and 10),
  ai_verdict text,
  ai_match_notes text,
  status text default 'new' check (status in ('new', 'saved', 'dismissed', 'purchased')),
  wishlist_item_id uuid references wishlist_items(id),
  raw_data jsonb,
  scraped_at timestamptz default now(),
  unique(source, external_id)
);

-- Enable RLS (open for now since it's just you two)
alter table structures enable row level security;
alter table rooms enable row level security;
alter table work_orders enable row level security;
alter table wishlist_items enable row level security;
alter table listings enable row level security;

-- Open policies (no auth needed for now)
create policy "allow all" on structures for all using (true) with check (true);
create policy "allow all" on rooms for all using (true) with check (true);
create policy "allow all" on work_orders for all using (true) with check (true);
create policy "allow all" on wishlist_items for all using (true) with check (true);
create policy "allow all" on listings for all using (true) with check (true);

-- Seed: Camp Ma-Kee-Wa structures
insert into structures (name, type, status, priority, notes) values
  ('Makeewa Farmhouse', 'house', 'in_progress', 1, 'Main house — first priority, getting BnB ready'),
  ('North Cabin', 'cabin', 'untouched', 2, 'Smaller cabin, assess after farmhouse'),
  ('Camp Portables', 'portable', 'untouched', 3, 'Multiple portables left from Girl Guides era'),
  ('Tool Shed', 'shed', 'untouched', 4, 'Storage and tools'),
  ('Pool Area', 'pool', 'untouched', 3, 'Pool — needs inspection and likely deep clean'),
  ('Forest Trails', 'forest', 'untouched', 5, '100 acres of forest and trails'),
  ('Camp Sites', 'campsite', 'untouched', 3, 'Open camping areas');
