'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'

type Step = {
  title: string
  why: string
  how: string
  time: string
  cost: string
  link?: string
}

type Phase = {
  id: string
  phase: string
  title: string
  subtitle: string
  emoji: string
  color: string
  steps: Step[]
}

const PHASES: Phase[] = [
  {
    id: 'safety',
    phase: 'Phase 1',
    title: 'Safety first',
    subtitle: 'Before anyone sleeps here, these are legal requirements',
    emoji: '🔥',
    color: '#DC2626',
    steps: [
      {
        title: 'Smoke detectors on every floor + outside every bedroom',
        why: 'Ontario law. Non-negotiable. Airbnb will ask you to confirm this before listing.',
        how: 'Buy battery-operated smoke alarms at Home Depot (~$15 each). Mount on ceiling, 5cm from the wall. Test by pressing the button. You need one per storey plus outside each sleeping area.',
        time: '2 hours',
        cost: '$15–30',
      },
      {
        title: 'Carbon monoxide detector on every floor',
        why: 'Also Ontario law if you have gas appliances, a furnace, a fireplace, or an attached garage. CO is odourless — guests die from this. This is not optional.',
        how: 'Combo smoke/CO detectors count. Mount at knee height (CO is heavy). One per floor minimum.',
        time: '1 hour',
        cost: '$25–40',
      },
      {
        title: 'Test every door lock and window latch',
        why: 'Guest safety and basic insurance requirement. A guest who can\'t lock their room is a 1-star review and a liability.',
        how: 'Go room to room. Every exterior door must deadbolt. Every window must latch. Replace or repair anything loose.',
        time: '1–2 hours',
        cost: '$0–50',
      },
      {
        title: 'Find and photograph the breaker panel',
        why: 'When something trips (and it will), guests need to know where it is. Old panels (Stab-Lok, Federal Pacific) are also a known fire risk — flag these for an electrician.',
        how: 'Open the panel. Label every breaker if they aren\'t already. Take a photo. Leave a laminated copy near the panel.',
        time: '1 hour',
        cost: '$0',
      },
      {
        title: 'Check for active water leaks',
        why: 'Water damage creates mould within 48 hours. Fix leaks before you paint a single wall — cosmetics over a leak is wasted money.',
        how: 'Look for brown stains on ceilings, bubbling paint on walls, wet spots under sinks and around toilets. Check the basement floor for water marks.',
        time: '1–2 hours',
        cost: '$0 to inspect',
      },
    ]
  },
  {
    id: 'clean',
    phase: 'Phase 2',
    title: 'Deep clean',
    subtitle: 'This is where the transformation starts — it\'s cheaper than renovation',
    emoji: '🧹',
    color: '#7C5C3A',
    steps: [
      {
        title: 'Clear out everything left behind',
        why: 'You cannot see what a room can become until it\'s empty. Old stuff left by Girl Guides is clutter in your listing photos and in your head.',
        how: 'Rent a truck or borrow one. Go room by room: keep, donate, trash. Facebook Marketplace and Kijiji are good for offloading furniture fast. Take before photos of everything first.',
        time: '1–2 days',
        cost: '$0–100 for truck rental',
      },
      {
        title: 'Power wash the outside and the entry',
        why: 'First impression. Listing photos. A power-washed house looks like a renovated house. This is the highest-impact thing you can do per dollar.',
        how: 'Rent from Home Depot (~$60/day). Do the front face of the house, walkway, porch, and any patios. Do it on a sunny day for photos the same afternoon.',
        time: '3–4 hours',
        cost: '$60',
      },
      {
        title: 'Kitchen deep clean',
        why: 'Guests inspect kitchens. A dirty kitchen is an instant 1-star review. This one matters more than almost anything else.',
        how: 'Empty every cabinet. Wipe shelves with TSP cleaner. Oven: use oven cleaner overnight, wipe in the morning. Degrease the stovetop burners. Scrub the sink with Bar Keepers Friend. Pull out the fridge and sweep behind it.',
        time: '4–6 hours',
        cost: '$20 in supplies',
      },
      {
        title: 'Bathroom deep clean + re-caulk',
        why: 'Mouldy grout and bad caulk are guest deal-breakers in photos. Re-caulking is a $10 fix that makes a bathroom look renovated.',
        how: 'Scrub grout with a toothbrush and bleach cleaner. Remove old caulk around the tub with a razor blade, dry completely, apply new silicone caulk in one clean bead. Clean inside the toilet tank.',
        time: '3–4 hours',
        cost: '$15–30',
      },
      {
        title: 'Clean all windows',
        why: 'Natural light is the cheapest upgrade you have. Clean windows make rooms look bigger and brighter in photos.',
        how: 'Newspaper + Windex still works great. Do inside and outside. Clean the sills and tracks too.',
        time: '2–3 hours',
        cost: '$5',
      },
    ]
  },
  {
    id: 'repairs',
    phase: 'Phase 3',
    title: 'Basic repairs',
    subtitle: 'Fix the things that say "neglected" — most take under an hour',
    emoji: '🔧',
    color: '#2B5A3E',
    steps: [
      {
        title: 'Patch and paint damaged walls',
        why: 'Holes and cracks in walls are the #1 thing that makes a property look run-down in photos. This is a DIY job that takes 30 minutes per hole.',
        how: 'Buy pre-mixed spackle (dollar store), a putty knife, sandpaper (120 grit), primer, and matching paint. Fill hole → let dry → sand smooth → prime → paint. YouTube "drywall patch" for technique. One room: half a day.',
        time: '1 day for most rooms',
        cost: '$30–80 in supplies',
      },
      {
        title: 'Replace every lightbulb with warm white LED',
        why: 'Burnt out bulbs in listing photos are an instant red flag. Warm white (2700K) makes rooms feel cozy. Cool white (5000K) feels like a hospital.',
        how: 'Buy a 10-pack of 2700K LED bulbs. Replace everything. Check lamps, ceiling fixtures, the fridge interior, the bathroom vanity.',
        time: '1 hour',
        cost: '$20–30',
      },
      {
        title: 'Fix any sticking or squeaking doors',
        why: 'Small things read as "nobody cares about this property." They take 15 minutes to fix.',
        how: 'Squeaky hinge: remove pin, coat with petroleum jelly, replace. Sticking door: rub the sticking edge with a candle or sand it. Door doesn\'t latch: tighten hinges first, or chisel the strike plate slightly.',
        time: '30 min per door',
        cost: '$0–10',
      },
      {
        title: 'Confirm heating works in every room',
        why: 'A cold room in November is a 1-star review. Find out what heating you have (forced air, baseboard, radiators, oil) and test it before guests arrive.',
        how: 'Turn the thermostat up and walk every room. If you have radiators, bleed them: use a radiator key ($3), open the valve until you hear hissing, then water, then close it. If nothing heats, call an HVAC tech.',
        time: '1–2 hours',
        cost: '$0 to test',
      },
    ]
  },
  {
    id: 'furnish',
    phase: 'Phase 4',
    title: 'Furnish & stage',
    subtitle: 'What every room needs to be guest-ready — nothing more',
    emoji: '🛏️',
    color: '#4A6741',
    steps: [
      {
        title: 'Bedroom minimum: bed + nightstand + lamp + storage',
        why: 'Guests sleep here. They need to charge a phone, see at night, and put clothes somewhere. That\'s it. Don\'t over-think it.',
        how: 'Queen bed frame + mattress + mattress protector + pillow covers + 2 pillows + fitted sheet + flat sheet + duvet + cover. Get a nightstand (Kijiji is perfect for this) and a lamp. Add a dresser or at least a luggage rack.',
        time: '1 day to set up',
        cost: '$200–400 used',
      },
      {
        title: 'Kitchen: the 12 essentials',
        why: 'Guests book "full kitchen access" and they expect to actually cook. Missing basics = bad reviews.',
        how: '1 pot, 1 frying pan, 1 baking dish, plates + bowls + mugs (max guests + 2), forks + knives + spoons, a sharp chef\'s knife, cutting board, kettle, coffee maker or french press, toaster, dish soap, sponge, paper towels.',
        time: 'Shopping: 2 hours',
        cost: '$100–200 mixed new/used',
      },
      {
        title: 'Bathroom: the guest kit',
        why: 'Missing toilet paper is a 1-star review. Guests expect supplies.',
        how: 'Each bathroom: 3+ rolls of toilet paper visible, hand soap, shampoo, conditioner, body wash, 2 clean towels per guest, bath mat, and a working mirror with decent lighting.',
        time: '1 hour to stock',
        cost: '$50–80',
      },
      {
        title: 'Living area: cozy is the goal',
        why: 'Guests spend time here. It should feel warm and lived-in, not like a waiting room.',
        how: 'A couch (used is fine), a coffee table, a rug if the floor is rough, a throw blanket, one or two plants (fake is fine), a piece or two of wall art. That\'s a living room.',
        time: '1 day',
        cost: '$100–250 used',
      },
      {
        title: 'Install a smart lock',
        why: 'No key handoff. Guests get a unique code by text when they book. It expires at checkout. This is how every Airbnb property should work — it makes you location-independent.',
        how: 'August, Schlage Encode, or Yale all work. Install takes 20 minutes with a screwdriver. Connect to the app. Test with a dummy booking before your first real guest.',
        time: '30 minutes',
        cost: '$150–250',
        link: 'https://www.amazon.ca/s?k=smart+lock+door',
      },
    ]
  },
  {
    id: 'compliance',
    phase: 'Phase 5',
    title: 'Legal & compliance',
    subtitle: 'Ontario-specific things you need to know before listing',
    emoji: '📋',
    color: '#C4A265',
    steps: [
      {
        title: 'Check STR zoning with Adjala-Tosorontio Township',
        why: 'Palgrave/Adjala-Tosorontio is a rural township. Most rural Ontario is permissive toward STRs, but you should confirm your property is zoned appropriately. Some areas require a permit.',
        how: 'Call or email Adjala-Tosorontio Township (they cover Palgrave). Ask: "Is a short-term rental permit required at 10602 Hwy 9?" Get the answer in writing.',
        time: '1–2 phone calls',
        cost: '$0',
        link: 'https://www.adjtos.ca',
      },
      {
        title: 'Get STR-specific insurance',
        why: 'Your home insurance policy almost certainly excludes paying guests. If a guest is injured and you have no STR insurance, you\'re personally liable. Airbnb provides $3M host protection — but you still want your own policy.',
        how: 'Call your insurer and ask about a "short-term rental rider" or "home-sharing endorsement." Sonnet, Aviva, and Intact all offer this. Roughly $200–400/year added to your policy.',
        time: '1–2 hours',
        cost: '$200–400/yr',
      },
      {
        title: 'Get your septic inspected',
        why: 'If the property is on septic (not city sewage), a full tank can back up with the extra guest load. A backed-up septic is a nightmare and an emergency. Inspect it first.',
        how: 'Find a local septic company (search "septic pumping Palgrave"). Ask for an inspection and pump if needed. Should be every 3–5 years. Keep the report.',
        time: '2–3 hours',
        cost: '$300–500',
      },
      {
        title: 'Register for HST if you earn over $30k/year',
        why: 'If your rental income crosses $30,000/year, you\'re required to collect and remit HST. Airbnb remits it for you in Ontario now — but you need to know this threshold.',
        how: 'Track your income. When you approach $30k, register for a GST/HST number with the CRA. A local accountant can walk you through this for $100–200.',
        time: 'Later — track income first',
        cost: '$0 to register',
        link: 'https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses.html',
      },
    ]
  },
  {
    id: 'launch',
    phase: 'Phase 6',
    title: 'List & launch',
    subtitle: 'How to go from ready-to-book to first guest',
    emoji: '🚀',
    color: '#2563EB',
    steps: [
      {
        title: 'Take listing photos on a bright morning',
        why: 'Photos are 80% of your booking rate. A professional photo service costs $150–300 and pays back on your first booking. If DIY: bright morning light, no flash, wide angle, shoot from corners.',
        how: 'Open all blinds. Make every bed. Put fresh flowers somewhere. Shoot: exterior, every bedroom, living room, kitchen, bathroom, outdoor space. Order: front door last so you capture the "arrival."',
        time: '2–3 hours',
        cost: '$0 DIY or $150–300 pro',
      },
      {
        title: 'Write the Airbnb listing using the camp\'s story',
        why: 'Generic listings get average rates. "Former 100-acre Girl Guides camp turned BnB retreat" is a hook. Use the history. Use the land. Most listings don\'t have a story.',
        how: 'Include: what makes it unique (the history, the land, the forest), exactly what guests get (rooms, kitchen, outdoor space), nearby towns and activities (Orangeville 15 min, hiking, Palgrave trails), honest notes about what\'s still in progress.',
        time: '2–3 hours',
        cost: '$0',
      },
      {
        title: 'Set your first rate 20% below market',
        why: 'Your first 5 reviews are everything on Airbnb. Price low to fill dates fast, get reviews, then raise rates. A 5-star review beats a $50/night premium every time.',
        how: 'Search Airbnb for cabins/houses in Orangeville/Caledon area. Find the average. Set yours 15–20% below. After 5 reviews, raise it to market.',
        time: '30 minutes',
        cost: '$0',
      },
      {
        title: 'Do one test stay before your first guest',
        why: 'You will always miss something. Sleep there yourself (or have a friend do it) and write down every friction point. Solve it before a stranger finds it.',
        how: 'Go through the full guest experience: find the lockbox, unlock the door, find the WiFi, try the bed, cook something, shower, check every outlet. Write down everything awkward.',
        time: '1 night',
        cost: '$0',
      },
    ]
  },
]

function StepCard({ step }: { step: Step }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: '#241C14', border: '1px solid #3A2D20' }}>
      <button className="w-full flex items-start justify-between gap-3 px-4 py-4 text-left" onClick={() => setOpen(!open)}>
        <span className="text-sm font-medium leading-snug" style={{ color: '#F0E8D8' }}>{step.title}</span>
        <div className="shrink-0 mt-0.5" style={{ color: '#8A7968' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t" style={{ borderColor: '#3A2D20' }}>
          <div className="pt-3">
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#C4A265' }}>Why this matters</div>
            <p className="text-sm leading-relaxed" style={{ color: '#D8CCBC' }}>{step.why}</p>
          </div>
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: '#4ADE80' }}>How to do it</div>
            <p className="text-sm leading-relaxed" style={{ color: '#D8CCBC' }}>{step.how}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-xs" style={{ color: '#8A7968' }}>⏱ {step.time}</div>
            <div className="text-xs" style={{ color: '#8A7968' }}>💰 {step.cost}</div>
            {step.link && (
              <a href={step.link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs" style={{ color: '#C4A265' }}>
                <ExternalLink size={11} /> Reference
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function GuidePage() {
  const [openPhase, setOpenPhase] = useState<string>('safety')

  return (
    <div className="min-h-screen px-5 pb-10">
      {/* Header */}
      <div className="pt-12 pb-6">
        <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#C4A265' }}>Phase 1 — Makeewa Farmhouse</p>
        <h1 className="text-2xl font-bold" style={{ color: '#F0E8D8' }}>BnB Playbook</h1>
        <p className="text-sm mt-1 leading-relaxed" style={{ color: '#8A7968' }}>
          Everything you need to do, in the right order, with honest explanations of why and how. Tap any step to expand it.
        </p>
      </div>

      {/* Phase cards */}
      <div className="space-y-3">
        {PHASES.map(phase => (
          <div key={phase.id} className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${openPhase === phase.id ? phase.color + '40' : '#3A2D20'}`, background: openPhase === phase.id ? `${phase.color}08` : '#1C1410' }}>
            <button
              className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
              onClick={() => setOpenPhase(openPhase === phase.id ? '' : phase.id)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{phase.emoji}</span>
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: phase.color }}>{phase.phase}</div>
                  <div className="text-base font-bold" style={{ color: '#F0E8D8' }}>{phase.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#8A7968' }}>{phase.steps.length} steps · {phase.subtitle}</div>
                </div>
              </div>
              <div style={{ color: '#8A7968' }}>
                {openPhase === phase.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {openPhase === phase.id && (
              <div className="px-4 pb-4 space-y-2 border-t" style={{ borderColor: '#3A2D20' }}>
                <div className="h-3" />
                {phase.steps.map((step, i) => <StepCard key={i} step={step} />)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom note */}
      <div className="mt-8 rounded-2xl px-5 py-4" style={{ background: 'rgba(43,90,62,0.1)', border: '1px solid rgba(43,90,62,0.3)' }}>
        <p className="text-xs leading-relaxed" style={{ color: '#B0A090' }}>
          <span className="font-semibold" style={{ color: '#C4A265' }}>Everything here is based on Ontario rural STR experience.</span>{' '}
          When in doubt, the Chat tab can answer specific questions about your situation.
          The Tasks tab has all of these pre-loaded as checkboxes you can mark off as you go.
        </p>
      </div>
    </div>
  )
}
