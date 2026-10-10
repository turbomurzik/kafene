import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig, type FieldHook } from 'payload'
import { collapseSemanticallyEmptyToNull } from './localized-section-semantics.js'

const normalizeKeyedLocalizedContent: FieldHook = ({ value }) => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return value

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([sectionKey, raw]) => {
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return [sectionKey, raw]
      }

      const item = raw as Record<string, unknown>
      return [
        sectionKey,
        {
          ...item,
          heading: collapseSemanticallyEmptyToNull(item.heading),
          body: collapseSemanticallyEmptyToNull(item.body),
        },
      ]
    }),
  )
}

const Guides: CollectionConfig = {
  slug: 'diag-keyed-localized-content',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      localized: true,
      required: true,
    },
    {
      name: 'sections',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          name: 'sectionKey',
          type: 'text',
          required: true,
        },
      ],
    },
    {
      name: 'sectionContent',
      type: 'json',
      localized: true,
      required: false,
      hooks: {
        beforeChange: [normalizeKeyedLocalizedContent],
      },
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-keyed-localized-content-diagnostic',
  db: postgresAdapter({
    idType: 'uuid',
    pool: { connectionString: databaseURL },
  }),
  localization: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    fallback: false,
  },
  experimental: {
    localizeStatus: true,
  },
  collections: [Guides],
  typescript: {
    outputFile: './keyed-localized-content-payload-types.ts',
  },
})
