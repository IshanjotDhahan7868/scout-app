export const FOCUS_STRUCTURE_NAME = 'Makeewa Farmhouse'

export type NamedStructure = {
  id: string
  name: string
}

export function getFocusStructure<T extends NamedStructure>(structures: T[]) {
  return structures.find((structure) => structure.name === FOCUS_STRUCTURE_NAME) ?? structures[0] ?? null
}

export function isFocusStructure(structure: NamedStructure | null) {
  return structure?.name === FOCUS_STRUCTURE_NAME
}

export function filterByStructureId<T extends { structure_id: string | null }>(
  items: T[],
  structureId: string | null | undefined
) {
  if (!structureId) return items
  return items.filter((item) => item.structure_id === structureId)
}
