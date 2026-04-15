import { ComplianceCheck, GroundsZone, Hazard, Room, Structure, Utility, WorkOrder } from '@/lib/supabase'
import { FOCUS_STRUCTURE_NAME } from '@/lib/focus'
import { buildPropertyIntelligenceContext } from '@/lib/property-intelligence'

const BASE_CONTEXT = `Scout is the operating system for Camp Ma-Kee-Wa near Palgrave, Ontario.

Current operating mode:
- Only the first BnB-ready house matters right now.
- That primary structure is "${FOCUS_STRUCTURE_NAME}".
- Other structures exist on the 98-acre property, but they should stay secondary unless explicitly requested.
- Advice should favor practical sequencing, low-to-mid budget decisions, DIY-friendly execution, and getting the house launch-ready.

What Scout should help with:
- Renovation planning and task sequencing
- Room setup and furnishing decisions
- Inspection and safety readiness
- Procurement and deal evaluation
- BnB launch prep and operating checklists
- Converting raw property research into actionable steps

Research inputs:
- A city research paper is being prepared.
- A property research paper is being prepared.
- When that research is added, Scout should treat it as source material for local regulations, property constraints, vendor suggestions, and launch planning.`

export function buildScoutSystemPrompt(input: {
  structure: Structure | null
  rooms: Room[]
  orders: WorkOrder[]
  zones?: GroundsZone[]
  utilities?: Utility[]
  hazards?: Hazard[]
  checks?: ComplianceCheck[]
}) {
  const { structure, rooms, orders, zones = [], utilities = [], hazards = [], checks = [] } = input

  const roomSummary = rooms.length
    ? rooms.map((room) => `- ${room.name}${room.ai_description ? `: ${room.ai_description}` : ''}`).join('\n')
    : '- No rooms have been added yet.'

  const taskSummary = orders.length
    ? orders
        .slice(0, 12)
        .map(
          (order) =>
            `- [${order.priority}/${order.status}] ${order.title}${
              order.category ? ` (${order.category})` : ''
            }${order.description ? `: ${order.description}` : ''}`
        )
        .join('\n')
    : '- No tasks have been added yet.'

  const zoneSummary = zones.length
    ? zones
        .slice(0, 10)
        .map((zone) => `- ${zone.name} [${zone.type}/${zone.status}/${zone.condition}]${zone.notes ? `: ${zone.notes}` : ''}`)
        .join('\n')
    : '- No grounds zones have been defined yet.'

  const utilitySummary = utilities.length
    ? utilities
        .slice(0, 10)
        .map((utility) => `- ${utility.name} [${utility.category}/${utility.status}]${utility.notes ? `: ${utility.notes}` : ''}`)
        .join('\n')
    : '- No utility records exist yet.'

  const hazardSummary = hazards.length
    ? hazards
        .slice(0, 10)
        .map((hazard) => `- ${hazard.title} [${hazard.severity}/${hazard.status}]${hazard.notes ? `: ${hazard.notes}` : ''}`)
        .join('\n')
    : '- No hazards have been logged yet.'

  const checkSummary = checks.length
    ? checks
        .slice(0, 10)
        .map((check) => `- ${check.title} [${check.category}/${check.status}]${check.notes ? `: ${check.notes}` : ''}`)
        .join('\n')
    : '- No compliance checks have been logged yet.'

  const structureSummary = structure
    ? `Focused structure:
- Name: ${structure.name}
- Type: ${structure.type}
- Status: ${structure.status}
- Priority: ${structure.priority}
- Notes: ${structure.notes || 'None yet'}`
    : `Focused structure:
- ${FOCUS_STRUCTURE_NAME} is the primary target, but it has not been found in the database yet.`

  return `${BASE_CONTEXT}

${buildPropertyIntelligenceContext()}

${structureSummary}

Known rooms:
${roomSummary}

Known work orders:
${taskSummary}

Known grounds zones:
${zoneSummary}

Known utilities:
${utilitySummary}

Known hazards:
${hazardSummary}

Known compliance checks:
${checkSummary}

Response style:
- Be practical and direct.
- Prioritize the focused house over the rest of the property.
- Turn vague ideas into concrete next actions, sequences, or checklists.
- If something depends on missing research documents, say what information is missing and how it should plug into Scout.`
}
