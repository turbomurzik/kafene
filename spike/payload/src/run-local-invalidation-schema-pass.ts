import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './local-invalidation-config.js'
import { canonicalHash } from './canonical-serialization.js'

type Locale = 'en' | 'ru'
type Surface = 'draft' | 'published'
type Row = Record<string, any>

type ComponentIdentity = {
  entity: 'guide' | 'guide-section'
  componentType: 'title' | 'summary' | 'applicability' | 'structure' | 'section'
  componentId: string
  locale: Locale | null
}

type ComponentState = {
  identity: ComponentIdentity
  hash: string
  exists: boolean
  tombstoned?: boolean
}

type ManifestEntry = {
  identity: ComponentIdentity
  hash: string
}

type ArtifactManifest = {
  name: string
  locale: Locale
  surface: Surface
  inputs: ManifestEntry[]
}

const payload = await getPayload({ config })
const results: Array<{ criterion: string; ok: boolean; detail?: string }> = []

async function check(criterion: string, fn: () => Promise<void> | void) {
  try {
    await fn()
    results.push({ criterion, ok: true })
    console.log(`PASS  ${criterion}`)
  } catch (error) {
    const detail = error instanceof Error ? error.stack ?? error.message : String(error)
    results.push({ criterion, ok: false, detail })
    console.error(`FAIL  ${criterion}`)
    console.error(detail)
  }
}

function identityKey(identity: ComponentIdentity): string {
  return [
    identity.entity,
    identity.componentType,
    identity.componentId,
    identity.locale ?? 'null',
  ].join(':')
}

function componentHash(identity: ComponentIdentity, value: unknown): string {
  return canonicalHash('verification', identity.componentType, {
    identity,
    value,
  })
}

function fixtureProjectionV0(doc: Row, locale: Locale): Map<string, ComponentState> {
  // TEST FIXTURE v0 ONLY.
  // This does NOT freeze the future component field-selection/projection contract.
  const map = new Map<string, ComponentState>()
  const guideId = String(doc.id)
  const rows = Array.isArray(doc.sections) ? (doc.sections as Row[]) : []

  const add = (identity: ComponentIdentity, value: unknown, tombstoned = false) => {
    const state: ComponentState = {
      identity,
      hash: componentHash(identity, tombstoned ? { tombstoned: true } : value),
      exists: true,
      tombstoned,
    }
    map.set(identityKey(identity), state)
  }

  add(
    { entity: 'guide', componentType: 'title', componentId: guideId, locale },
    { title: doc.title ?? null },
  )
  add(
    { entity: 'guide', componentType: 'summary', componentId: guideId, locale },
    doc.summary == null ? {} : { summary: doc.summary },
  )
  add(
    { entity: 'guide', componentType: 'applicability', componentId: guideId, locale: null },
    { applicability: doc.applicability },
  )
  add(
    { entity: 'guide', componentType: 'structure', componentId: guideId, locale: null },
    { liveSectionIds: rows.map((row) => String(row.id)) },
  )

  for (const row of rows) {
    add(
      {
        entity: 'guide-section',
        componentType: 'section',
        componentId: String(row.id),
        locale,
      },
      {
        sectionKey: String(row.sectionKey),
        heading: row.heading ?? null,
        body: row.body ?? null,
      },
    )
  }

  return map
}

function getState(
  states: Map<string, ComponentState>,
  identity: ComponentIdentity,
): ComponentState | undefined {
  return states.get(identityKey(identity))
}

function manifest(name: string, locale: Locale, surface: Surface, states: ComponentState[]): ArtifactManifest {
  return {
    name,
    locale,
    surface,
    inputs: states.map((state) => ({ identity: state.identity, hash: state.hash })),
  }
}

function artifactValid(
  artifact: ArtifactManifest,
  current: Map<string, ComponentState>,
): boolean {
  return artifact.inputs.every((input) => {
    const now = current.get(identityKey(input.identity))
    return Boolean(now && now.exists && now.hash === input.hash)
  })
}

function changedKeys(
  before: Map<string, ComponentState>,
  after: Map<string, ComponentState>,
): Set<string> {
  const keys = new Set([...before.keys(), ...after.keys()])
  return new Set(
    [...keys].filter((key) => {
      const a = before.get(key)
      const b = after.get(key)
      if (!a || !b) return true
      return a.hash !== b.hash || a.exists !== b.exists
    }),
  )
}

async function readGuide(id: string, locale: Locale, surface: Surface): Promise<Row> {
  return payload.findByID({
    collection: 'invalidation-guides',
    id,
    locale,
    fallbackLocale: false,
    draft: surface === 'draft',
    overrideAccess: true,
  }) as Promise<Row>
}

async function publishLocale(id: string, locale: Locale) {
  return payload.update({
    collection: 'invalidation-guides',
    id,
    locale,
    fallbackLocale: false,
    publishSpecificLocale: locale,
    draft: false,
    data: { _status: 'published' },
    overrideAccess: true,
  } as any)
}

const suffix = Date.now().toString(36)

let guide = await payload.create({
  collection: 'invalidation-guides',
  locale: 'en',
  fallbackLocale: false,
  draft: true,
  data: {
    title: `Guide ${suffix}`,
    summary: 'English summary',
    applicability: 'all-residents',
    sections: [
      { sectionKey: 'requirements', heading: 'Requirements', body: 'Bring passport.' },
      { sectionKey: 'fees', heading: 'Fees', body: 'Fee is EUR 10.' },
    ],
  },
  overrideAccess: true,
}) as Row

const guideId = String(guide.id)
const sectionIds = (guide.sections as Row[]).map((row) => String(row.id))
assert.equal(sectionIds.length, 2)
assert.notEqual(sectionIds[0], sectionIds[1])

await payload.update({
  collection: 'invalidation-guides',
  id: guideId,
  locale: 'ru',
  fallbackLocale: false,
  draft: true,
  data: {
    title: `Гайд ${suffix}`,
    summary: 'Русское описание',
    sections: [
      { id: sectionIds[0], sectionKey: 'requirements', heading: 'Требования', body: 'Нужен паспорт.' },
      { id: sectionIds[1], sectionKey: 'fees', heading: 'Сборы', body: 'Сбор 10 EUR.' },
    ],
  },
  overrideAccess: true,
} as any)

await publishLocale(guideId, 'en')
await publishLocale(guideId, 'ru')

const baselineEnPublishedDoc = await readGuide(guideId, 'en', 'published')
const baselineRuPublishedDoc = await readGuide(guideId, 'ru', 'published')
const baselineEnPublished = fixtureProjectionV0(baselineEnPublishedDoc, 'en')
const baselineRuPublished = fixtureProjectionV0(baselineRuPublishedDoc, 'ru')

const enSectionAId: ComponentIdentity = {
  entity: 'guide-section',
  componentType: 'section',
  componentId: sectionIds[0],
  locale: 'en',
}
const enSectionBId: ComponentIdentity = {
  entity: 'guide-section',
  componentType: 'section',
  componentId: sectionIds[1],
  locale: 'en',
}
const ruSectionAId: ComponentIdentity = { ...enSectionAId, locale: 'ru' }
const ruSectionBId: ComponentIdentity = { ...enSectionBId, locale: 'ru' }
const enTitleId: ComponentIdentity = { entity: 'guide', componentType: 'title', componentId: guideId, locale: 'en' }
const ruTitleId: ComponentIdentity = { ...enTitleId, locale: 'ru' }
const sharedApplicabilityId: ComponentIdentity = {
  entity: 'guide',
  componentType: 'applicability',
  componentId: guideId,
  locale: null,
}
const structureId: ComponentIdentity = {
  entity: 'guide',
  componentType: 'structure',
  componentId: guideId,
  locale: null,
}

await check('fixture-v0 produces locale-specific and shared component identities', () => {
  assert.ok(getState(baselineEnPublished, enTitleId))
  assert.ok(getState(baselineRuPublished, ruTitleId))
  assert.ok(getState(baselineEnPublished, sharedApplicabilityId))
  assert.ok(getState(baselineEnPublished, structureId))
})

await check('unchanged Payload save does not change component hashes', async () => {
  const before = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')

  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      title: (await readGuide(guideId, 'en', 'draft')).title,
    },
    overrideAccess: true,
  } as any)

  const after = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  assert.deepEqual([...changedKeys(before, after)], [])
})

await check('RU localized change invalidates only matching RU component', async () => {
  const beforeEn = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const beforeRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')

  const ruDraft = await readGuide(guideId, 'ru', 'draft')
  const rows = ruDraft.sections as Row[]
  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: rows.map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: String(row.id) === sectionIds[0] ? 'Нужен паспорт и фотография.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  const afterEn = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const afterRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')

  assert.deepEqual([...changedKeys(beforeEn, afterEn)], [])
  assert.deepEqual([...changedKeys(beforeRu, afterRu)], [identityKey(ruSectionAId)])
  assert.equal(getState(beforeRu, ruSectionBId)?.hash, getState(afterRu, ruSectionBId)?.hash)
})

await check('RU read uses no EN fallback: absent RU summary stays absent when EN changes', async () => {
  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { summary: null },
    overrideAccess: true,
  } as any)

  const beforeRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')
  const ruSummaryId: ComponentIdentity = { entity: 'guide', componentType: 'summary', componentId: guideId, locale: 'ru' }
  const beforeHash = getState(beforeRu, ruSummaryId)?.hash

  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { summary: 'Changed English summary only' },
    overrideAccess: true,
  } as any)

  const afterRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')
  assert.equal(getState(afterRu, ruSummaryId)?.hash, beforeHash)
})

await check('shared non-localized field change invalidates EN and RU consumers', async () => {
  const beforeEn = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const beforeRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')
  const oldEn = getState(beforeEn, sharedApplicabilityId)!
  const oldRu = getState(beforeRu, sharedApplicabilityId)!
  assert.equal(oldEn.hash, oldRu.hash)

  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'eu-residents' },
    overrideAccess: true,
  } as any)

  const afterEn = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const afterRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'draft'), 'ru')
  assert.notEqual(getState(afterEn, sharedApplicabilityId)?.hash, oldEn.hash)
  assert.notEqual(getState(afterRu, sharedApplicabilityId)?.hash, oldRu.hash)
  assert.equal(
    getState(afterEn, sharedApplicabilityId)?.hash,
    getState(afterRu, sharedApplicabilityId)?.hash,
  )
})

await check('section change invalidates every manifest containing it and no sibling-only manifest', () => {
  const sectionA = getState(baselineEnPublished, enSectionAId)!
  const sectionB = getState(baselineEnPublished, enSectionBId)!
  const artifactA = manifest('artifact-a', 'en', 'published', [sectionA])
  const artifactAB = manifest('artifact-ab', 'en', 'published', [sectionA, sectionB])
  const artifactB = manifest('artifact-b', 'en', 'published', [sectionB])

  const changed = new Map(baselineEnPublished)
  changed.set(identityKey(enSectionAId), {
    ...sectionA,
    hash: componentHash(enSectionAId, { sectionKey: 'requirements', heading: 'Requirements', body: 'Changed.' }),
  })

  assert.equal(artifactValid(artifactA, changed), false)
  assert.equal(artifactValid(artifactAB, changed), false)
  assert.equal(artifactValid(artifactB, changed), true)
})

await check('change then revert makes artifact valid again (validity is a predicate)', () => {
  const sectionA = getState(baselineEnPublished, enSectionAId)!
  const artifact = manifest('revert-artifact', 'en', 'published', [sectionA])

  const changed = new Map(baselineEnPublished)
  changed.set(identityKey(enSectionAId), {
    ...sectionA,
    hash: componentHash(enSectionAId, { changed: true }),
  })
  assert.equal(artifactValid(artifact, changed), false)

  const reverted = new Map(changed)
  reverted.set(identityKey(enSectionAId), sectionA)
  assert.equal(artifactValid(artifact, reverted), true)
})

await check('draft changes do not invalidate published-facing artifact before publication', async () => {
  const publishedBefore = fixtureProjectionV0(await readGuide(guideId, 'en', 'published'), 'en')
  const publishedSectionA = getState(publishedBefore, enSectionAId)!
  const artifact = manifest('published-artifact', 'en', 'published', [publishedSectionA])

  const enDraft = await readGuide(guideId, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (enDraft.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: String(row.id) === sectionIds[0] ? 'Draft-only changed body.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  const publishedAfter = fixtureProjectionV0(await readGuide(guideId, 'en', 'published'), 'en')
  assert.equal(artifactValid(artifact, publishedAfter), true)
})

await check('publishing EN draft does not change RU published component hashes', async () => {
  const beforeRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'published'), 'ru')
  await publishLocale(guideId, 'en')
  const afterRu = fixtureProjectionV0(await readGuide(guideId, 'ru', 'published'), 'ru')
  assert.deepEqual([...changedKeys(beforeRu, afterRu)], [])
})

await check('verified draft published unchanged remains verified; edit-after-verification does not', async () => {
  const draftBefore = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const verifiedHash = getState(draftBefore, enSectionAId)!.hash

  await publishLocale(guideId, 'en')
  const publishedSame = fixtureProjectionV0(await readGuide(guideId, 'en', 'published'), 'en')
  assert.equal(getState(publishedSame, enSectionAId)?.hash, verifiedHash)

  const enDraft = await readGuide(guideId, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (enDraft.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: String(row.id) === sectionIds[0] ? 'Edited after verification.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  await publishLocale(guideId, 'en')

  const publishedChanged = fixtureProjectionV0(await readGuide(guideId, 'en', 'published'), 'en')
  assert.notEqual(getState(publishedChanged, enSectionAId)?.hash, verifiedHash)
})

await check('reorder changes only structural component, not section hashes', async () => {
  const before = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const enDraft = await readGuide(guideId, 'en', 'draft')
  const rows = enDraft.sections as Row[]

  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: [...rows].reverse().map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  const after = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const changed = changedKeys(before, after)
  assert.deepEqual([...changed], [identityKey(structureId)])
  assert.equal(getState(before, enSectionAId)?.hash, getState(after, enSectionAId)?.hash)
  assert.equal(getState(before, enSectionBId)?.hash, getState(after, enSectionBId)?.hash)
})

await check('add section invalidates all-sections artifact via structure but not section-B-only artifact', async () => {
  const before = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  const structural = getState(before, structureId)!
  const sectionB = getState(before, enSectionBId)!
  const allSectionsArtifact = manifest('all-sections', 'en', 'draft', [structural, sectionB])
  const sectionBArtifact = manifest('section-b-only', 'en', 'draft', [sectionB])

  const enDraft = await readGuide(guideId, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: guideId,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: [
        ...(enDraft.sections as Row[]).map((row) => ({
          id: row.id,
          sectionKey: row.sectionKey,
          heading: row.heading,
          body: row.body,
        })),
        { sectionKey: 'new-section', heading: 'New section', body: 'New body.' },
      ],
    },
    overrideAccess: true,
  } as any)

  const after = fixtureProjectionV0(await readGuide(guideId, 'en', 'draft'), 'en')
  assert.equal(artifactValid(allSectionsArtifact, after), false)
  assert.equal(artifactValid(sectionBArtifact, after), true)
})

await check('missing/tombstoned component fails closed and removed ID is not silently rebound', () => {
  const sectionA = getState(baselineEnPublished, enSectionAId)!
  const artifact = manifest('old-section-artifact', 'en', 'published', [sectionA])

  const missing = new Map(baselineEnPublished)
  missing.delete(identityKey(enSectionAId))
  assert.equal(artifactValid(artifact, missing), false)

  const tombstoned = new Map(baselineEnPublished)
  tombstoned.set(identityKey(enSectionAId), {
    ...sectionA,
    tombstoned: true,
    hash: componentHash(enSectionAId, { tombstoned: true }),
  })
  assert.equal(artifactValid(artifact, tombstoned), false)

  const replacementIdentity: ComponentIdentity = {
    ...enSectionAId,
    componentId: 'replacement-new-id',
  }
  const replacement = new Map(missing)
  replacement.set(identityKey(replacementIdentity), {
    identity: replacementIdentity,
    exists: true,
    hash: componentHash(replacementIdentity, {
      sectionKey: 'requirements',
      heading: 'Requirements',
      body: 'Bring passport.',
    }),
  })
  assert.equal(artifactValid(artifact, replacement), false)
})

await check('manifest captures hashes actually read; later write race leaves artifact stale', () => {
  const before = getState(baselineEnPublished, enSectionAId)!
  const artifact = manifest('race-artifact', 'en', 'published', [before])

  const afterConcurrentWrite = new Map(baselineEnPublished)
  afterConcurrentWrite.set(identityKey(enSectionAId), {
    ...before,
    hash: componentHash(enSectionAId, { concurrent: 'new value' }),
  })

  assert.equal(artifact.inputs[0].hash, before.hash)
  assert.equal(artifactValid(artifact, afterConcurrentWrite), false)
})

console.log('\n--- Local invalidation schema-pass summary ---')
console.log('projection: fixture-v0 (TEST ONLY; field-selection remains OPEN)')
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.criterion}`)
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

await payload.destroy()

if (failed.length > 0) process.exitCode = 1
