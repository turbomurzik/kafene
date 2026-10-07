import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'

const InvalidationGuides: CollectionConfig = {
  slug: 'invalidation-guides',
  versions: {
    drafts: {
      localizeStatus: true,
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
      name: 'summary',
      type: 'textarea',
      localized: true,
    },
    {
      name: 'applicability',
      type: 'text',
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
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          required: true,
        },
      ],
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) {
  throw new Error('DATABASE_URL is required')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-local-invalidation-spike-only-not-for-production',
  db: postgresAdapter({
    idType: 'uuid',
    pool: {
      connectionString: databaseURL,
    },
  }),
  localization: {
    locales: ['en', 'ru'],
    defaultLocale: 'en',
    fallback: false,
  },
  experimental: {
    localizeStatus: true,
  },
  collections: [InvalidationGuides],
  typescript: {
    outputFile: './local-invalidation-payload-types.ts',
  },
})
