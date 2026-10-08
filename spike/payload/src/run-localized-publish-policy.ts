import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './localized-publish-policy-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })
let counter = 0

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

async function createBase(label: string) {
  counter += 1
  const created = await payload.create({
    collection: 'impl-localized-publish-policy',
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    data: {
      title: `EN ${label}-${counter}`,
      sections: [
        { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
        { sectionKey: 'b', heading: 'Beta', body: 'Beta body' },
      ],
    },
  } as any) as Row

  return {
    id: String(created.id),
    ids: (created.sections as Row[]).map((row) => String(row.id)) as [string, string],
  }
}

async function setRu(
  id: string,
  ids: [string, string],
  rows: Array<{ heading: unknown; body: unknown }>,
) {
  await payload.update({
    collection: 'impl-localized-publish-policy',
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    data: {
      title: 'RU title',
      sections: [
        { id: ids[0], sectionKey: 'a', ...rows[0] },
        { id: ids[1], sectionKey: 'b', ...rows[1] },
      ],
    },
  } as any)
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

console.log('CASE 1 partial draft remains allowed BEGIN')
{
  const f = await createBase('partial-draft')
  await setRu(f.id, f.ids, [
    { heading: 'Только заголовок', body: null },
    { heading: null, body: null },
  ])
  const ru = await read(f.id, 'ru', true)
  assert.equal(ru.sections[0].heading, 'Только заголовок')
  assert.equal(ru.sections[0].body, null)
  console.log('CASE 1 PASS')
}

console.log('CASE 2 complete EN publish succeeds when publish update omits sections BEGIN')
{
  const f = await createBase('en-publish')
  await publish(f.id, 'en')
  const en = await read(f.id, 'en', false)
  assert.equal(en._status, 'published')
  console.log('CASE 2 PASS')
}

console.log('CASE 3 RU publish allows complete plus untranslated rows BEGIN')
{
  const f = await createBase('ru-mixed')
  await setRu(f.id, f.ids, [
    { heading: 'Альфа', body: 'Текст альфа' },
    { heading: '\u200B', body: '\uFEFF' },
  ])
  await publish(f.id, 'ru')
  const ru = await read(f.id, 'ru', false)
  assert.equal(ru._status, 'published')
  assert.equal(ru.sections[0].heading, 'Альфа')
  assert.equal(ru.sections[1].heading, null)
  assert.equal(ru.sections[1].body, null)
  console.log('CASE 3 PASS')
}

console.log('CASE 4 partial RU publish is rejected BEGIN')
{
  const f = await createBase('ru-partial')
  await setRu(f.id, f.ids, [
    { heading: 'Только заголовок', body: null },
    { heading: null, body: null },
  ])
  await expectReject(
    'partial RU publish',
    () => publish(f.id, 'ru'),
    /must have both heading and body, or neither/,
  )
  console.log('CASE 4 PASS')
}

console.log('CASE 5 zero-visible RU publish is rejected BEGIN')
{
  const f = await createBase('ru-empty')
  await setRu(f.id, f.ids, [
    { heading: '\u200B', body: '\uFEFF' },
    { heading: null, body: null },
  ])
  await expectReject(
    'zero-visible RU publish',
    () => publish(f.id, 'ru'),
    /at least one complete section/,
  )
  console.log('CASE 5 PASS')
}

console.log('CASE 6 locale=all publication intent fails closed BEGIN')
{
  const f = await createBase('locale-all')
  await expectReject(
    'locale=all publish',
    () => payload.update({
      collection: 'impl-localized-publish-policy',
      id: f.id,
      locale: 'all',
      fallbackLocale: false,
      draft: false,
      overrideAccess: true,
      data: { _status: { en: 'published', ru: 'draft' } },
    } as any),
    /locale=all is not supported/,
  )
  console.log('CASE 6 PASS')
}

console.log('LOCALIZED PUBLISH POLICY: 6/6 PASS')
await payload.destroy()
