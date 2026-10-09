import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'

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
