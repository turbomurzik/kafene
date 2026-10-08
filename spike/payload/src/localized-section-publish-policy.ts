import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { classifyLocalizedPair } from './localized-section-semantics.js'

type Row = Record<string, unknown>

const hasOwn = (value: unknown, key: string): boolean =>
  typeof value === 'object' &&
  value !== null &&
  Object.prototype.hasOwnProperty.call(value, key)

function isPublishIntent(status: unknown): boolean {
  if (status === 'published') return true
  if (typeof status !== 'object' || status === null) return false
  return Object.values(status as Record<string, unknown>).some((value) => value === 'published')
}

function sectionLabel(row: Row, index: number): string {
  const key = row.sectionKey ?? row.id
  return key == null ? `#${index + 1}` : String(key)
}

export const validateLocalizedSectionPublication: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const incomingStatus = data?._status
  if (!isPublishIntent(incomingStatus)) return data

  const locale = (req as any).locale

  if (locale === 'all') {
    throw new APIError(
      'Publishing localized sections with locale=all is not supported. Publish one locale at a time.',
      400,
    )
  }

  if (locale !== 'en' && locale !== 'ru') {
    throw new APIError(
      `Cannot determine a supported publication locale for localized sections: ${String(locale)}`,
      400,
    )
  }

  const sectionsValue = hasOwn(data, 'sections')
    ? data.sections
    : originalDoc?.sections

  if (!Array.isArray(sectionsValue)) {
    throw new APIError(
      `Sections must be present when publishing locale ${locale}`,
      400,
    )
  }

  const rows = sectionsValue as Row[]
  let completeCount = 0

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]
    const state = classifyLocalizedPair(row.heading, row.body)

    if (state === 'partial') {
      throw new APIError(
        `Section ${sectionLabel(row, index)} must have both heading and body, or neither, for locale ${locale}`,
        400,
      )
    }

    if (state === 'complete') completeCount += 1
  }

  if (completeCount === 0) {
    throw new APIError(
      `Locale ${locale} must have at least one complete section before publication`,
      400,
    )
  }

  return data
}
