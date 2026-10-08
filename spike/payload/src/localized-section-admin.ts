import { classifyLocalizedPair } from './localized-section-semantics.js'

export type LocalizedSectionAdminRow = {
  sectionKey?: unknown
  heading?: unknown
  body?: unknown
}

export function getLocalizedSectionAdminLabel(
  row: LocalizedSectionAdminRow | null | undefined,
  rowNumber?: number,
): string {
  const state = classifyLocalizedPair(row?.heading, row?.body)
  const rawKey = row?.sectionKey
  const key =
    typeof rawKey === 'string' && rawKey.length > 0
      ? rawKey
      : `Section ${rowNumber ?? '?'}`

  return `${key} — ${state}`
}
