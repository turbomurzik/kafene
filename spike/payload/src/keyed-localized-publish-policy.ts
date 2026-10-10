import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { classifyLocalizedPair } from './localized-section-semantics.js'

type Row = Record<string, unknown>
type ContentMap = Record<string, unknown>

const hasOwn = (value: unknown, key: string): boolean =>
  typeof value === 'object' &&
  value !== null &&
  Object.prototype.hasOwnProperty.call(value, key)

function isPublishIntent(status: unknown): boolean {
  if (status === 'published') return true
  if (typeof status !== 'object' || status === null) return false
  return Object.values(status as Record<string, unknown>).some((value) => value === 'published')
}

function asRecord(value: unknown): Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export const validateKeyedLocalizedPublication: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
  req,
}) => {
  const incomingStatus = data?._status
  if (!isPublishIntent(incomingStatus)) return data

  const locale = (req as any).locale

  if (locale === 'all') {
    throw new APIError(
      'Publishing keyed localized content with locale=all is not supported. Publish one locale at a time.',
      400,
    )
  }

  if (locale !== 'en' && locale !== 'ru') {
    throw new APIError(
      `Cannot determine a supported publication locale: ${String(locale)}`,
      400,
    )
  }

  const sectionsValue = hasOwn(data, 'sections')
    ? data.sections
    : originalDoc?.sections

  const contentValue = hasOwn(data, 'sectionContent')
    ? data.sectionContent
    : originalDoc?.sectionContent

  if (!Array.isArray(sectionsValue)) {
    throw new APIError(
      `Sections must be present when publishing locale ${locale}`,
      400,
    )
  }

  const content = asRecord(contentValue) as ContentMap
  let completeCount = 0

  for (let index = 0; index < sectionsValue.length; index += 1) {
    const row = sectionsValue[index] as Row
    const rawKey = row.sectionKey
    const sectionKey =
      typeof rawKey === 'string' && rawKey.length > 0
        ? rawKey
        : `#${index + 1}`

    const localized = asRecord(content[sectionKey])
    const state = classifyLocalizedPair(localized.heading, localized.body)

    if (state === 'partial') {
      throw new APIError(
        `Section ${sectionKey} must have both heading and body, or neither, for locale ${locale}`,
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
