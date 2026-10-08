import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'
import { collapseSemanticallyEmptyLocalizedField } from './localized-field-hooks.js'

const CollapseGuides: CollectionConfig = {
  slug: 'diag-localized-field-collapse',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: false,
    },
    maxPerDoc: 20,
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
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: false,
          hooks: {
            beforeChange: [collapseSemanticallyEmptyLocalizedField],
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          required: false,
          hooks: {
            beforeChange: [collapseSemanticallyEmptyLocalizedField],
          },
        },
      ],
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-localized-field-collapse-diagnostic-only',
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
  collections: [CollapseGuides],
  typescript: {
    outputFile: './localized-field-collapse-payload-types.ts',
  },
})
