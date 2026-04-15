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
  zone_id uuid,
  title text not null,
  description text,
  priority text default 'medium' check (priority in ('urgent', 'high', 'medium', 'low')),
  status text default 'todo' check (status in ('todo', 'in_progress', 'done', 'blocked')),
  category text check (category in ('cleaning', 'repair', 'paint', 'electrical', 'plumbing', 'inspection', 'landscaping', 'other')),
  benefit_tag text default 'both' check (benefit_tag in ('sale_helpful', 'guest_helpful', 'both')),
  confidence_level text default 'verified_by_owner' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  estimated_cost numeric,
  actual_cost numeric,
  assigned_to text,
  due_date date,
  photos text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Grounds or experience zones
create table grounds_zones (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  name text not null,
  type text not null check (type in ('arrival', 'outdoor_experience', 'trail', 'parking', 'service', 'storage', 'recreation', 'pool', 'boundary', 'other')),
  condition text default 'unknown' check (condition in ('excellent', 'good', 'fair', 'rough', 'unsafe', 'unknown')),
  status text default 'inactive' check (status in ('inactive', 'candidate', 'active', 'blocked')),
  activated boolean default false,
  notes text,
  confidence_level text default 'public_reference_inference' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  created_at timestamptz default now()
);

-- Building and site utilities
create table utilities (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  name text not null,
  category text not null check (category in ('power', 'water', 'septic', 'heat', 'internet', 'lighting', 'security', 'other')),
  status text default 'unknown' check (status in ('working', 'partial', 'offline', 'unknown', 'needs_review')),
  notes text,
  last_checked_at timestamptz,
  confidence_level text default 'unknown' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  created_at timestamptz default now()
);

-- Hazards that can block sale or guest activation
create table hazards (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  zone_id uuid references grounds_zones(id) on delete cascade,
  title text not null,
  severity text default 'medium' check (severity in ('low', 'medium', 'high', 'critical')),
  status text default 'open' check (status in ('open', 'monitoring', 'mitigated', 'closed')),
  notes text,
  confidence_level text default 'verified_by_owner' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  created_at timestamptz default now()
);

-- Compliance tracking for sale and STR readiness
create table compliance_checks (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  zone_id uuid references grounds_zones(id) on delete cascade,
  category text not null check (category in ('zoning', 'fire_safety', 'building', 'septic', 'water', 'insurance', 'tax', 'burn_permit', 'listing_accuracy', 'other')),
  title text not null,
  status text default 'unknown' check (status in ('unknown', 'not_started', 'in_progress', 'review_needed', 'pass', 'fail')),
  notes text,
  due_date date,
  confidence_level text default 'public_reference_inference' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  created_at timestamptz default now()
);

-- Photos, walkthroughs, and linked evidence
create table media_evidence (
  id uuid primary key default gen_random_uuid(),
  structure_id uuid references structures(id) on delete cascade,
  zone_id uuid references grounds_zones(id) on delete cascade,
  room_id uuid references rooms(id) on delete cascade,
  title text not null,
  type text not null check (type in ('listing_photo', 'walkthrough_video', 'site_photo', 'document', 'map', 'note', 'other')),
  url text,
  notes text,
  confidence_level text default 'verified_from_listing' check (confidence_level in ('verified_on_site', 'verified_by_owner', 'verified_from_listing', 'public_reference_inference', 'unknown')),
  created_at timestamptz default now()
);

alter table work_orders
  add constraint work_orders_zone_id_fkey
  foreign key (zone_id) references grounds_zones(id) on delete set null;

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
alter table grounds_zones enable row level security;
alter table utilities enable row level security;
alter table hazards enable row level security;
alter table compliance_checks enable row level security;
alter table media_evidence enable row level security;
alter table wishlist_items enable row level security;
alter table listings enable row level security;

-- Open policies (no auth needed for now)
create policy "allow all" on structures for all using (true) with check (true);
create policy "allow all" on rooms for all using (true) with check (true);
create policy "allow all" on work_orders for all using (true) with check (true);
create policy "allow all" on grounds_zones for all using (true) with check (true);
create policy "allow all" on utilities for all using (true) with check (true);
create policy "allow all" on hazards for all using (true) with check (true);
create policy "allow all" on compliance_checks for all using (true) with check (true);
create policy "allow all" on media_evidence for all using (true) with check (true);
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

insert into grounds_zones (structure_id, name, type, condition, status, activated, notes, confidence_level)
select id, 'Arrival & Parking', 'arrival', 'fair', 'candidate', false, 'First guest impression zone. Keep clean, clear, and easy to explain for showings.', 'verified_by_owner'
from structures where name = 'Makeewa Farmhouse';

insert into grounds_zones (structure_id, name, type, condition, status, activated, notes, confidence_level)
select id, 'Main Firepit Candidate', 'outdoor_experience', 'rough', 'candidate', false, 'High ROI outdoor experience if cleared, stabilized, and safe.', 'public_reference_inference'
from structures where name = 'Makeewa Farmhouse';

insert into utilities (structure_id, name, category, status, notes, confidence_level)
select id, 'Farmhouse Well Water', 'water', 'unknown', 'Need water quality, pressure, and winter reliability confirmed.', 'public_reference_inference'
from structures where name = 'Makeewa Farmhouse';

insert into utilities (structure_id, name, category, status, notes, confidence_level)
select id, 'Farmhouse Septic', 'septic', 'unknown', 'Document capacity, current condition, and any guest-load constraints.', 'public_reference_inference'
from structures where name = 'Makeewa Farmhouse';

insert into utilities (structure_id, name, category, status, notes, confidence_level)
select id, 'Farmhouse Heat', 'heat', 'unknown', 'Confirm safe, reliable heating before any cold-season use.', 'verified_by_owner'
from structures where name = 'Makeewa Farmhouse';

insert into hazards (structure_id, title, severity, status, notes, confidence_level)
select id, 'Unknown life-safety baseline', 'critical', 'open', 'Do not assume smoke alarms, CO alarms, locks, stairs, or egress are guest-ready.', 'public_reference_inference'
from structures where name = 'Makeewa Farmhouse';

insert into compliance_checks (structure_id, category, title, status, notes, confidence_level)
select id, 'fire_safety', 'Smoke and CO alarm coverage confirmed', 'not_started', 'Need alarm placement and testing logged before activation.', 'public_reference_inference'
from structures where name = 'Makeewa Farmhouse';

insert into compliance_checks (structure_id, category, title, status, notes, confidence_level)
select id, 'listing_accuracy', 'First launch structure is truthfully represented', 'not_started', 'Do not list any feature or amenity without evidence and current verification.', 'verified_by_owner'
from structures where name = 'Makeewa Farmhouse';

insert into media_evidence (structure_id, title, type, notes, confidence_level)
select id, 'Full sale listing photo set', 'document', 'Attach source set for room-by-room and zone-by-zone review.', 'verified_from_listing'
from structures where name = 'Makeewa Farmhouse';
