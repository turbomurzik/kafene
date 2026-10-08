'use client'

import { useRowLabel } from '@payloadcms/ui'
import {
  getLocalizedSectionAdminLabel,
  type LocalizedSectionAdminRow,
} from '../localized-section-admin.js'

export function LocalizedSectionRowLabel() {
  const { data, rowNumber } = useRowLabel<LocalizedSectionAdminRow>()

  return (
    <span>
      {getLocalizedSectionAdminLabel(data, rowNumber)}
    </span>
  )
}
