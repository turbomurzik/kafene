import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

const capturePublishContext: CollectionBeforeChangeHook = async ({ data, operation, originalDoc, req }) => {
  console.log('PUBLISH-CONTEXT:', JSON.stringify({
    operation,
    reqLocale: (req as any).locale ?? null,
    reqFallbackLocale: (req as any).fallbackLocale ?? null,
    publishSpecificLocale: (req as any).publishSpecificLocale ?? null,
    incomingStatus: data?._status ?? null,
    incomingHasSections: Object.prototype.hasOwnProperty.call(data ?? {}, 'sections'),
    originalStatus: originalDoc?._status ?? null,
  }))
  return data
}

const Guides: CollectionConfig = {
  slug: 'diag-publish-context',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [capturePublishContext],
  },
  fields: [
    { name: 'title', type: 'text', localized: true, required: true },
    {
      name: 'sections',
      type: 'array',
      required: true,
      fields: [
        { name: 'sectionKey', type: 'text', required: true },
        { name: 'heading', type: 'text', localized: true },
        { name: 'body', type: 'textarea', localized: true },
      ],
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-publish-context-diagnostic',
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
    outputFile: './publish-context-payload-types.ts',
  },
})
