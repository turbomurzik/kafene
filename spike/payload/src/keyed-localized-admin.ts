import { classifyLocalizedPair, type LocalizedPairState } from './localized-section-semantics.js'

type Row = Record<string, unknown>
type ContentMap = Record<string, unknown>

export type KeyedSectionAdminRow = {
  index: number
  sectionKey: string
  heading: unknown
  body: unknown
  state: LocalizedPairState
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export function getDuplicateSectionKeys(
  sections: readonly Row[] | null | undefined,
): string[] {
  if (!Array.isArray(sections)) return []

  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const row of sections) {
    const rawKey = row.sectionKey
    if (typeof rawKey !== 'string' || rawKey.length === 0) continue

    if (seen.has(rawKey)) duplicates.add(rawKey)
    seen.add(rawKey)
  }

  return [...duplicates]
}

export function buildKeyedSectionAdminRows(
  sections: readonly Row[] | null | undefined,
  sectionContent: unknown,
): KeyedSectionAdminRow[] {
  if (!Array.isArray(sections)) return []

  const content = asRecord(sectionContent) as ContentMap

  return sections.map((row, index) => {
    const rawKey = row.sectionKey
    const sectionKey =
      typeof rawKey === 'string' && rawKey.length > 0
        ? rawKey
        : `#${index + 1}`

    const localized = asRecord(content[sectionKey])
    const heading = localized.heading
    const body = localized.body

    return {
      index,
      sectionKey,
      heading,
      body,
      state: classifyLocalizedPair(heading, body),
    }
  })
}
