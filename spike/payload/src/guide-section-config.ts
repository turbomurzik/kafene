import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'

const ArrayGuides: CollectionConfig = {
  slug: 'array-guides',
  versions: {
    drafts: {
      localizeStatus: true,
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

const CollectionGuides: CollectionConfig = {
  slug: 'collection-guides',
  versions: {
    drafts: {
      localizeStatus: true,
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
  ],
}

const GuideSections: CollectionConfig = {
  slug: 'guide-sections',
  versions: {
    drafts: {
      localizeStatus: true,
    },
    maxPerDoc: 20,
  },
  fields: [
    {
      name: 'guide',
      type: 'relationship',
      relationTo: 'collection-guides',
      required: true,
    },
    {
      name: 'sectionKey',
      type: 'text',
      required: true,
    },
    {
      name: 'position',
      type: 'number',
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
}

const databaseURL = process.env.DATABASE_URL
if (!databaseURL) {
  throw new Error('DATABASE_URL is required')
}

export default buildConfig({
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-guide-section-spike-only-not-for-production',
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
  collections: [ArrayGuides, CollectionGuides, GuideSections],
  typescript: {
    outputFile: './guide-section-payload-types.ts',
  },
})
