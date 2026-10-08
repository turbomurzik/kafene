import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig, type Field } from 'payload'

function guideFields(options: { localizedContent: boolean; localizedRequired: boolean }): Field[] {
  return [
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
          localized: options.localizedContent,
          required: options.localizedRequired,
        },
        {
          name: 'body',
          type: 'textarea',
          localized: options.localizedContent,
          required: options.localizedRequired,
        },
      ],
    },
  ]
}

function collection(
  slug: string,
  options: { localizedContent: boolean; localizedRequired: boolean },
): CollectionConfig {
  return {
    slug,
    versions: {
      drafts: {
        localizeStatus: true,
      },
      maxPerDoc: 50,
    },
    fields: guideFields(options),
  }
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-reorder-diagnostic-only-not-for-production',
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
  collections: [
    collection('diag-required-localized', { localizedContent: true, localizedRequired: true }),
    collection('diag-optional-localized', { localizedContent: true, localizedRequired: false }),
    collection('diag-plain-array', { localizedContent: false, localizedRequired: true }),
  ],
  typescript: {
    outputFile: './reorder-diagnostic-payload-types.ts',
  },
})
