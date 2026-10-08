import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './localized-publish-policy-config.js'
import { classifyLocalizedPair } from './localized-section-semantics.js'
import { projectLocalizedDocument } from './localized-section-projection.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })

async function read(id: string, locale: Locale, draft = true): Promise<Row> {
  return payload.findByID({
    collection: 'impl-localized-publish-policy',
    id,
    locale,
    fallbackLocale: false,
    draft,
    overrideAccess: true,
  } as any) as Promise<Row>
}

async function publish(id: string, locale: Locale) {
  return payload.update({
    collection: 'impl-localized-publish-policy',
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

console.log('CONTRACT CASE 1 create and publish complete EN BEGIN')
const created = await payload.create({
  collection: 'impl-localized-publish-policy',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN guide',
    sections: [
      { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
      { sectionKey: 'b', heading: 'Beta', body: 'Beta body' },
      { sectionKey: 'c', heading: 'Gamma', body: 'Gamma body' },
    ],
  },
} as any) as Row

const id = String(created.id)
const ids = (created.sections as Row[]).map((row) => String(row.id))

await publish(id, 'en')
const enPublished = await read(id, 'en', false)
assert.equal(enPublished._status, 'published')
assert.deepEqual(
  projectLocalizedDocument(enPublished).sections.map((row: Row) => row.sectionKey),
  ['a', 'b', 'c'],
)
console.log('CONTRACT CASE 1 PASS')

console.log('CONTRACT CASE 2 RU draft allows complete + untranslated + partial and collapses empty BEGIN')
await payload.update({
  collection: 'impl-localized-publish-policy',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU guide',
    sections: [
      {
        id: ids[0],
        sectionKey: 'a',
        heading: 'Альфа',
        body: 'Текст альфа',
      },
      {
        id: ids[1],
        sectionKey: 'b',
        heading: ' \u200B\uFEFF ',
        body: '\u00A0\u2060',
      },
      {
        id: ids[2],
        sectionKey: 'c',
        heading: 'Гамма',
        body: null,
      },
    ],
  },
} as any)

const ruDraft = await read(id, 'ru', true)
assert.equal(classifyLocalizedPair(ruDraft.sections[0].heading, ruDraft.sections[0].body), 'complete')
assert.equal(ruDraft.sections[1].heading, null)
assert.equal(ruDraft.sections[1].body, null)
assert.equal(classifyLocalizedPair(ruDraft.sections[1].heading, ruDraft.sections[1].body), 'untranslated')
assert.equal(classifyLocalizedPair(ruDraft.sections[2].heading, ruDraft.sections[2].body), 'partial')

const enAfterRuDraft = await read(id, 'en', true)
assert.equal(enAfterRuDraft.sections[0].heading, 'Alpha')
assert.equal(enAfterRuDraft.sections[1].heading, 'Beta')
assert.equal(enAfterRuDraft.sections[2].heading, 'Gamma')
console.log('CONTRACT CASE 2 PASS')

console.log('CONTRACT CASE 3 partial RU publication is rejected BEGIN')
await expectReject(
  'partial RU publication',
  () => publish(id, 'ru'),
  /must have both heading and body, or neither/,
)
const ruAfterReject = await read(id, 'ru', false)
assert.notEqual(ruAfterReject._status, 'published')
console.log('CONTRACT CASE 3 PASS')

console.log('CONTRACT CASE 4 repair partial row then publish RU BEGIN')
await payload.update({
  collection: 'impl-localized-publish-policy',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU guide',
    sections: [
      {
        id: ids[0],
        sectionKey: 'a',
        heading: 'Альфа',
        body: 'Текст альфа',
      },
      {
        id: ids[1],
        sectionKey: 'b',
        heading: null,
        body: null,
      },
      {
        id: ids[2],
        sectionKey: 'c',
        heading: 'Гамма',
        body: 'Текст гамма',
      },
    ],
  },
} as any)

await publish(id, 'ru')
const ruPublished = await read(id, 'ru', false)
assert.equal(ruPublished._status, 'published')
assert.equal(ruPublished.sections[1].heading, null)
assert.equal(ruPublished.sections[1].body, null)
console.log('CONTRACT CASE 4 PASS')

console.log('CONTRACT CASE 5 public projection emits only complete RU rows BEGIN')
const projectedRu = projectLocalizedDocument(ruPublished)
assert.deepEqual(
  projectedRu.sections.map((row: Row) => row.sectionKey),
  ['a', 'c'],
)
assert.deepEqual(
  (ruPublished.sections as Row[]).map((row) => row.sectionKey),
  ['a', 'b', 'c'],
)
console.log('CONTRACT CASE 5 PASS:', JSON.stringify({
  raw: (ruPublished.sections as Row[]).map((row) => row.sectionKey),
  projected: projectedRu.sections.map((row: Row) => row.sectionKey),
}))

console.log('CONTRACT CASE 6 shared reorder preserves locale values and projection order BEGIN')
await payload.update({
  collection: 'impl-localized-publish-policy',
  id,
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN guide',
    sections: [
      {
        id: ids[2],
        sectionKey: 'c',
        heading: 'Gamma',
        body: 'Gamma body',
      },
      {
        id: ids[0],
        sectionKey: 'a',
        heading: 'Alpha',
        body: 'Alpha body',
      },
      {
        id: ids[1],
        sectionKey: 'b',
        heading: 'Beta',
        body: 'Beta body',
      },
    ],
  },
} as any)

const enReordered = await read(id, 'en', true)
const ruAfterReorder = await read(id, 'ru', true)

assert.deepEqual(
  (enReordered.sections as Row[]).map((row) => row.sectionKey),
  ['c', 'a', 'b'],
)
assert.deepEqual(
  (ruAfterReorder.sections as Row[]).map((row) => row.sectionKey),
  ['c', 'a', 'b'],
)
assert.equal(ruAfterReorder.sections[0].heading, 'Гамма')
assert.equal(ruAfterReorder.sections[1].heading, 'Альфа')
assert.equal(ruAfterReorder.sections[2].heading, null)
assert.deepEqual(
  projectLocalizedDocument(ruAfterReorder).sections.map((row: Row) => row.sectionKey),
  ['c', 'a'],
)
console.log('CONTRACT CASE 6 PASS')

console.log('CONTRACT CASE 7 locale=all publish intent fails closed BEGIN')
await expectReject(
  'locale=all publish',
  () => payload.update({
    collection: 'impl-localized-publish-policy',
    id,
    locale: 'all',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
    data: { _status: { en: 'published', ru: 'published' } },
  } as any),
  /locale=all is not supported/,
)
console.log('CONTRACT CASE 7 PASS')

console.log('LOCALIZED CONTENT CONTRACT: 7/7 PASS')
await payload.destroy()
