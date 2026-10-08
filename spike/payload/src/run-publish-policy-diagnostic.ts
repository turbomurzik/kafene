import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './publish-policy-diagnostic-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })
let counter = 0

function sectionIds(doc: Row): [string, string] {
  const ids = (doc.sections as Row[]).map((row) => String(row.id))
  return [ids[0], ids[1]]
}

async function read(id: string, locale: Locale, draft = true): Promise<Row> {
  return payload.findByID({
    collection: 'diag-publish-policy',
    id,
    locale,
    fallbackLocale: false,
    draft,
    overrideAccess: true,
  } as any) as Promise<Row>
}

async function publish(id: string, locale: Locale) {
  return payload.update({
    collection: 'diag-publish-policy',
    id,
    locale,
    fallbackLocale: false,
    publishSpecificLocale: locale,
    draft: false,
    data: { _status: 'published' },
    overrideAccess: true,
  } as any)
}

async function createBase(label: string) {
  counter += 1
  const created = await payload.create({
    collection: 'diag-publish-policy',
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

  return {
    id: String(created.id),
    ids: sectionIds(created),
  }
}

async function setRu(id: string, ids: [string, string], rows: Array<{ heading: unknown; body: unknown }>) {
  return payload.update({
    collection: 'diag-publish-policy',
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      title: 'RU title',
      sections: [
        { id: ids[0], sectionKey: 'a', heading: rows[0].heading, body: rows[0].body },
        { id: ids[1], sectionKey: 'b', heading: rows[1].heading, body: rows[1].body },
      ],
    },
    overrideAccess: true,
  } as any)
}

async function expectReject(label: string, fn: () => Promise<unknown>) {
  let rejected = false
  try {
    await fn()
  } catch (error) {
    rejected = true
    console.log(`EXPECTED REJECT ${label}:`, error instanceof Error ? error.message : String(error))
  }
  assert.equal(rejected, true, `${label} should reject`)
}

async function testEnOnlyPublishWithoutRu() {
  const f = await createBase('en-only')
  await publish(f.id, 'en')
  const enPublished = await read(f.id, 'en', false)
  const ruPublished = await read(f.id, 'ru', false)

  assert.equal(enPublished._status, 'published')
  assert.notEqual(ruPublished._status, 'published')

  console.log('POLICY T1 EN-only publish:', JSON.stringify({
    enStatus: enPublished._status,
    ruStatus: ruPublished._status ?? null,
    ruRows: (ruPublished.sections as Row[]).map((row) => ({
      id: row.id,
      heading: row.heading ?? null,
      body: row.body ?? null,
    })),
  }))
}

async function testRuPublishWithEnOnlyRow() {
  const f = await createBase('ru-with-en-only-row')
  await publish(f.id, 'en')

  await setRu(f.id, f.ids, [
    { heading: 'Альфа', body: 'Текст альфа' },
    { heading: null, body: null },
  ])

  await publish(f.id, 'ru')
  const ruPublished = await read(f.id, 'ru', false)
  assert.equal(ruPublished._status, 'published')

  const rows = ruPublished.sections as Row[]
  assert.equal(rows[0].heading, 'Альфа')
  assert.equal(rows[0].body, 'Текст альфа')
  assert.equal(rows[1].heading, null)
  assert.equal(rows[1].body, null)

  console.log('POLICY T2 RU publish with EN-only row:', JSON.stringify(
    rows.map((row) => ({ id: row.id, heading: row.heading ?? null, body: row.body ?? null })),
  ))
}

async function testPartialDraftAllowed() {
  const f = await createBase('partial-draft')
  await publish(f.id, 'en')

  await setRu(f.id, f.ids, [
    { heading: 'Только заголовок', body: null },
    { heading: null, body: null },
  ])

  const ruDraft = await read(f.id, 'ru', true)
  const rows = ruDraft.sections as Row[]
  assert.equal(rows[0].heading, 'Только заголовок')
  assert.equal(rows[0].body, null)

  console.log('POLICY T3 partial draft allowed:', JSON.stringify({
    heading: rows[0].heading,
    body: rows[0].body ?? null,
  }))
}

async function testPartialPublishRejected() {
  const f = await createBase('partial-publish')
  await publish(f.id, 'en')

  await setRu(f.id, f.ids, [
    { heading: 'Только заголовок', body: null },
    { heading: null, body: null },
  ])

  await expectReject('partial RU publish', () => publish(f.id, 'ru'))
}

async function testInvisibleUnicodePolicy() {
  const f = await createBase('unicode-empty')
  await publish(f.id, 'en')

  await setRu(f.id, f.ids, [
    { heading: '\u200B', body: '\uFEFF' },
    { heading: 'Нормальный', body: 'Текст' },
  ])
  await publish(f.id, 'ru')

  const ruPublished = await read(f.id, 'ru', false)
  console.log('POLICY T5 unicode-only pair treated empty:', JSON.stringify(
    (ruPublished.sections as Row[]).map((row) => ({
      heading: row.heading ?? null,
      body: row.body ?? null,
    })),
  ))

  const f2 = await createBase('unicode-partial')
  await publish(f2.id, 'en')
  await setRu(f2.id, f2.ids, [
    { heading: 'Заголовок', body: '\u200B' },
    { heading: null, body: null },
  ])
  await expectReject('meaningful heading + invisible body', () => publish(f2.id, 'ru'))
}

const tests: Array<[string, () => Promise<void>]> = [
  ['T1 EN-only publication without RU', testEnOnlyPublishWithoutRu],
  ['T2 RU publication with EN-only row', testRuPublishWithEnOnlyRow],
  ['T3 partial RU draft allowed', testPartialDraftAllowed],
  ['T4 partial RU publish rejected', testPartialPublishRejected],
  ['T5 Unicode-empty publication policy', testInvisibleUnicodePolicy],
]

let failed = 0
for (const [name, fn] of tests) {
  try {
    await fn()
    console.log(`PASS  ${name}`)
  } catch (error) {
    failed += 1
    console.error(`FAIL  ${name}`)
    console.error(error instanceof Error ? error.stack ?? error.message : String(error))
  }
}

console.log(`\n${tests.length - failed}/${tests.length} publish-policy checks passed.`)
await payload.destroy()
if (failed > 0) process.exitCode = 1
