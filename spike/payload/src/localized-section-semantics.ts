export type LocalizedPairState = 'untranslated' | 'partial' | 'complete'

export type LocalizedSectionLike = {
  heading?: unknown
  body?: unknown
}

const SEMANTICALLY_IGNORABLE = /[\p{Z}\p{Cc}\p{Cf}]/gu

export function isSemanticallyEmpty(value: unknown): boolean {
  if (typeof value !== 'string') return true

  return value
    .normalize('NFC')
    .replace(SEMANTICALLY_IGNORABLE, '')
    .length === 0
}

export function classifyLocalizedPair(
  heading: unknown,
  body: unknown,
): LocalizedPairState {
  const headingMeaningful = !isSemanticallyEmpty(heading)
  const bodyMeaningful = !isSemanticallyEmpty(body)

  if (!headingMeaningful && !bodyMeaningful) return 'untranslated'
  if (headingMeaningful && bodyMeaningful) return 'complete'
  return 'partial'
}

export function isVisibleSection(section: LocalizedSectionLike): boolean {
  return classifyLocalizedPair(section.heading, section.body) === 'complete'
}
