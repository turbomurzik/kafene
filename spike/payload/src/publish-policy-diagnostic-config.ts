import { postgresAdapter } from '@payloadcms/db-postgres'
import { APIError, buildConfig, type CollectionBeforeChangeHook, type CollectionConfig } from 'payload'

type Row = Record<string, any>

function meaningful(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return value.normalize('NFC').replace(/[\p{Z}\p{Cc}\p{Cf}]/gu, '').length > 0
}

const validatePublishCompleteness: CollectionBeforeChangeHook = async ({
  data,
  originalDoc,
  req,
}) => {
  if (data?._status !== 'published') return data

  const locale = String((req as any).locale ?? 'unknown')
  const sections = (data?.sections ?? originalDoc?.sections ?? []) as Row[]

  console.log('POLICY HOOK publish:', JSON.stringify({
    locale,
    incomingStatus: data?._status ?? null,
    incomingHasSections: Array.isArray(data?.sections),
    sectionStates: sections.map((row) => ({
      id: row.id ?? null,
      heading: row.heading ?? null,
      body: row.body ?? null,
      headingMeaningful: meaningful(row.heading),
      bodyMeaningful: meaningful(row.body),
    })),
  }))

  for (const row of sections) {
    const heading = meaningful(row.heading)
    const body = meaningful(row.body)
    if (heading !== body) {
      throw new APIError(
        `Section ${String(row.sectionKey ?? row.id ?? 'unknown')} must have both heading and body, or neither, for locale ${locale}`,
        400,
      )
    }
  }

  return data
}

const PublishPolicyGuides: CollectionConfig = {
  slug: 'diag-publish-policy',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [validatePublishCompleteness],
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
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          required: false,
        },
      ],
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) throw new Error('DATABASE_URL is required')

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-publish-policy-diagnostic-only-not-for-production',
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
  collections: [PublishPolicyGuides],
  typescript: {
    outputFile: './publish-policy-payload-types.ts',
  },
})
