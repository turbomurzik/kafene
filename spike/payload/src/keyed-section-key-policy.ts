import { APIError, type CollectionBeforeChangeHook } from 'payload'
import { getDuplicateSectionKeys } from './keyed-localized-admin.js'

const hasOwn = (value: unknown, key: string): boolean =>
  typeof value === 'object' &&
  value !== null &&
  Object.prototype.hasOwnProperty.call(value, key)

export const validateSharedSectionKeys: CollectionBeforeChangeHook = ({
  data,
  originalDoc,
}) => {
  const sectionsValue = hasOwn(data, 'sections')
    ? data.sections
    : originalDoc?.sections

  if (!Array.isArray(sectionsValue)) return data

  const duplicates = getDuplicateSectionKeys(sectionsValue)
  if (duplicates.length > 0) {
    throw new APIError(
      `Duplicate sectionKey values are not allowed: ${duplicates.join(', ')}`,
      400,
    )
  }

  return data
}
