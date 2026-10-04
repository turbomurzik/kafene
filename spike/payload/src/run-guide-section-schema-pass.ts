import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { getPayload } from 'payload'
import config from './guide-section-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })
const results: Array<{ shape: string; criterion: string; ok: boolean; detail?: string }> = []

async function check(shape: string, criterion: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ shape, criterion, ok: true })
    console.log(`PASS  [${shape}] ${criterion}`)
  } catch (error) {
    const detail = error instanceof Error ? error.stack ?? error.message : String(error)
    results.push({ shape, criterion, ok: false, detail })
    console.error(`FAIL  [${shape}] ${criterion}`)
    console.error(detail)
  }
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => [k, canonicalize(v)]),
    )
  }
  if (typeof value === 'string') return value.normalize('NFC')
  return value
}

function hash(value: unknown): string {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(value)))
    .digest('hex')
}

async function publishLocale(collection: 'array-guides' | 'collection-guides' | 'guide-sections', id: string, locale: Locale) {
  return payload.update({
    collection,
    id,
    data: { _status: 'published' },
    draft: false,
    locale,
    publishSpecificLocale: locale,
    overrideAccess: true,
  } as any)
}

const suffix = Date.now().toString(36)

// ---------------------------------------------------------------------------
// Shape A: one Guide document with non-localized array rows and localized leaves
// ---------------------------------------------------------------------------

let arrayGuide = await payload.create({
  collection: 'array-guides',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: {
    title: `Array guide ${suffix}`,
    sections: [
      { sectionKey: 'requirements', heading: 'Requirements', body: 'Bring passport.' },
      { sectionKey: 'fees', heading: 'Fees', body: 'Fee is EUR 10.' },
    ],
  },
  overrideAccess: true,
}) as Row

const originalRows = (arrayGuide.sections as Row[]).map((row) => ({
  id: String(row.id),
  sectionKey: String(row.sectionKey),
}))

await check('array', 'stable section row IDs survive save and reorder', async () => {
  assert.equal(originalRows.length, 2)
  assert.ok(originalRows.every((r) => r.id && r.id !== 'undefined'))

  arrayGuide = await payload.update({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: [
        { id: originalRows[1].id, sectionKey: 'fees', heading: 'Fees', body: 'Fee is EUR 10.' },
        { id: originalRows[0].id, sectionKey: 'requirements', heading: 'Requirements', body: 'Bring passport.' },
      ],
    },
    overrideAccess: true,
  }) as Row

  const reordered = arrayGuide.sections as Row[]
  assert.deepEqual(
    reordered.map((r) => String(r.id)),
    [originalRows[1].id, originalRows[0].id],
  )
  assert.deepEqual(
    reordered.map((r) => String(r.sectionKey)),
    ['fees', 'requirements'],
  )
})

await check('array', 'EN can publish while RU remains independent', async () => {
  await publishLocale('array-guides', String(arrayGuide.id), 'en')

  await payload.update({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      title: `RU Array guide ${suffix}`,
      sections: [
        { id: originalRows[1].id, sectionKey: 'fees', heading: 'Сборы', body: 'Сбор 10 EUR.' },
        { id: originalRows[0].id, sectionKey: 'requirements', heading: 'Требования', body: 'Нужен паспорт.' },
      ],
    },
    overrideAccess: true,
  } as any)

  const en = await payload.findByID({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Row

  const ru = await payload.findByID({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Row

  assert.equal(en.title, `Array guide ${suffix}`)
  assert.notEqual(ru.title, `Array guide ${suffix}`)
})

await check('array', 'atomic Guide publication keeps sections in one document', async () => {
  const published = await payload.findByID({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Row

  assert.equal(Array.isArray(published.sections), true)
  assert.equal(published.sections.length, 2)
  assert.deepEqual(
    new Set((published.sections as Row[]).map((r) => String(r.sectionKey))),
    new Set(['requirements', 'fees']),
  )
})

await check('array', 'versions preserve section set and stable IDs', async () => {
  const versions = await payload.findVersions({
    collection: 'array-guides',
    where: { parent: { equals: arrayGuide.id } },
    limit: 50,
    locale: 'all',
    fallbackLocale: false,
    overrideAccess: true,
  } as any)

  assert.ok(versions.totalDocs >= 2)
  const withSections = versions.docs.find((v: any) => Array.isArray(v.version?.sections) && v.version.sections.length === 2)
  assert.ok(withSections, 'no version preserved the two-section document')
})

await check('array', 'component-manifest hashing can address section IDs independently', async () => {
  const en = await payload.findByID({
    collection: 'array-guides',
    id: arrayGuide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
  }) as Row

  const components = (en.sections as Row[]).map((row) => ({
    componentId: String(row.id),
    sectionKey: String(row.sectionKey),
    componentHash: hash({
      heading: row.heading,
      body: row.body,
    }),
  }))

  assert.equal(components.length, 2)
  assert.notEqual(components[0].componentId, components[1].componentId)
  assert.ok(components.every((c) => /^[0-9a-f]{64}$/i.test(c.componentHash)))
})

// ---------------------------------------------------------------------------
// Shape B: Guide document + independent GuideSection collection
// ---------------------------------------------------------------------------

const collectionGuide = await payload.create({
  collection: 'collection-guides',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: { title: `Collection guide ${suffix}` },
  overrideAccess: true,
}) as Row

const sectionA = await payload.create({
  collection: 'guide-sections',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: {
    guide: collectionGuide.id,
    sectionKey: 'requirements',
    position: 1,
    heading: 'Requirements',
    body: 'Bring passport.',
  },
  overrideAccess: true,
}) as Row

const sectionB = await payload.create({
  collection: 'guide-sections',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: {
    guide: collectionGuide.id,
    sectionKey: 'fees',
    position: 2,
    heading: 'Fees',
    body: 'Fee is EUR 10.',
  },
  overrideAccess: true,
}) as Row

await check('collection', 'section IDs are intrinsically stable across reorder', async () => {
  await payload.update({
    collection: 'guide-sections',
    id: sectionA.id,
    locale: 'en',
    draft: true,
    data: { position: 2 },
    overrideAccess: true,
  })
  await payload.update({
    collection: 'guide-sections',
    id: sectionB.id,
    locale: 'en',
    draft: true,
    data: { position: 1 },
    overrideAccess: true,
  })

  const a2 = await payload.findByID({
    collection: 'guide-sections',
    id: sectionA.id,
    locale: 'en',
    draft: true,
    overrideAccess: true,
  }) as Row
  const b2 = await payload.findByID({
    collection: 'guide-sections',
    id: sectionB.id,
    locale: 'en',
    draft: true,
    overrideAccess: true,
  }) as Row

  assert.equal(String(a2.id), String(sectionA.id))
  assert.equal(String(b2.id), String(sectionB.id))
  assert.equal(a2.position, 2)
  assert.equal(b2.position, 1)
})

await check('collection', 'locale independence works per section document', async () => {
  await payload.update({
    collection: 'guide-sections',
    id: sectionA.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { heading: 'Требования', body: 'Нужен паспорт.' },
    overrideAccess: true,
  } as any)

  const en = await payload.findByID({
    collection: 'guide-sections',
    id: sectionA.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
  }) as Row
  const ru = await payload.findByID({
    collection: 'guide-sections',
    id: sectionA.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
  }) as Row

  assert.equal(en.heading, 'Requirements')
  assert.equal(ru.heading, 'Требования')
})

await check('collection', 'separate collection permits partial publication (atomicity risk is real)', async () => {
  await publishLocale('collection-guides', String(collectionGuide.id), 'en')
  await publishLocale('guide-sections', String(sectionA.id), 'en')

  const publishedSections = await payload.find({
    collection: 'guide-sections',
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    where: {
      and: [
        { guide: { equals: collectionGuide.id } },
        { _status: { equals: 'published' } },
      ],
    },
    limit: 20,
    overrideAccess: true,
  } as any)

  assert.equal(
    publishedSections.docs.length,
    1,
    'expected Payload to allow one section published while sibling remains draft',
  )
  assert.equal(String(publishedSections.docs[0].id), String(sectionA.id))
})

await check('collection', 'versions exist independently for Guide and sections', async () => {
  const guideVersions = await payload.findVersions({
    collection: 'collection-guides',
    where: { parent: { equals: collectionGuide.id } },
    limit: 50,
    locale: 'all',
    fallbackLocale: false,
    overrideAccess: true,
  } as any)

  const sectionVersions = await payload.findVersions({
    collection: 'guide-sections',
    where: { parent: { equals: sectionA.id } },
    limit: 50,
    locale: 'all',
    fallbackLocale: false,
    overrideAccess: true,
  } as any)

  assert.ok(guideVersions.totalDocs >= 1)
  assert.ok(sectionVersions.totalDocs >= 1)
})

await check('collection', 'component-manifest hashing can address section UUIDs independently', async () => {
  const docs = await payload.find({
    collection: 'guide-sections',
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    where: { guide: { equals: collectionGuide.id } },
    sort: 'position',
    limit: 20,
    overrideAccess: true,
  } as any)

  const components = docs.docs.map((row: Row) => ({
    componentId: String(row.id),
    sectionKey: String(row.sectionKey),
    componentHash: hash({ heading: row.heading, body: row.body }),
  }))

  assert.equal(components.length, 2)
  assert.ok(components.every((x: any) => /^[0-9a-f]{64}$/i.test(x.componentHash)))
})

console.log('\n--- GuideSection schema-pass summary ---')
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  [${result.shape}] ${result.criterion}`)
}

const failed = results.filter((x) => !x.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)
console.log('\nInterpretation note:')
console.log('- Array shape should preserve Guide-level atomic publication if row IDs are stable.')
console.log('- Separate collection is expected to expose partial-publication risk unless KAFENE adds an explicit transaction/orchestration layer.')

await payload.destroy()

if (failed.length > 0) process.exitCode = 1
