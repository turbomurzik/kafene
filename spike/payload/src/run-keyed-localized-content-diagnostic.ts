import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './keyed-localized-content-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>
type ContentMap = Record<string, { heading: string | null; body: string | null }>

const payload = await getPayload({ config })

async function read(id: string, locale: Locale, draft: boolean): Promise<Row> {
  return payload.findByID({
    collection: 'diag-keyed-localized-content',
    id,
    locale,
    fallbackLocale: false,
    draft,
    overrideAccess: true,
  } as any) as Promise<Row>
}

async function publish(id: string, locale: Locale) {
  return payload.update({
    collection: 'diag-keyed-localized-content',
    id,
    locale,
    fallbackLocale: false,
    publishSpecificLocale: locale,
    draft: false,
    overrideAccess: true,
    data: { _status: 'published' },
  } as any)
}

function order(doc: Row): string[] {
  return (doc.sections as Row[]).map((row) => String(row.sectionKey))
}

function content(doc: Row): ContentMap {
  return (doc.sectionContent ?? {}) as ContentMap
}

const created = await payload.create({
  collection: 'diag-keyed-localized-content',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN keyed diagnostic',
    sections: [
      { sectionKey: 'a' },
      { sectionKey: 'b' },
      { sectionKey: 'c' },
    ],
    sectionContent: {
      a: { heading: 'Alpha', body: 'Alpha body' },
      b: { heading: 'Beta', body: 'Beta body' },
      c: { heading: 'Gamma', body: 'Gamma body' },
    },
  },
} as any) as Row

const id = String(created.id)
const ids = (created.sections as Row[]).map((row) => String(row.id))

await publish(id, 'en')

await payload.update({
  collection: 'diag-keyed-localized-content',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU keyed diagnostic',
    sectionContent: {
      a: { heading: 'Альфа', body: 'Текст альфа' },
      b: { heading: null, body: null },
      c: { heading: 'Гамма', body: 'Текст гамма' },
    },
  },
} as any)

await publish(id, 'ru')

const baselineRu = await read(id, 'ru', false)
assert.deepEqual(order(baselineRu), ['a', 'b', 'c'])
assert.deepEqual(content(baselineRu), {
  a: { heading: 'Альфа', body: 'Текст альфа' },
  b: { heading: null, body: null },
  c: { heading: 'Гамма', body: 'Текст гамма' },
})

await payload.update({
  collection: 'diag-keyed-localized-content',
  id,
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    sections: [
      { id: ids[2], sectionKey: 'c' },
      { id: ids[0], sectionKey: 'a' },
      { id: ids[1], sectionKey: 'b' },
    ],
  },
} as any)

const ruBeforeEnPublish = await read(id, 'ru', false)
assert.deepEqual(order(ruBeforeEnPublish), ['a', 'b', 'c'])
assert.deepEqual(content(ruBeforeEnPublish), {
  a: { heading: 'Альфа', body: 'Текст альфа' },
  b: { heading: null, body: null },
  c: { heading: 'Гамма', body: 'Текст гамма' },
})

await publish(id, 'en')

const enPublished = await read(id, 'en', false)
const ruPublished = await read(id, 'ru', false)
const ruDraft = await read(id, 'ru', true)

console.log('KEYED SNAPSHOT:', JSON.stringify({
  enPublished: { order: order(enPublished), content: content(enPublished) },
  ruDraft: { order: order(ruDraft), content: content(ruDraft) },
  ruPublished: { order: order(ruPublished), content: content(ruPublished) },
}))

assert.deepEqual(order(enPublished), ['c', 'a', 'b'])
assert.deepEqual(order(ruPublished), ['c', 'a', 'b'])
assert.deepEqual(content(ruPublished), {
  a: { heading: 'Альфа', body: 'Текст альфа' },
  b: { heading: null, body: null },
  c: { heading: 'Гамма', body: 'Текст гамма' },
})

console.log('KEYED LOCALIZED CONTENT DIAGNOSTIC: PASS')
await payload.destroy()
