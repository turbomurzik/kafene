import { classifyLocalizedPair } from './localized-section-semantics.js'

type Row = Record<string, unknown>
type ContentMap = Record<string, unknown>

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export function projectVisibleKeyedSections(
  sections: readonly Row[] | null | undefined,
  sectionContent: unknown,
): Array<Row & { sectionKey: string; heading: unknown; body: unknown }> {
  if (!Array.isArray(sections)) return []

  const content = asRecord(sectionContent) as ContentMap

  return sections.flatMap((row, index) => {
    const rawKey = row.sectionKey
    const sectionKey =
      typeof rawKey === 'string' && rawKey.length > 0
        ? rawKey
        : `#${index + 1}`

    const localized = asRecord(content[sectionKey])
    if (classifyLocalizedPair(localized.heading, localized.body) !== 'complete') {
      return []
    }

    return [{
      ...row,
      sectionKey,
      heading: localized.heading,
      body: localized.body,
    }]
  })
}

export function projectKeyedLocalizedDocument<T extends Record<string, unknown>>(
  document: T,
): T & { sections: Array<Row & { sectionKey: string; heading: unknown; body: unknown }> } {
  return {
    ...document,
    sections: projectVisibleKeyedSections(
      Array.isArray(document.sections) ? document.sections as Row[] : [],
      document.sectionContent,
    ),
  }
}
