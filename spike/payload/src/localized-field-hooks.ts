import type { FieldHook } from 'payload'
import { collapseSemanticallyEmptyToNull } from './localized-section-semantics.js'

export const collapseSemanticallyEmptyLocalizedField: FieldHook = ({ value }) => {
  return collapseSemanticallyEmptyToNull(value)
}
