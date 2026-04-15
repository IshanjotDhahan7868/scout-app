-- Scout Playbook Seed
-- Run this AFTER schema.sql in the Supabase SQL editor.
-- Pre-loads Phase 1 tasks for the Makeewa Farmhouse so the app arrives ready to use.

do $$
declare
  farmhouse_id uuid;
begin
  select id into farmhouse_id from structures where name = 'Makeewa Farmhouse' limit 1;

  if farmhouse_id is null then
    raise notice 'Farmhouse not found — run schema.sql first';
    return;
  end if;

  insert into work_orders (structure_id, title, description, priority, category, status) values

  -- ── SAFETY FIRST (urgent) ──────────────────────────────────────────────
  (farmhouse_id,
   'Install smoke detectors in every room',
   'Ontario law requires a working smoke alarm on every storey and outside every sleeping area. Battery or hardwired. Test them all. This is a legal requirement before anyone sleeps here — you cannot skip it.',
   'urgent', 'inspection', 'todo'),

  (farmhouse_id,
   'Install carbon monoxide detectors',
   'Required by Ontario law in any home with a fuel-burning appliance (gas stove, furnace, fireplace) or attached garage. One per floor minimum. Combo smoke/CO detectors count.',
   'urgent', 'inspection', 'todo'),

  (farmhouse_id,
   'Find and mark the electrical panel',
   'Locate the breaker box, make sure all breakers are labelled, and check for any tripped breakers or signs of burning. If the panel is old (Federal Pioneer, Stab-Lok brand), flag it — these are a known fire risk.',
   'urgent', 'electrical', 'todo'),

  (farmhouse_id,
   'Locate and test the water shutoff valve',
   'Know where the main water shutoff is before anything goes wrong. Turn it off and back on to confirm it works. Old properties often have seized shutoffs that need replacing.',
   'urgent', 'plumbing', 'todo'),

  (farmhouse_id,
   'Check for active water leaks',
   'Walk every room looking for stains on ceilings, walls, and under sinks. Check the basement for water marks. Active leaks will cause mould fast — fix before anything cosmetic.',
   'urgent', 'plumbing', 'todo'),

  (farmhouse_id,
   'Test all exterior door and window locks',
   'Every door and window that opens must lock properly. Guest safety and insurance requirement. Replace or repair anything that doesn''t latch securely.',
   'urgent', 'repair', 'todo'),

  -- ── DEEP CLEAN (high) ─────────────────────────────────────────────────
  (farmhouse_id,
   'Full kitchen deep clean',
   'Empty all cabinets, wipe shelves, clean inside the oven, degrease the stovetop, scrub the sink, clean behind the fridge and stove. Guests inspect kitchens. This one matters.',
   'high', 'cleaning', 'todo'),

  (farmhouse_id,
   'Deep clean all bathrooms',
   'Scrub tiles, grout, toilet (inside tank too), under the sink, behind the toilet. Check for mould around the tub/shower seal — re-caulk if needed. Clean the exhaust fan.',
   'high', 'cleaning', 'todo'),

  (farmhouse_id,
   'Clear out all left-behind items',
   'Remove everything the previous owners/Girl Guides left. Every closet, shelf, storage area. Donate, trash, or store off-site. You need to see the bones of each room clearly.',
   'high', 'cleaning', 'todo'),

  (farmhouse_id,
   'Power wash exterior and entry',
   'First impression. Power wash the front of the house, walkway, and entry area. Rental units at Home Depot are ~$60/day. Makes a dramatic difference in photos and first arrival.',
   'high', 'cleaning', 'todo'),

  (farmhouse_id,
   'Clean all windows inside and out',
   'Natural light is one of your biggest free upgrades. Clean windows make rooms look bigger and newer in listing photos.',
   'high', 'cleaning', 'todo'),

  -- ── REPAIRS (high) ────────────────────────────────────────────────────
  (farmhouse_id,
   'Patch and paint any damaged walls',
   'Walk every wall looking for holes, cracks, water stains, peeling paint. Patch with spackle (dollar store), sand, prime, and paint. You can do this yourselves — YouTube "drywall patch" and it takes 30 min per spot.',
   'high', 'repair', 'todo'),

  (farmhouse_id,
   'Fix any sticking or broken doors',
   'Interior doors that stick, squeak, or won''t latch read as "neglected" to guests. Sand the edge, tighten hinges, or replace the latch. 15 min fix.',
   'high', 'repair', 'todo'),

  (farmhouse_id,
   'Replace burnt out lightbulbs',
   'Every socket should work. Buy a pack of warm white LED bulbs (~2700K). Avoid cool white — it feels clinical. This is a $30 fix that changes the whole feel of a room.',
   'high', 'repair', 'todo'),

  (farmhouse_id,
   'Check heating system works',
   'Turn on the heat and confirm it reaches every room. Bleed radiators if needed (water comes out first, then air). Know what type of heating the house has: forced air, baseboard, radiant, or oil.',
   'high', 'repair', 'todo'),

  -- ── FURNISHING (medium) ───────────────────────────────────────────────
  (farmhouse_id,
   'Measure every bedroom and note bed sizes needed',
   'Before buying anything, measure rooms and decide: is this a queen room, twin room, or flex? Minimum BnB bedroom: queen bed + nightstand + lamp + some storage. Write the sizes down.',
   'medium', 'other', 'todo'),

  (farmhouse_id,
   'Set up at least one fully functional bedroom',
   'One complete bedroom: bed frame + mattress + mattress protector + pillow protector + pillows + fitted sheet + flat sheet + duvet + duvet cover. Get this one right before touching others.',
   'medium', 'other', 'todo'),

  (farmhouse_id,
   'Stock the kitchen with BnB basics',
   'Minimum: kettle, coffee maker, toaster, a pot, a pan, a baking dish, plates/bowls/mugs for max guests + 2, cutlery for max guests + 2, wine glasses, cutting board, knife, dish soap, sponge.',
   'medium', 'other', 'todo'),

  (farmhouse_id,
   'Set up bathroom guest supplies',
   'Each bathroom needs: toilet paper (leave 3 rolls), hand soap, shampoo + conditioner, body wash, clean towels (2 per guest), a bath mat, a mirror with good lighting.',
   'medium', 'other', 'todo'),

  (farmhouse_id,
   'Get a smart lock or lockbox installed',
   'Eliminates key handoff. Smart lock (August, Schlage) lets you text a code at booking — codes expire at checkout. Lockbox works too. This is how self-check-in works and it''s expected on Airbnb.',
   'medium', 'repair', 'todo'),

  (farmhouse_id,
   'Set up strong WiFi and write down the password',
   'Get a router that reaches the whole house. Guests rate WiFi almost as much as cleanliness. Post the network name and password somewhere visible in the kitchen or entry.',
   'medium', 'repair', 'todo'),

  -- ── COMPLIANCE / REGISTRATION (medium) ───────────────────────────────
  (farmhouse_id,
   'Research Ontario STR zoning rules for your address',
   'Short-term rental (under 28 nights) rules vary by municipality. Check with Adjala-Tosorontio Township (your local municipality) if a permit is needed. Most rural Ontario areas are more permissive than Toronto, but verify.',
   'medium', 'inspection', 'todo'),

  (farmhouse_id,
   'Get property and liability insurance',
   'Your regular home insurance does NOT cover paying guests. You need short-term rental insurance or a landlord policy. Airbnb provides $3M host protection but you still want your own coverage. Call your insurer.',
   'medium', 'inspection', 'todo'),

  (farmhouse_id,
   'Check septic system status',
   'If on septic (not city sewage), confirm when it was last pumped. Should be every 3-5 years. A full septic can back up — especially with more guests than usual. Call a local septic company for inspection.',
   'medium', 'inspection', 'todo'),

  -- ── STAGING + PHOTOS (low) ────────────────────────────────────────────
  (farmhouse_id,
   'Add a few cozy touches to each room',
   'Throw blanket on the couch. A plant (fake is fine). A candle or two. A framed print. These cost almost nothing from thrift stores and they''re what make listing photos pop. Guests book vibes.',
   'low', 'other', 'todo'),

  (farmhouse_id,
   'Take listing photos on a sunny day',
   'Natural light only. Open all blinds. No flash. Shoot from corners to make rooms look bigger. Take: exterior front, living room, each bedroom, kitchen, bathroom, any outdoor space. Morning light is best.',
   'low', 'other', 'todo'),

  (farmhouse_id,
   'Write your Airbnb listing description',
   'Be honest and specific. Highlight the camp history — guests love a story. Mention: sleeps X, bedroom setup, kitchen access, outdoor space, proximity to Orangeville, Palgrave, trails. What makes this place different from a hotel.',
   'low', 'other', 'todo');

end $$;

-- Pre-load wishlist items (common BnB furnishing needs)
insert into wishlist_items (name, category, max_price, radius_km, notes) values
  ('Queen bed frame', 'furniture', 150, 75, 'Metal or wood, no headboard required. Just sturdy.'),
  ('Queen mattress', 'furniture', 300, 75, 'Firm or medium. Must be clean — no stains. Mattress protector goes on top anyway.'),
  ('Dining table', 'furniture', 200, 75, 'Seats at least 4. Kitchen table style or farmhouse.'),
  ('Dining chairs', 'furniture', 100, 75, 'Set of 4. Matching or mix-and-match rustic is fine.'),
  ('Couch or sofa', 'furniture', 250, 75, 'Clean, no major damage. Neutral colour preferred.'),
  ('Coffee table', 'furniture', 80, 75, 'Any style. Just solid and no wobbly legs.'),
  ('Dressers', 'furniture', 100, 75, 'For each bedroom. Drawers must open. No broken handles.'),
  ('Lamps', 'lighting', 40, 60, 'Floor or table lamps. Warm bulb included ideally.'),
  ('Towels', 'bedding', 50, 50, 'Sets of 4+. White or neutral. Must be clean with no stains.'),
  ('Bedding sets', 'bedding', 80, 60, 'Duvet + cover + pillowcases. Neutral/white preferred.'),
  ('Curtains or blinds', 'decor', 60, 60, 'Blackout preferred for bedrooms. Any colour.'),
  ('Kitchen appliances', 'appliance', 100, 75, 'Kettle, toaster, coffee maker — any or all.'),
  ('Cleaning supplies bundle', 'cleaning', 50, 40, 'Mop, broom, vacuum, spray bottles, gloves, cloths.')
on conflict do nothing;
