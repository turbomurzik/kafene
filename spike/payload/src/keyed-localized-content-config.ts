import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig, type FieldHook } from 'payload'
import { collapseSemanticallyEmptyToNull } from './localized-section-semantics.js'
import { validateKeyedLocalizedPublication } from './keyed-localized-publish-policy.js'
import { validateSharedSectionKeys } from './keyed-section-key-policy.js'

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

const dirname = path.dirname(fileURLToPath(import.meta.url))

const Guides: CollectionConfig = {
  slug: 'diag-keyed-localized-content',
  hooks: {
    beforeChange: [validateSharedSectionKeys, validateKeyedLocalizedPublication],
  },
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
          admin: {
            description: 'Stable technical identity. Do not rename after creation.',
          },
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
      admin: {
        components: {
          Field: '/components/KeyedLocalizedSectionContentField#KeyedLocalizedSectionContentField',
        },
      },
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-keyed-localized-content-diagnostic',
  admin: {
    importMap: {
      baseDir: dirname,
      importMapFile: path.resolve(dirname, '../.generated/keyed-localized-importMap.js'),
    },
  },
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
