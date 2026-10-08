import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './localized-field-collapse-config.js'

type Row = Record<string, any>

const payload = await getPayload({ config })

async function read(id: string, locale: 'en' | 'ru') {
  return payload.findByID({
    collection: 'diag-localized-field-collapse',
    id,
    locale,
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
  } as any) as Promise<Row>
}

console.log('CASE 1 semantically empty localized fields collapse to null BEGIN')
const emptyDoc = await payload.create({
  collection: 'diag-localized-field-collapse',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'empty collapse',
    sections: [
      {
        sectionKey: 'a',
        heading: ' \u200B\uFEFF ',
        body: '\u00A0\u2060',
      },
    ],
  },
} as any) as Row

const emptyRead = await read(String(emptyDoc.id), 'en')
assert.equal(emptyRead.sections[0].heading, null)
assert.equal(emptyRead.sections[0].body, null)
console.log('CASE 1 PASS:', JSON.stringify({
  heading: emptyRead.sections[0].heading,
  body: emptyRead.sections[0].body,
}))

console.log('CASE 2 meaningful mixed content is preserved byte-for-value BEGIN')
const heading = ' Alpha\u200B '
const body = ' Body\u2060 '
const meaningfulDoc = await payload.create({
  collection: 'diag-localized-field-collapse',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'meaningful preserve',
    sections: [
      {
        sectionKey: 'a',
        heading,
        body,
      },
    ],
  },
} as any) as Row

const meaningfulRead = await read(String(meaningfulDoc.id), 'en')
assert.equal(meaningfulRead.sections[0].heading, heading)
assert.equal(meaningfulRead.sections[0].body, body)
console.log('CASE 2 PASS:', JSON.stringify({
  heading: meaningfulRead.sections[0].heading,
  body: meaningfulRead.sections[0].body,
}))

console.log('CASE 3 RU collapse does not alter EN localized values BEGIN')
const isolatedDoc = await payload.create({
  collection: 'diag-localized-field-collapse',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN title',
    sections: [
      {
        sectionKey: 'a',
        heading: 'EN heading',
        body: 'EN body',
      },
    ],
  },
} as any) as Row

const sectionId = String(isolatedDoc.sections[0].id)

await payload.update({
  collection: 'diag-localized-field-collapse',
  id: isolatedDoc.id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU title',
    sections: [
      {
        id: sectionId,
        sectionKey: 'a',
        heading: '\u200B',
        body: '\uFEFF',
      },
    ],
  },
} as any)

const enAfter = await read(String(isolatedDoc.id), 'en')
const ruAfter = await read(String(isolatedDoc.id), 'ru')

assert.equal(enAfter.sections[0].heading, 'EN heading')
assert.equal(enAfter.sections[0].body, 'EN body')
assert.equal(ruAfter.sections[0].heading, null)
assert.equal(ruAfter.sections[0].body, null)

console.log('CASE 3 PASS:', JSON.stringify({
  en: {
    heading: enAfter.sections[0].heading,
    body: enAfter.sections[0].body,
  },
  ru: {
    heading: ruAfter.sections[0].heading,
    body: ruAfter.sections[0].body,
  },
}))

console.log('LOCALIZED FIELD COLLAPSE: 3/3 PASS')
await payload.destroy()
