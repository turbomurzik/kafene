import { postgresAdapter } from '@payloadcms/db-postgres'
import { buildConfig, type CollectionConfig } from 'payload'
import { collapseSemanticallyEmptyLocalizedField } from './localized-field-hooks.js'
import { validateLocalizedSectionPublication } from './localized-section-publish-policy.js'

const Guides: CollectionConfig = {
  slug: 'impl-localized-publish-policy',
  versions: {
    drafts: {
      localizeStatus: true,
      validate: false,
    },
    maxPerDoc: 50,
  },
  hooks: {
    beforeChange: [validateLocalizedSectionPublication],
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
      admin: {
        description: 'Structure and order are shared across locales. A localized row may be untranslated, partial, or complete in draft. Publication allows only untranslated or complete rows, and requires at least one complete row.',
        initCollapsed: true,
        components: {
          RowLabel: './src/components/LocalizedSectionRowLabel#LocalizedSectionRowLabel',
        },
      },
      fields: [
        {
          name: 'sectionKey',
          type: 'text',
          required: true,
          admin: {
            description: 'Shared stable section identity. Do not translate or casually change this key.',
          },
        },
        {
          name: 'heading',
          type: 'text',
          localized: true,
          required: false,
          admin: {
            description: 'Localized heading. Leave both heading and body empty for an untranslated row; partial rows may be saved as drafts but cannot be published.',
          },
          hooks: {
            beforeChange: [collapseSemanticallyEmptyLocalizedField],
          },
        },
        {
          name: 'body',
          type: 'textarea',
          localized: true,
          required: false,
          admin: {
            description: 'Localized body. Leave both heading and body empty for an untranslated row; partial rows may be saved as drafts but cannot be published.',
          },
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
  secret: process.env.PAYLOAD_SECRET ?? 'kafene-localized-publish-policy-implementation-test',
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
    outputFile: './localized-publish-policy-payload-types.ts',
  },
})
