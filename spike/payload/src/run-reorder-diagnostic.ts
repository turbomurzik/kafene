import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './reorder-diagnostic-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>
type CollectionSlug = 'diag-required-localized' | 'diag-optional-localized' | 'diag-plain-array'

const payload = await getPayload({ config })
let counter = 0

function ids(doc: Row): string[] {
  return (doc.sections as Row[]).map((row) => String(row.id))
}

async function read(id: string, collection: CollectionSlug, locale: Locale, draft = true): Promise<Row> {
  return payload.findByID({
    collection: collection as any,
    id,
    locale,
    fallbackLocale: false,
    draft,
    overrideAccess: true,
  } as any) as Promise<Row>
}

async function publish(id: string, collection: CollectionSlug, locale: Locale) {
  return payload.update({
    collection: collection as any,
    id,
    locale,
    fallbackLocale: false,
    publishSpecificLocale: locale,
    draft: false,
    data: { _status: 'published' },
    overrideAccess: true,
  } as any)
}

async function createGuide(collection: CollectionSlug, label: string, localizedContent: boolean): Promise<Row> {
  counter += 1
  const created = await payload.create({
    collection: collection as any,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      title: `EN ${label}-${counter}`,
      sections: [
        { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
        { sectionKey: 'b', heading: 'Beta', body: 'Beta body' },
      ],
    },
    overrideAccess: true,
  } as any) as Row

  const sectionIds = ids(created)
  if (localizedContent) {
    await payload.update({
      collection: collection as any,
      id: created.id,
      locale: 'ru',
      fallbackLocale: false,
      draft: true,
      data: {
        title: `RU ${label}-${counter}`,
        sections: [
          { id: sectionIds[0], sectionKey: 'a', heading: 'Альфа', body: 'Текст альфа' },
          { id: sectionIds[1], sectionKey: 'b', heading: 'Бета', body: 'Текст бета' },
        ],
      },
      overrideAccess: true,
    } as any)
  } else {
    await payload.update({
      collection: collection as any,
      id: created.id,
      locale: 'ru',
      fallbackLocale: false,
      draft: true,
      data: { title: `RU ${label}-${counter}` },
      overrideAccess: true,
    } as any)
  }

  await publish(String(created.id), collection, 'en')
  await publish(String(created.id), collection, 'ru')
  return read(String(created.id), collection, 'en', true)
}

async function reverseEn(id: string, collection: CollectionSlug) {
  const before = await read(id, collection, 'en', true)
  const beforeIds = ids(before)
  const targetRows = [...(before.sections as Row[])].reverse()
  const targetIds = targetRows.map((row) => String(row.id))
  assert.notDeepEqual(targetIds, beforeIds)

  const returned = await payload.update({
    collection: collection as any,
    id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: targetRows.map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: row.body,
      })),
    },
    overrideAccess: true,
  } as any) as Row

  const refetched = await read(id, collection, 'en', true)
  return {
    beforeIds,
    targetIds,
    returnedIds: ids(returned),
    refetchedIds: ids(refetched),
    outcome: JSON.stringify(ids(refetched)) === JSON.stringify(targetIds) ? 'APPLIED' : 'IGNORED',
  }
}

async function versionCount(id: string, collection: CollectionSlug) {
  const result = await payload.findVersions({
    collection: collection as any,
    where: { parent: { equals: id } },
    limit: 100,
    overrideAccess: true,
  } as any)
  return result.totalDocs
}

function jsonSafe(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (typeof value === 'bigint') return value.toString()
  if (Array.isArray(value)) return value.map(jsonSafe)
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, jsonSafe(v)]))
  }
  return value
}

async function rawTables(prefix: string) {
  const tables = (payload.db as any).tables as Record<string, any>
  const names = Object.keys(tables).filter((name) => name.includes(prefix.replaceAll('-', '_')) || name.includes(prefix.replaceAll('-', '')))
  const out: Record<string, unknown> = {}
  for (const name of names) {
    try {
      out[name] = jsonSafe(await (payload.db as any).drizzle.select().from(tables[name]).limit(50))
    } catch (error) {
      out[name] = { error: error instanceof Error ? error.message : String(error) }
    }
  }
  return { tableNames: Object.keys(tables), matching: out }
}

async function t0Baseline() {
  const collection: CollectionSlug = 'diag-required-localized'
  const f = await createGuide(collection, 't0', true)
  const id = String(f.id)

  const ru = await read(id, collection, 'ru', true)
  await payload.update({
    collection: collection as any,
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row, index) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: index === 1 ? '\u200B' : row.heading,
        body: index === 1 ? '\u200B' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  await publish(id, collection, 'ru')

  const versionsBefore = await versionCount(id, collection)
  const rawBefore = await rawTables('diag-required-localized')
  const reorder = await reverseEn(id, collection)
  const versionsAfter = await versionCount(id, collection)
  const rawAfter = await rawTables('diag-required-localized')

  console.log('DIAG T0 baseline:', JSON.stringify({
    reorder,
    versionsBefore,
    versionsAfter,
    rawBefore,
    rawAfter,
  }))
}

async function t1NormalRuContent() {
  const collection: CollectionSlug = 'diag-required-localized'
  const f = await createGuide(collection, 't1', true)
  const reorder = await reverseEn(String(f.id), collection)
  console.log('DIAG T1 normal RU content:', JSON.stringify(reorder))
}

async function t2RuDraftOnlyInvisible() {
  const collection: CollectionSlug = 'diag-required-localized'
  const f = await createGuide(collection, 't2', true)
  const id = String(f.id)
  const ru = await read(id, collection, 'ru', true)
  await payload.update({
    collection: collection as any,
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row, index) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: index === 1 ? '\u200B' : row.heading,
        body: index === 1 ? '\u200B' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  const reorder = await reverseEn(id, collection)
  console.log('DIAG T2 RU invisible draft only:', JSON.stringify(reorder))
}

async function t4OptionalLocalizedNull() {
  const collection: CollectionSlug = 'diag-optional-localized'
  const f = await createGuide(collection, 't4', true)
  const id = String(f.id)
  const ru = await read(id, collection, 'ru', true)
  await payload.update({
    collection: collection as any,
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row, index) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: index === 1 ? null : row.heading,
        body: index === 1 ? null : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  await publish(id, collection, 'ru')
  const ruPublished = await read(id, collection, 'ru', false)
  const reorder = await reverseEn(id, collection)
  console.log('DIAG T4 optional localized null:', JSON.stringify({
    ruPublished: (ruPublished.sections as Row[]).map((row) => ({ id: row.id, heading: row.heading, body: row.body })),
    reorder,
  }))
}

async function t6PlainArray() {
  const collection: CollectionSlug = 'diag-plain-array'
  const f = await createGuide(collection, 't6', false)
  const reorder = await reverseEn(String(f.id), collection)
  console.log('DIAG T6 array without localized row fields:', JSON.stringify(reorder))
}

const scenarios: Array<[string, () => Promise<void>]> = [
  ['T0 baseline + raw DB/version evidence', t0Baseline],
  ['T1 normal RU content', t1NormalRuContent],
  ['T2 RU invisible draft only', t2RuDraftOnlyInvisible],
  ['T4 optional localized null', t4OptionalLocalizedNull],
  ['T6 array without localized row fields', t6PlainArray],
]

let failed = 0
for (const [name, fn] of scenarios) {
  try {
    await fn()
    console.log(`PASS  ${name}`)
  } catch (error) {
    failed += 1
    console.error(`FAIL  ${name}`)
    console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  }
}

await payload.destroy()
if (failed > 0) process.exitCode = 1
