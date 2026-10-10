'use client'

import type { JSONFieldClientComponent } from 'payload'
import { useField, useFormFields } from '@payloadcms/ui'
import { buildKeyedSectionAdminRows } from '../keyed-localized-admin.js'

type LocalizedEntry = {
  heading?: unknown
  body?: unknown
}

type LocalizedMap = Record<string, LocalizedEntry>

function asLocalizedMap(value: unknown): LocalizedMap {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? value as LocalizedMap
    : {}
}

export const KeyedLocalizedSectionContentField: JSONFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField({ path })
  const sections = useFormFields(([fields]) => fields.sections?.value)
  const content = asLocalizedMap(value)

  const rows = buildKeyedSectionAdminRows(
    Array.isArray(sections) ? sections : [],
    content,
  )

  const updateEntry = (
    sectionKey: string,
    field: 'heading' | 'body',
    nextValue: string,
  ) => {
    setValue({
      ...content,
      [sectionKey]: {
        ...asLocalizedMap({ value: content[sectionKey] }).value,
        [field]: nextValue,
      },
    })
  }

  if (rows.length === 0) {
    return (
      <div>
        <strong>Localized section content</strong>
        <p>Add a shared section before entering localized content.</p>
      </div>
    )
  }

  return (
    <div>
      <strong>Localized section content</strong>
      <p>Content is stored by stable section identity. Reordering sections does not move localized text.</p>

      {rows.map((row) => (
        <details key={row.sectionKey} open={row.state === 'partial'}>
          <summary>
            <strong>{row.sectionKey}</strong>
            {' '}
            <span>{row.state}</span>
          </summary>

          <div>
            <label>
              Heading
              <input
                type="text"
                value={typeof row.heading === 'string' ? row.heading : ''}
                onChange={(event) => updateEntry(row.sectionKey, 'heading', event.target.value)}
              />
            </label>
          </div>

          <div>
            <label>
              Body
              <textarea
                value={typeof row.body === 'string' ? row.body : ''}
                onChange={(event) => updateEntry(row.sectionKey, 'body', event.target.value)}
                rows={6}
              />
            </label>
          </div>
        </details>
      ))}
    </div>
  )
}
