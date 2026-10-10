import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './keyed-localized-content-config.js'
import { projectKeyedLocalizedDocument } from './keyed-localized-projection.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })

async function read(id: string, locale: Locale, draft = true): Promise<Row> {
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

async function expectReject(label: string, fn: () => Promise<unknown>, message: RegExp) {
  let error: unknown
  try {
    await fn()
  } catch (caught) {
    error = caught
  }
  assert.ok(error instanceof Error, `${label} should reject`)
  assert.match(error.message, message)
  console.log(`EXPECTED REJECT ${label}: ${error.message}`)
}

console.log('KEYED CONTRACT CASE 1 create EN with keyed content and publish BEGIN')
const created = await payload.create({
  collection: 'diag-keyed-localized-content',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN guide',
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
const enPublished = await read(id, 'en', false)
assert.equal(enPublished._status, 'published')
assert.deepEqual(
  projectKeyedLocalizedDocument(enPublished).sections.map((row: Row) => row.sectionKey),
  ['a', 'b', 'c'],
)
console.log('KEYED CONTRACT CASE 1 PASS')

console.log('KEYED CONTRACT CASE 2 RU draft normalizes invisible content and allows partial BEGIN')
await payload.update({
  collection: 'diag-keyed-localized-content',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU guide',
    sectionContent: {
      a: { heading: 'Альфа', body: 'Текст альфа' },
      b: { heading: ' \u200B\uFEFF ', body: '\u00A0\u2060' },
      c: { heading: 'Гамма', body: null },
    },
  },
} as any)

const ruDraft = await read(id, 'ru', true)
assert.equal(ruDraft.sectionContent.b.heading, null)
assert.equal(ruDraft.sectionContent.b.body, null)
assert.equal(ruDraft.sectionContent.c.heading, 'Гамма')
assert.equal(ruDraft.sectionContent.c.body, null)
console.log('KEYED CONTRACT CASE 2 PASS')

console.log('KEYED CONTRACT CASE 3 partial RU publish rejects BEGIN')
await expectReject(
  'partial RU publish',
  () => publish(id, 'ru'),
  /must have both heading and body, or neither/,
)
console.log('KEYED CONTRACT CASE 3 PASS')

console.log('KEYED CONTRACT CASE 4 repair RU and publish BEGIN')
await payload.update({
  collection: 'diag-keyed-localized-content',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU guide',
    sectionContent: {
      a: { heading: 'Альфа', body: 'Текст альфа' },
      b: { heading: null, body: null },
      c: { heading: 'Гамма', body: 'Текст гамма' },
    },
  },
} as any)

await publish(id, 'ru')
const ruPublishedBeforeReorder = await read(id, 'ru', false)
assert.equal(ruPublishedBeforeReorder._status, 'published')
assert.deepEqual(
  projectKeyedLocalizedDocument(ruPublishedBeforeReorder).sections.map((row: Row) => row.sectionKey),
  ['a', 'c'],
)
console.log('KEYED CONTRACT CASE 4 PASS')

console.log('KEYED CONTRACT CASE 5 EN shared reorder remains identity-safe for RU published content BEGIN')
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

const ruPublishedBeforeEnPublish = await read(id, 'ru', false)
assert.deepEqual(
  (ruPublishedBeforeEnPublish.sections as Row[]).map((row) => row.sectionKey),
  ['a', 'b', 'c'],
)
assert.deepEqual(ruPublishedBeforeEnPublish.sectionContent, {
  a: { heading: 'Альфа', body: 'Текст альфа' },
  b: { heading: null, body: null },
  c: { heading: 'Гамма', body: 'Текст гамма' },
})

await publish(id, 'en')

const enAfterReorderPublish = await read(id, 'en', false)
const ruAfterEnPublish = await read(id, 'ru', false)
const ruDraftAfterEnPublish = await read(id, 'ru', true)

assert.deepEqual(
  (enAfterReorderPublish.sections as Row[]).map((row) => row.sectionKey),
  ['c', 'a', 'b'],
)
assert.deepEqual(
  (ruAfterEnPublish.sections as Row[]).map((row) => row.sectionKey),
  ['c', 'a', 'b'],
)
assert.deepEqual(ruAfterEnPublish.sectionContent, {
  a: { heading: 'Альфа', body: 'Текст альфа' },
  b: { heading: null, body: null },
  c: { heading: 'Гамма', body: 'Текст гамма' },
})
assert.deepEqual(
  projectKeyedLocalizedDocument(ruAfterEnPublish).sections.map((row: Row) => ({
    sectionKey: row.sectionKey,
    heading: row.heading,
  })),
  [
    { sectionKey: 'c', heading: 'Гамма' },
    { sectionKey: 'a', heading: 'Альфа' },
  ],
)
assert.deepEqual(
  (ruDraftAfterEnPublish.sections as Row[]).map((row) => row.sectionKey),
  ['a', 'b', 'c'],
)
console.log('KEYED CONTRACT CASE 5 PASS')

console.log('KEYED CONTRACT CASE 6 zero-complete publication rejects BEGIN')
const zeroCreated = await payload.create({
  collection: 'diag-keyed-localized-content',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'Zero visible',
    sections: [{ sectionKey: 'x' }],
    sectionContent: {
      x: { heading: '\u200B', body: '\uFEFF' },
    },
  },
} as any) as Row

await expectReject(
  'zero-complete EN publish',
  () => publish(String(zeroCreated.id), 'en'),
  /at least one complete section/,
)
console.log('KEYED CONTRACT CASE 6 PASS')

console.log('KEYED CONTRACT CASE 7 locale=all publish fails closed BEGIN')
await expectReject(
  'locale=all publish',
  () => payload.update({
    collection: 'diag-keyed-localized-content',
    id,
    locale: 'all',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
    data: { _status: { en: 'published', ru: 'published' } },
  } as any),
  /locale=all is not supported/,
)
console.log('KEYED CONTRACT CASE 7 PASS')

console.log('KEYED LOCALIZED CONTENT CONTRACT: 7/7 PASS')
await payload.destroy()
