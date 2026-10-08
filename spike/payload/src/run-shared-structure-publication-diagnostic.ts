import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './localized-publish-policy-config.js'
import { projectLocalizedDocument } from './localized-section-projection.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })

async function read(id: string, locale: Locale, draft: boolean): Promise<Row> {
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

function order(doc: Row): string[] {
  return (doc.sections as Row[]).map((row) => String(row.sectionKey))
}

function visibleOrder(doc: Row): string[] {
  return projectLocalizedDocument(doc).sections.map((row: Row) => String(row.sectionKey))
}

async function snapshot(id: string, label: string) {
  const enDraft = await read(id, 'en', true)
  const ruDraft = await read(id, 'ru', true)
  const enPublished = await read(id, 'en', false)
  const ruPublished = await read(id, 'ru', false)

  const result = {
    label,
    enDraft: { order: order(enDraft), visible: visibleOrder(enDraft), status: enDraft._status ?? null },
    ruDraft: { order: order(ruDraft), visible: visibleOrder(ruDraft), status: ruDraft._status ?? null },
    enPublished: { order: order(enPublished), visible: visibleOrder(enPublished), status: enPublished._status ?? null },
    ruPublished: { order: order(ruPublished), visible: visibleOrder(ruPublished), status: ruPublished._status ?? null },
  }

  console.log('STRUCTURE SNAPSHOT:', JSON.stringify(result))
  return result
}

const created = await payload.create({
  collection: 'impl-localized-publish-policy',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN structure diagnostic',
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

await payload.update({
  collection: 'impl-localized-publish-policy',
  id,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'RU structure diagnostic',
    sections: [
      { id: ids[0], sectionKey: 'a', heading: 'Альфа', body: 'Текст альфа' },
      { id: ids[1], sectionKey: 'b', heading: null, body: null },
      { id: ids[2], sectionKey: 'c', heading: 'Гамма', body: 'Текст гамма' },
    ],
  },
} as any)

await publish(id, 'ru')
const baseline = await snapshot(id, 'BASELINE BOTH PUBLISHED')
assert.deepEqual(baseline.enPublished.order, ['a', 'b', 'c'])
assert.deepEqual(baseline.ruPublished.order, ['a', 'b', 'c'])

await payload.update({
  collection: 'impl-localized-publish-policy',
  id,
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  overrideAccess: true,
  data: {
    title: 'EN structure diagnostic',
    sections: [
      { id: ids[2], sectionKey: 'c', heading: 'Gamma', body: 'Gamma body' },
      { id: ids[0], sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
      { id: ids[1], sectionKey: 'b', heading: 'Beta', body: 'Beta body' },
    ],
  },
} as any)

const afterDraft = await snapshot(id, 'AFTER EN DRAFT REORDER')
assert.deepEqual(afterDraft.enDraft.order, ['c', 'a', 'b'])
assert.deepEqual(afterDraft.ruDraft.order, ['a', 'b', 'c'])
assert.deepEqual(afterDraft.enPublished.order, ['a', 'b', 'c'])
assert.deepEqual(afterDraft.ruPublished.order, ['a', 'b', 'c'])

await publish(id, 'en')
const afterEnPublish = await snapshot(id, 'AFTER EN PUBLISH')

console.log('DIAGNOSTIC RESULT:', JSON.stringify({
  enPublishAdvancedEnPublished:
    JSON.stringify(afterEnPublish.enPublished.order) === JSON.stringify(['c', 'a', 'b']),
  enPublishAdvancedRuDraft:
    JSON.stringify(afterEnPublish.ruDraft.order) === JSON.stringify(['c', 'a', 'b']),
  enPublishAdvancedRuPublished:
    JSON.stringify(afterEnPublish.ruPublished.order) === JSON.stringify(['c', 'a', 'b']),
}))

await publish(id, 'ru')
const afterRuRepublish = await snapshot(id, 'AFTER RU REPUBLISH')

console.log('DIAGNOSTIC AFTER RU REPUBLISH:', JSON.stringify({
  ruDraftOrder: afterRuRepublish.ruDraft.order,
  ruPublishedOrder: afterRuRepublish.ruPublished.order,
}))

await payload.destroy()
