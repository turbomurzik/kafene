import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'

const Sources: CollectionConfig = {
  slug: 'sources',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'url',
      type: 'text',
      required: true,
    },
  ],
}

const Guides: CollectionConfig = {
  slug: 'guides',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: true,
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
      name: 'body',
      type: 'textarea',
      localized: true,
      required: true,
    },
    {
      name: 'verificationState',
      type: 'select',
      localized: true,
      required: true,
      defaultValue: 'unverified',
      options: [
        { label: 'Unverified', value: 'unverified' },
        { label: 'Verified', value: 'verified' },
        { label: 'Needs review', value: 'needs-review' },
      ],
    },
    {
      name: 'lastVerified',
      type: 'date',
      localized: true,
    },
    {
      name: 'source',
      type: 'relationship',
      relationTo: 'sources',
      required: true,
    },
  ],
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) {
  throw new Error('DATABASE_URL is required')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-payload-spike-only-not-for-production',
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
  collections: [Sources, Guides],
  typescript: {
    outputFile: './payload-types.ts',
  },
})
