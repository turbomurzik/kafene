import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './publish-context-diagnostic-config.js'

type Row = Record<string, any>
const payload = await getPayload({ config })

async function createGuide() {
  const created = await payload.create({
    collection: 'diag-publish-context',
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      title: 'EN base',
      sections: [
        { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
        { sectionKey: 'b', heading: 'Beta', body: 'Beta body' },
      ],
    },
    overrideAccess: true,
  } as any) as Row

  const ids = (created.sections as Row[]).map((row) => String(row.id))

  await payload.update({
    collection: 'diag-publish-context',
    id: created.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      title: 'RU base',
      sections: [
        { id: ids[0], sectionKey: 'a', heading: 'Альфа', body: 'Текст альфа' },
        { id: ids[1], sectionKey: 'b', heading: null, body: null },
      ],
    },
    overrideAccess: true,
  } as any)

  return String(created.id)
}

async function read(id: string, locale: 'en' | 'ru', draft = true) {
  return payload.findByID({
    collection: 'diag-publish-context',
    id,
    locale,
    fallbackLocale: false,
    draft,
    overrideAccess: true,
  } as any) as Promise<Row>
}

async function runCase(label: string, args: Record<string, unknown>) {
  const id = await createGuide()
  console.log(`CASE ${label} BEGIN`)
  let outcome = 'ok'
  try {
    await payload.update({
      collection: 'diag-publish-context',
      id,
      overrideAccess: true,
      ...args,
    } as any)
  } catch (error) {
    outcome = `error: ${error instanceof Error ? error.message : String(error)}`
  }

  const en = await read(id, 'en', true)
  const ru = await read(id, 'ru', true)
  console.log(`CASE ${label} RESULT:`, JSON.stringify({
    outcome,
    enStatus: en._status ?? null,
    ruStatus: ru._status ?? null,
  }))
}

await runCase('A locale=en publishSpecificLocale=ru', {
  locale: 'en',
  fallbackLocale: false,
  publishSpecificLocale: 'ru',
  draft: false,
  data: { _status: 'published' },
})

await runCase('B locale=ru publishSpecificLocale=ru', {
  locale: 'ru',
  fallbackLocale: false,
  publishSpecificLocale: 'ru',
  draft: false,
  data: { _status: 'published' },
})

await runCase('C locale=en no publishSpecificLocale', {
  locale: 'en',
  fallbackLocale: false,
  draft: false,
  data: { _status: 'published' },
})

await runCase('D locale=all object status', {
  locale: 'all',
  fallbackLocale: false,
  draft: false,
  data: { _status: { en: 'published', ru: 'draft' } },
})

await payload.destroy()
