import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './keyed-localized-content-config.js'

type Locale = 'en' | 'ru'
type Row = Record<string, any>

const payload = await getPayload({ config })
let counter = 0

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

async function createBase(label: string) {
  counter += 1
  const created = await payload.create({
    collection: 'diag-keyed-localized-content',
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    data: {
      title: `EN ${label}-${counter}`,
      sections: [
        { sectionKey: 'a' },
        { sectionKey: 'b' },
      ],
      sectionContent: {
        a: { heading: 'Alpha', body: 'Alpha body' },
        b: { heading: 'Beta', body: 'Beta body' },
      },
    },
  } as any) as Row

  return String(created.id)
}

async function setRu(id: string, sectionContent: Record<string, unknown>) {
  return payload.update({
    collection: 'diag-keyed-localized-content',
    id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    overrideAccess: true,
    data: {
      title: 'RU title',
      sectionContent,
    },
  } as any)
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

console.log('KEYED POLICY CASE 1 partial draft is allowed BEGIN')
{
  const id = await createBase('partial-draft')
  await setRu(id, {
    a: { heading: 'Только заголовок', body: null },
    b: { heading: null, body: null },
  })
  const ru = await read(id, 'ru', true)
  assert.equal(ru.sectionContent.a.heading, 'Только заголовок')
  assert.equal(ru.sectionContent.a.body, null)
  console.log('KEYED POLICY CASE 1 PASS')
}

console.log('KEYED POLICY CASE 2 complete plus untranslated RU publishes BEGIN')
{
  const id = await createBase('mixed-publish')
  await setRu(id, {
    a: { heading: 'Альфа', body: 'Текст альфа' },
    b: { heading: '\u200B', body: '\uFEFF' },
  })
  await publish(id, 'ru')
  const ru = await read(id, 'ru', false)
  assert.equal(ru._status, 'published')
  assert.equal(ru.sectionContent.a.heading, 'Альфа')
  assert.equal(ru.sectionContent.b.heading, null)
  assert.equal(ru.sectionContent.b.body, null)
  console.log('KEYED POLICY CASE 2 PASS')
}

console.log('KEYED POLICY CASE 3 partial RU publication is rejected BEGIN')
{
  const id = await createBase('partial-publish')
  await setRu(id, {
    a: { heading: 'Только заголовок', body: null },
    b: { heading: null, body: null },
  })
  await expectReject(
    'partial RU publish',
    () => publish(id, 'ru'),
    /must have both heading and body, or neither/,
  )
  console.log('KEYED POLICY CASE 3 PASS')
}

console.log('KEYED POLICY CASE 4 zero-complete RU publication is rejected BEGIN')
{
  const id = await createBase('zero-complete')
  await setRu(id, {
    a: { heading: '\u200B', body: '\uFEFF' },
    b: { heading: null, body: null },
  })
  await expectReject(
    'zero-complete RU publish',
    () => publish(id, 'ru'),
    /at least one complete section/,
  )
  console.log('KEYED POLICY CASE 4 PASS')
}

console.log('KEYED POLICY CASE 5 publish update may omit sections and sectionContent BEGIN')
{
  const id = await createBase('omitted-fields')
  await publish(id, 'en')
  const en = await read(id, 'en', false)
  assert.equal(en._status, 'published')
  console.log('KEYED POLICY CASE 5 PASS')
}

console.log('KEYED POLICY CASE 6 locale=all publish intent fails closed BEGIN')
{
  const id = await createBase('locale-all')
  await expectReject(
    'locale=all publish',
    () => payload.update({
      collection: 'diag-keyed-localized-content',
      id,
      locale: 'all',
      fallbackLocale: false,
      draft: false,
      overrideAccess: true,
      data: { _status: { en: 'published', ru: 'draft' } },
    } as any),
    /locale=all is not supported/,
  )
  console.log('KEYED POLICY CASE 6 PASS')
}

console.log('KEYED LOCALIZED PUBLISH POLICY: 6/6 PASS')
await payload.destroy()
