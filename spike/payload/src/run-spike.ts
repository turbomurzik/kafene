import assert from 'node:assert/strict'
import config from './payload.config.js'
import { getPayload } from 'payload'

type Locale = 'en' | 'ru'
type Status = 'draft' | 'published' | null | undefined

const payload = await getPayload({ config })

const results: Array<{ name: string; ok: boolean; detail?: string }> = []

async function check(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    results.push({ name, ok: true })
    console.log(`PASS  ${name}`)
  } catch (error) {
    const detail = error instanceof Error ? error.stack ?? error.message : String(error)
    results.push({ name, ok: false, detail })
    console.error(`FAIL  ${name}`)
    console.error(detail)
  }
}

function statusFor(doc: Record<string, unknown>, locale: Locale): Status {
  const raw = doc._status
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    return (raw as Record<string, Status>)[locale]
  }
  return raw as Status
}

function isUUID(value: unknown): value is string {
  return typeof value === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

async function publishLocale(id: string, locale: Locale) {
  // Payload 3.90.2 localizeStatus is still beta. The spike intentionally
  // exercises the version-specific API instead of hiding it behind an adapter.
  return payload.update({
    collection: 'guides',
    id,
    data: { _status: 'published' },
    draft: false,
    locale,
    publishSpecificLocale: locale,
    overrideAccess: true,
  } as any)
}

async function unpublishLocale(id: string, locale: Locale) {
  return payload.update({
    collection: 'guides',
    id,
    data: { _status: 'draft' },
    draft: false,
    locale,
    publishSpecificLocale: locale,
    overrideAccess: true,
  } as any)
}

const suffix = Date.now().toString(36)

const source = await payload.create({
  collection: 'sources',
  data: {
    name: `Official source ${suffix}`,
    url: `https://example.invalid/source/${suffix}`,
  },
  overrideAccess: true,
})

let guide = await payload.create({
  collection: 'guides',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: {
    title: `EN guide ${suffix}`,
    body: 'Verified English body.',
    verificationState: 'verified',
    lastVerified: new Date().toISOString(),
    source: source.id,
  },
  overrideAccess: true,
})

await check('UUID primary keys and UUID relationship target', async () => {
  assert.ok(isUUID(source.id), `source.id is not UUID: ${String(source.id)}`)
  assert.ok(isUUID(guide.id), `guide.id is not UUID: ${String(guide.id)}`)

  const fetched = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'en',
    fallbackLocale: false,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })

  assert.equal(String(fetched.source), String(source.id))
})

await check('EN can publish while RU remains draft/missing', async () => {
  guide = await publishLocale(String(guide.id), 'en') as typeof guide

  const en = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  assert.equal(statusFor(en, 'en'), 'published')
  assert.equal(en.title, `EN guide ${suffix}`)

  const ru = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  assert.notEqual(ru.title, `EN guide ${suffix}`, 'RU silently fell back to EN')
  assert.notEqual(statusFor(ru, 'ru'), 'published', 'RU unexpectedly became published')
})

await check('Incomplete RU draft saves, but RU locale cannot be published', async () => {
  const incomplete = await payload.update({
    collection: 'guides',
    id: guide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      title: `RU title only ${suffix}`,
      verificationState: 'unverified',
    },
    overrideAccess: true,
  }) as Record<string, unknown>

  assert.equal(incomplete.title, `RU title only ${suffix}`)

  let rejected = false
  try {
    await publishLocale(String(guide.id), 'ru')
  } catch {
    rejected = true
  }

  assert.equal(rejected, true, 'Payload allowed publishing RU with required body missing')
})

await check('RU publish/unpublish does not change EN publication state', async () => {
  await payload.update({
    collection: 'guides',
    id: guide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      title: `RU guide ${suffix}`,
      body: 'Проверяемое русское содержание.',
      verificationState: 'verified',
      lastVerified: new Date().toISOString(),
    },
    overrideAccess: true,
  })

  await publishLocale(String(guide.id), 'ru')

  let en = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  let ru = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  assert.equal(statusFor(en, 'en'), 'published')
  assert.equal(statusFor(ru, 'ru'), 'published')
  assert.equal(en.title, `EN guide ${suffix}`)
  assert.equal(ru.title, `RU guide ${suffix}`)

  await unpublishLocale(String(guide.id), 'ru')

  en = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'en',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  ru = await payload.findByID({
    collection: 'guides',
    id: guide.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: false,
    overrideAccess: true,
  }) as Record<string, unknown>

  assert.equal(statusFor(en, 'en'), 'published')
  assert.notEqual(statusFor(ru, 'ru'), 'published')
})

await check('Version history is present after locale lifecycle', async () => {
  const versions = await payload.findVersions({
    collection: 'guides',
    where: {
      parent: {
        equals: guide.id,
      },
    },
    limit: 100,
    locale: 'all',
    fallbackLocale: false,
    overrideAccess: true,
  } as any)

  assert.ok(versions.totalDocs >= 4, `expected >=4 versions, got ${versions.totalDocs}`)
})

await check("Known-risk probe: locale:'all' + published status query", async () => {
  const found = await payload.find({
    collection: 'guides',
    locale: 'all',
    fallbackLocale: false,
    draft: false,
    where: {
      _status: {
        equals: 'published',
      },
    },
    limit: 100,
    overrideAccess: true,
  } as any)

  assert.ok(
    found.docs.some((doc) => String(doc.id) === String(guide.id)),
    "published EN guide disappeared from locale:'all' + _status query",
  )
})

console.log('\n--- KAFENE Payload spike summary ---')
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`)
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

await payload.destroy()

if (failed.length > 0) {
  process.exitCode = 1
}
