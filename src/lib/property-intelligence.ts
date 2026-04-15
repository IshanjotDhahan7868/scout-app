export const PROPERTY_INTELLIGENCE = {
  canonicalId: 'property_ma_kee_wa_10602_hwy_9',
  title: 'Ma-Kee-Wa / 10602 Highway 9 Property Intelligence Pack',
  address: '10602 Highway 9, Palgrave / Adjala-Tosorontio, Ontario',
  aliases: [
    'Ma-Kee-Wa',
    'Camp Ma-Kee-Wa',
    'Camp Ma Kee Wa',
    '10602 Highway 9 Palgrave',
    '10602 9 Highway Palgrave Freeway',
    '10602 Hwy 9',
  ],
  propertyProfile: {
    type: 'large rural camp-style multi-structure property',
    acreage: 'about 98 acres',
    historicalUse: 'Girl Guides camp / retreat property',
    positioning:
      'This should be treated as a retreat campus with multiple structures and experience zones, not a simple STR house.',
  },
  likelyAssets: [
    'winterized retreat-style lodges',
    'seasonal camp structures or site huts',
    'program buildings',
    'storage buildings',
    'workshop space',
    'washroom or comfort-station support buildings',
    'pool area',
    'sports or open recreation areas',
    'internal roads and trails',
  ],
  operatingFrames: [
    {
      id: 'sale_mode',
      title: 'Sale Asset',
      priorities: ['declutter', 'staging', 'cleanliness', 'showing flexibility', 'avoid over-customization'],
    },
    {
      id: 'income_mode',
      title: 'Income-Producing Interim Use',
      priorities: ['guest readiness', 'sleeping capacity', 'linens and supplies', 'locking protocols', 'turnover operations'],
    },
    {
      id: 'dual_mode',
      title: 'Dual Mode',
      priorities: ['easy-reset spaces', 'selective activation', 'blackout dates for showings', 'minimal permanent setup'],
    },
  ],
  modelRules: [
    'Treat the site as a multi-structure campus.',
    'Do not over-generalize from a normal Airbnb playbook.',
    'Prioritize one best building for first activation.',
    'Separate safety and compliance work from cosmetic work.',
    'Prefer reuse, salvage, family items, free listings, used finds, then new essentials.',
    'Track structures and outdoor zones independently.',
    'Keep unknown facts unknown until they are verified.',
    'Treat the pool as special-case infrastructure, not a default phase-one amenity.',
  ],
  complianceSignals: [
    'Zoning interpretation is a gate for any B&B or STR-style use.',
    'Permits may be triggered by structural, plumbing, heating, occupancy, septic, or major system changes.',
    'Property standards, fire safety, smoke alarms, CO alarms, and outdoor burning rules matter.',
    'Short-term-rental tax and deductibility issues depend on compliance status.',
  ],
  highestRoiWork: [
    'deep cleaning and decontamination of neglect',
    'junk removal and decluttering',
    'bathroom and kitchen hard reset',
    'lighting improvement',
    'warm-neutral paint where needed',
    'minimal, coherent furniture staging',
    'lock, stair, railing, and life-safety fixes',
    'one intentional outdoor social node',
  ],
  phases: [
    'Phase 0: discovery and inventory',
    'Phase 1: safety and stabilization',
    'Phase 2: choose the best first rentable structure',
    'Phase 3: make that structure photogenic and usable',
    'Phase 4: grounds support and guest boundaries',
    'Phase 5: listing and operations',
  ],
  confidenceLevels: [
    'verified_on_site',
    'verified_by_owner',
    'verified_from_listing',
    'public_reference_inference',
    'unknown',
  ],
  immediateNextInputs: [
    'full photo set from the sale listing',
    'video walkthrough of each main building',
    'rough hand-drawn property map',
    'all visible buildings with temporary names',
    'utility status per building',
    'bathroom, kitchen, ceiling, floor, window, and stair photos',
    'pool area photos',
    'trail, field, and firepit-capable zone photos',
    'salvageable furniture or items already on site',
    'items family can bring for free',
  ],
  finalSummary:
    'Camp Ma-Kee-Wa at 10602 Highway 9 should be modeled as a historically camp-based, roughly 98-acre rural hospitality campus with multiple structures, support buildings, trails, and outdoor recreation assets. The correct product strategy is phased activation: inspect and map everything, choose the best structure first, restore it through cleaning, safety fixes, lighting, paint, and minimal staging, then expand selectively. Compliance, septic/well realities, fire safety, and permit triggers must be treated as real gates. The system should support both sale mode and guest mode, separate verified facts from inferred facts, and bias toward cheap reuse and selective activation.',
} as const

export function buildPropertyIntelligenceContext() {
  return `
Property intelligence pack:
- Canonical ID: ${PROPERTY_INTELLIGENCE.canonicalId}
- Address: ${PROPERTY_INTELLIGENCE.address}
- Aliases: ${PROPERTY_INTELLIGENCE.aliases.join(', ')}
- Property type: ${PROPERTY_INTELLIGENCE.propertyProfile.type}
- Acreage: ${PROPERTY_INTELLIGENCE.propertyProfile.acreage}
- Historical use: ${PROPERTY_INTELLIGENCE.propertyProfile.historicalUse}
- Positioning: ${PROPERTY_INTELLIGENCE.propertyProfile.positioning}

Likely asset categories:
${PROPERTY_INTELLIGENCE.likelyAssets.map((asset) => `- ${asset}`).join('\n')}

Operating frames:
${PROPERTY_INTELLIGENCE.operatingFrames
    .map((frame) => `- ${frame.title}: ${frame.priorities.join(', ')}`)
    .join('\n')}

Model rules:
${PROPERTY_INTELLIGENCE.modelRules.map((rule) => `- ${rule}`).join('\n')}

Compliance signals:
${PROPERTY_INTELLIGENCE.complianceSignals.map((signal) => `- ${signal}`).join('\n')}

Highest ROI work:
${PROPERTY_INTELLIGENCE.highestRoiWork.map((item) => `- ${item}`).join('\n')}

Phased approach:
${PROPERTY_INTELLIGENCE.phases.map((phase) => `- ${phase}`).join('\n')}

Confidence levels:
${PROPERTY_INTELLIGENCE.confidenceLevels.map((level) => `- ${level}`).join('\n')}

Immediate next inputs:
${PROPERTY_INTELLIGENCE.immediateNextInputs.map((input) => `- ${input}`).join('\n')}

Final summary:
${PROPERTY_INTELLIGENCE.finalSummary}`.trim()
}
