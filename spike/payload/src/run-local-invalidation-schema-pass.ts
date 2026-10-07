import assert from 'node:assert/strict'
import { getPayload } from 'payload'
import config from './local-invalidation-config.js'
import { canonicalHash } from './canonical-serialization.js'

type Locale = 'en' | 'ru'
type Surface = 'draft' | 'published'
type Row = Record<string, any>

type ComponentIdentity = {
  entity: 'guide' | 'guide-section'
  componentType: 'title' | 'summary' | 'applicability' | 'structure' | 'visible-structure' | 'section'
  componentId: string
  locale: Locale | null
}

type ComponentState = {
  identity: ComponentIdentity
  hash: string
  exists: boolean
  tombstoned?: boolean
}

type ArtifactManifest = {
  name: string
  locale: Locale
  surface: Surface
  inputs: Array<{ identity: ComponentIdentity; hash: string }>
}

type Fixture = {
  id: string
  sectionIds: [string, string]
}

type Snapshot = Map<string, ComponentState>

const PAYLOAD_VERSION = '3.90.2'
const payload = await getPayload({ config })
const results: Array<{ criterion: string; ok: boolean; detail?: string }> = []
let fixtureCounter = 0

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

function viewKey(surface: Surface, locale: Locale, identity: ComponentIdentity): string {
  return `${surface}:${locale}|${identityKey(identity)}`
}

function componentHash(identity: ComponentIdentity, value: unknown): string {
  return canonicalHash('verification', identity.componentType, { identity, value })
}

function stripInvisibleUnicode(value: string): string {
  return value.normalize('NFC').replace(/[\p{Z}\p{Cc}\p{Cf}]/gu, '')
}

function hasMeaningfulText(value: unknown): boolean {
  if (typeof value === 'string') return stripInvisibleUnicode(value).length > 0
  if (value == null) return false
  if (Array.isArray(value)) return value.some(hasMeaningfulText)
  if (typeof value === 'object') {
    const object = value as Record<string, unknown>
    if (typeof object.text === 'string' && hasMeaningfulText(object.text)) return true
    for (const key of ['children', 'content']) {
      if (Array.isArray(object[key]) && (object[key] as unknown[]).some(hasMeaningfulText)) return true
    }
  }
  return false
}

function sectionVisibleV0(row: Row): boolean {
  return hasMeaningfulText(row.heading) && hasMeaningfulText(row.body)
}

function visibleIdsV0(doc: Row): string[] {
  const rows = Array.isArray(doc.sections) ? (doc.sections as Row[]) : []
  return rows.filter(sectionVisibleV0).map((row) => String(row.id))
}

function fixtureProjectionV0(doc: Row, locale: Locale): Map<string, ComponentState> {
  // TEST FIXTURE v0 ONLY.
  // This does NOT freeze production field-selection, partial-section policy,
  // or rich-text semantic projection.
  const map = new Map<string, ComponentState>()
  const guideId = String(doc.id)
  const rows = Array.isArray(doc.sections) ? (doc.sections as Row[]) : []

  const add = (identity: ComponentIdentity, value: unknown, tombstoned = false) => {
    map.set(identityKey(identity), {
      identity,
      hash: componentHash(identity, tombstoned ? { tombstoned: true } : value),
      exists: true,
      tombstoned,
    })
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
  add(
    { entity: 'guide', componentType: 'visible-structure', componentId: guideId, locale },
    { visibleSectionIds: visibleIdsV0(doc) },
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

function getState(states: Map<string, ComponentState>, identity: ComponentIdentity): ComponentState | undefined {
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

function artifactValid(artifact: ArtifactManifest, current: Map<string, ComponentState>): boolean {
  return artifact.inputs.every((input) => {
    const now = current.get(identityKey(input.identity))
    return Boolean(now && now.exists && now.hash === input.hash)
  })
}

function changedKeys(before: Map<string, ComponentState>, after: Map<string, ComponentState>): Set<string> {
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

function assertExactChanged(actual: Set<string>, expected: Iterable<string>) {
  assert.deepEqual([...actual].sort(), [...expected].sort())
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

async function readGuideAllLocales(id: string, surface: Surface): Promise<Row> {
  return payload.findByID({
    collection: 'invalidation-guides',
    id,
    locale: 'all',
    fallbackLocale: false,
    draft: surface === 'draft',
    overrideAccess: true,
  } as any) as Promise<Row>
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

async function unpublishLocale(id: string, locale: Locale) {
  return payload.update({
    collection: 'invalidation-guides',
    id,
    locale,
    fallbackLocale: false,
    publishSpecificLocale: locale,
    draft: false,
    data: { _status: 'draft' },
    overrideAccess: true,
  } as any)
}

async function snapshotAll(id: string): Promise<Snapshot> {
  const snapshot: Snapshot = new Map()
  for (const surface of ['draft', 'published'] as const) {
    for (const locale of ['en', 'ru'] as const) {
      const doc = await readGuide(id, locale, surface)
      for (const state of fixtureProjectionV0(doc, locale).values()) {
        snapshot.set(viewKey(surface, locale, state.identity), state)
      }
    }
  }
  return snapshot
}

function snapshotDiff(before: Snapshot, after: Snapshot): Set<string> {
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

function ids(id: string, sectionIds: [string, string]) {
  const [a, b] = sectionIds
  return {
    applicability: { entity: 'guide', componentType: 'applicability', componentId: id, locale: null } as ComponentIdentity,
    structure: { entity: 'guide', componentType: 'structure', componentId: id, locale: null } as ComponentIdentity,
    visibleEn: { entity: 'guide', componentType: 'visible-structure', componentId: id, locale: 'en' } as ComponentIdentity,
    visibleRu: { entity: 'guide', componentType: 'visible-structure', componentId: id, locale: 'ru' } as ComponentIdentity,
    titleEn: { entity: 'guide', componentType: 'title', componentId: id, locale: 'en' } as ComponentIdentity,
    titleRu: { entity: 'guide', componentType: 'title', componentId: id, locale: 'ru' } as ComponentIdentity,
    sectionAEn: { entity: 'guide-section', componentType: 'section', componentId: a, locale: 'en' } as ComponentIdentity,
    sectionARu: { entity: 'guide-section', componentType: 'section', componentId: a, locale: 'ru' } as ComponentIdentity,
    sectionBEn: { entity: 'guide-section', componentType: 'section', componentId: b, locale: 'en' } as ComponentIdentity,
    sectionBRu: { entity: 'guide-section', componentType: 'section', componentId: b, locale: 'ru' } as ComponentIdentity,
  }
}

async function createFreshGuide(label: string): Promise<Fixture> {
  fixtureCounter += 1
  const suffix = `${Date.now().toString(36)}-${fixtureCounter}-${label}`
  const guide = await payload.create({
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

  const sectionIds = (guide.sections as Row[]).map((row) => String(row.id)) as [string, string]

  await payload.update({
    collection: 'invalidation-guides',
    id: guide.id,
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

  await publishLocale(String(guide.id), 'en')
  await publishLocale(String(guide.id), 'ru')

  const fixture = { id: String(guide.id), sectionIds }
  await assertCleanBaseline(fixture)
  return fixture
}

async function assertCleanBaseline(fixture: Fixture) {
  const i = ids(fixture.id, fixture.sectionIds)
  for (const locale of ['en', 'ru'] as const) {
    const draft = fixtureProjectionV0(await readGuide(fixture.id, locale, 'draft'), locale)
    const published = fixtureProjectionV0(await readGuide(fixture.id, locale, 'published'), locale)
    assert.equal(getState(draft, i.applicability)?.hash, getState(published, i.applicability)?.hash)
    assert.equal(getState(draft, i.structure)?.hash, getState(published, i.structure)?.hash)
    const visible = locale === 'en' ? i.visibleEn : i.visibleRu
    assert.equal(getState(draft, visible)?.hash, getState(published, visible)?.hash)
  }
}

function expectedVisibleAfterPermutation(beforeVisible: string[], permutation: string[]): string[] {
  const visible = new Set(beforeVisible)
  return permutation.filter((id) => visible.has(id))
}

await check('fixture-v0 visibility predicate handles Unicode-empty and editor-empty forms', () => {
  const emptyEditor = { type: 'root', children: [{ type: 'paragraph', children: [{ text: '' }] }] }
  const vectors: Array<[unknown, boolean]> = [
    [null, false],
    ['', false],
    ['   ', false],
    ['\u00a0', false],
    ['\u200b', false],
    ['\ufeff', false],
    ['\u00ad', false],
    [emptyEditor, false],
    [{ type: 'root', children: [{ type: 'paragraph', children: [{ text: '  hello  ' }] }] }, true],
    ['текст', true],
  ]
  for (const [value, expected] of vectors) assert.equal(hasMeaningfulText(value), expected)
})

await check('unchanged Payload save does not change any component hashes', async () => {
  const f = await createFreshGuide('unchanged-save')
  const before = await snapshotAll(f.id)
  const enDraft = await readGuide(f.id, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { title: enDraft.title },
    overrideAccess: true,
  } as any)
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [])
})

await check('localized RU section change invalidates only matching RU draft component', async () => {
  const f = await createFreshGuide('ru-local-change')
  const i = ids(f.id, f.sectionIds)
  const before = await snapshotAll(f.id)
  const ru = await readGuide(f.id, 'ru', 'draft')

  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: String(row.id) === f.sectionIds[0] ? 'Нужен паспорт и фотография.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'ru', i.sectionARu),
  ])
})

await check('RU fallback=false remains independent when EN localized content changes', async () => {
  const f = await createFreshGuide('fallback')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { summary: null },
    overrideAccess: true,
  } as any)
  const before = await readGuide(f.id, 'ru', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { summary: 'Changed English summary only' },
    overrideAccess: true,
  } as any)
  const after = await readGuide(f.id, 'ru', 'draft')
  assert.equal(after.summary, before.summary)
})

await check('observed: EN shared draft write changes only EN draft projection', async () => {
  const f = await createFreshGuide('shared-draft-en')
  const i = ids(f.id, f.sectionIds)
  const before = await snapshotAll(f.id)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'eu-residents' },
    overrideAccess: true,
  } as any)
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'en', i.applicability),
  ])
})

await check('observed: RU shared draft write changes only RU draft projection', async () => {
  const f = await createFreshGuide('shared-draft-ru')
  const i = ids(f.id, f.sectionIds)
  const before = await snapshotAll(f.id)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'ru-only-pending' },
    overrideAccess: true,
  } as any)
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'ru', i.applicability),
  ])
})

await check('observed: publish EN advances shared published state and synchronizes RU shared draft', async () => {
  const f = await createFreshGuide('publish-en-shared')
  const i = ids(f.id, f.sectionIds)

  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'eu-residents' },
    overrideAccess: true,
  } as any)

  const before = await snapshotAll(f.id)
  await publishLocale(f.id, 'en')
  const after = await snapshotAll(f.id)

  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'ru', i.applicability),
    viewKey('published', 'en', i.applicability),
    viewKey('published', 'ru', i.applicability),
  ])

  const enPublished = await readGuide(f.id, 'en', 'published')
  const ruPublished = await readGuide(f.id, 'ru', 'published')
  assert.equal(enPublished.applicability, 'eu-residents')
  assert.equal(ruPublished.applicability, 'eu-residents')
})

await check('observed: pending RU shared change is advanced by EN publish', async () => {
  const f = await createFreshGuide('pending-ru-publish-en')
  const i = ids(f.id, f.sectionIds)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'ru-authored-shared-change' },
    overrideAccess: true,
  } as any)
  const before = await snapshotAll(f.id)
  await publishLocale(f.id, 'en')
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'en', i.applicability),
    viewKey('published', 'en', i.applicability),
    viewKey('published', 'ru', i.applicability),
  ])
})

await check('observed: pending EN shared change is advanced by RU publish', async () => {
  const f = await createFreshGuide('pending-en-publish-ru')
  const i = ids(f.id, f.sectionIds)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'en-authored-shared-change' },
    overrideAccess: true,
  } as any)
  const before = await snapshotAll(f.id)
  await publishLocale(f.id, 'ru')
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'ru', i.applicability),
    viewKey('published', 'en', i.applicability),
    viewKey('published', 'ru', i.applicability),
  ])
})

await check('EN publication does not destroy unpublished RU localized draft', async () => {
  const f = await createFreshGuide('ru-local-draft-survives-en-publish')
  const i = ids(f.id, f.sectionIds)
  const ru = await readGuide(f.id, 'ru', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: String(row.id) === f.sectionIds[0] ? 'Незаконченная RU правка' : row.heading,
        body: row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  const before = await snapshotAll(f.id)
  const beforeRuDraft = fixtureProjectionV0(await readGuide(f.id, 'ru', 'draft'), 'ru')
  const beforeRuPublished = fixtureProjectionV0(await readGuide(f.id, 'ru', 'published'), 'ru')
  const ruDraftHash = getState(beforeRuDraft, i.sectionARu)!.hash
  const ruPublishedHash = getState(beforeRuPublished, i.sectionARu)!.hash

  await publishLocale(f.id, 'en')

  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [])
  const afterRuDraft = fixtureProjectionV0(await readGuide(f.id, 'ru', 'draft'), 'ru')
  const afterRuPublished = fixtureProjectionV0(await readGuide(f.id, 'ru', 'published'), 'ru')
  assert.equal(getState(afterRuDraft, i.sectionARu)?.hash, ruDraftHash)
  assert.equal(getState(afterRuPublished, i.sectionARu)?.hash, ruPublishedHash)
})

async function sharedState(id: string) {
  const read = async (locale: Locale, surface: Surface) => {
    const doc = await readGuide(id, locale, surface)
    const projection = fixtureProjectionV0(doc, locale)
    const identity = { entity: 'guide', componentType: 'applicability', componentId: id, locale: null } as ComponentIdentity
    return { value: doc.applicability, hash: getState(projection, identity)!.hash }
  }
  return {
    draftEn: await read('en', 'draft'),
    draftRu: await read('ru', 'draft'),
    publishedEn: await read('en', 'published'),
    publishedRu: await read('ru', 'published'),
  }
}

async function runConflictingSharedDraftProbe(firstPublish: Locale) {
  const f = await createFreshGuide(`conflict-${firstPublish}-first`)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'shared-A-from-en' },
    overrideAccess: true,
  } as any)
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: { applicability: 'shared-B-from-ru' },
    overrideAccess: true,
  } as any)

  const beforePublish = await sharedState(f.id)
  console.log(`CHAR  conflict ${firstPublish}-first before publish:`, JSON.stringify(beforePublish))

  await publishLocale(f.id, firstPublish)
  const afterFirst = await sharedState(f.id)
  console.log(`CHAR  conflict ${firstPublish}-first after first publish:`, JSON.stringify(afterFirst))

  const secondPublish: Locale = firstPublish === 'en' ? 'ru' : 'en'
  await publishLocale(f.id, secondPublish)
  const afterSecond = await sharedState(f.id)
  console.log(`CHAR  conflict ${firstPublish}-first after second publish:`, JSON.stringify(afterSecond))

  // Characterization probe only until a committed-tree run establishes exact observed states.
  assert.equal(afterFirst.publishedEn.value, afterFirst.publishedRu.value)
  assert.equal(afterSecond.publishedEn.value, afterSecond.publishedRu.value)
}

await check('observed: conflicting shared drafts, EN publish first', async () => {
  await runConflictingSharedDraftProbe('en')
})

await check('observed: conflicting shared drafts, RU publish first', async () => {
  await runConflictingSharedDraftProbe('ru')
})

await check('re-publishing without changes changes nothing', async () => {
  const f = await createFreshGuide('republish')
  const before = await snapshotAll(f.id)
  await publishLocale(f.id, 'en')
  const middle = await snapshotAll(f.id)
  await publishLocale(f.id, 'ru')
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, middle), [])
  assertExactChanged(snapshotDiff(middle, after), [])
})

async function runReorderCase(label: string) {
  const f = await createFreshGuide(label)
  const i = ids(f.id, f.sectionIds)
  const before = await snapshotAll(f.id)
  const beforeEn = await readGuide(f.id, 'en', 'draft')
  const beforeRu = await readGuide(f.id, 'ru', 'draft')
  const permutation = [f.sectionIds[1], f.sectionIds[0]]
  assert.notDeepEqual(permutation, f.sectionIds)

  const rows = beforeEn.sections as Row[]
  const byId = new Map(rows.map((row) => [String(row.id), row]))
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: permutation.map((id) => {
        const row = byId.get(id)!
        return { id: row.id, sectionKey: row.sectionKey, heading: row.heading, body: row.body }
      }),
    },
    overrideAccess: true,
  } as any)

  const after = await snapshotAll(f.id)
  const expected = [
    viewKey('draft', 'en', i.structure),
  ]

  const expectedEnVisible = expectedVisibleAfterPermutation(visibleIdsV0(beforeEn), permutation)
  const expectedRuVisible = expectedVisibleAfterPermutation(visibleIdsV0(beforeRu), permutation)
  if (!assert.deepEqual) throw new Error('unreachable')
  if (JSON.stringify(expectedEnVisible) !== JSON.stringify(visibleIdsV0(beforeEn))) {
    expected.push(viewKey('draft', 'en', i.visibleEn))
  }
  // EN draft reorder must not alter RU draft projections before publication.

  assertExactChanged(snapshotDiff(before, after), expected)
  assert.deepEqual(visibleIdsV0(await readGuide(f.id, 'en', 'draft')), expectedEnVisible)
  assert.deepEqual(visibleIdsV0(await readGuide(f.id, 'ru', 'draft')), expectedRuVisible)

  const beforeEnProjection = fixtureProjectionV0(beforeEn, 'en')
  const afterEnProjection = fixtureProjectionV0(await readGuide(f.id, 'en', 'draft'), 'en')
  assert.equal(getState(beforeEnProjection, i.sectionAEn)?.hash, getState(afterEnProjection, i.sectionAEn)?.hash)
  assert.equal(getState(beforeEnProjection, i.sectionBEn)?.hash, getState(afterEnProjection, i.sectionBEn)?.hash)
}

await check('non-identity reorder changes exactly shared + affected locale-visible structure', async () => {
  await runReorderCase('reorder')
})

await check('identity reorder is a no-op', async () => {
  const f = await createFreshGuide('identity-reorder')
  const before = await snapshotAll(f.id)
  const en = await readGuide(f.id, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (en.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [])
})

await check('moving EN-visible/RU-invisible section can leave RU visible order unchanged', async () => {
  const f = await createFreshGuide('invisible-reorder')
  const i = ids(f.id, f.sectionIds)

  const ru = await readGuide(f.id, 'ru', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ru.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: String(row.id) === f.sectionIds[1] ? '\u200B' : row.heading,
        body: String(row.id) === f.sectionIds[1] ? '\u200B' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  await publishLocale(f.id, 'ru')
  await assertCleanBaseline(f)

  const before = await snapshotAll(f.id)
  const beforeRu = await readGuide(f.id, 'ru', 'draft')
  const beforeRuIds = visibleIdsV0(beforeRu)
  const en = await readGuide(f.id, 'en', 'draft')
  const rows = en.sections as Row[]
  const reversed = [...rows].reverse()

  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: reversed.map((row) => ({
      id: row.id,
      sectionKey: row.sectionKey,
      heading: row.heading,
      body: row.body,
    })),
    overrideAccess: true,
  } as any)

  const after = await snapshotAll(f.id)
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'en', i.structure),
    viewKey('draft', 'en', i.visibleEn),
  ])
  assert.deepEqual(visibleIdsV0(await readGuide(f.id, 'ru', 'draft')), beforeRuIds)
})

await check('EN-only section: shared changes, RU visible stays stable; RU row representation is characterized', async () => {
  const f = await createFreshGuide('en-only')
  const i = ids(f.id, f.sectionIds)
  const beforeRuPublished = fixtureProjectionV0(await readGuide(f.id, 'ru', 'published'), 'ru')
  const sharedArtifact = manifest('ru-shared', 'ru', 'published', [getState(beforeRuPublished, i.structure)!])
  const visibleArtifact = manifest('ru-visible', 'ru', 'published', [getState(beforeRuPublished, i.visibleRu)!])

  const beforeRuVisibleIds = visibleIdsV0(await readGuide(f.id, 'ru', 'published'))
  const enDraft = await readGuide(f.id, 'en', 'draft')
  const beforeExistingEn = fixtureProjectionV0(enDraft, 'en')
  const beforeExistingRu = fixtureProjectionV0(await readGuide(f.id, 'ru', 'draft'), 'ru')

  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
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
        { sectionKey: 'en-only', heading: 'English only', body: 'Visible only in EN for now.' },
      ],
    },
    overrideAccess: true,
  } as any)

  const ruDraftBeforePublish = await readGuide(f.id, 'ru', 'draft')
  const newRowDraft = (ruDraftBeforePublish.sections as Row[]).find((row) => String(row.sectionKey) === 'en-only')
  assert.equal(newRowDraft, undefined)

  await publishLocale(f.id, 'en')

  const enPublished = await readGuide(f.id, 'en', 'published')
  const ruPublished = await readGuide(f.id, 'ru', 'published')
  const ruAll = await readGuideAllLocales(f.id, 'published')
  const newRowRu = (ruPublished.sections as Row[]).find((row) => String(row.sectionKey) === 'en-only')
  const newRowAll = (ruAll.sections as Row[]).find((row) => String(row.sectionKey) === 'en-only')

  assert.ok(newRowRu)
  assert.equal(sectionVisibleV0(newRowRu!), false)
  assert.equal(newRowRu!.heading == null || newRowRu!.heading === '', true)
  assert.equal(newRowRu!.body == null || newRowRu!.body === '', true)
  assert.ok(newRowAll)

  console.log('CHAR  RU EN-only row published:', JSON.stringify({
    heading: newRowRu!.heading ?? null,
    body: newRowRu!.body ?? null,
  }))
  console.log('CHAR  EN-only row locale=all:', JSON.stringify({
    heading: newRowAll!.heading ?? null,
    body: newRowAll!.body ?? null,
  }))

  assert.notDeepEqual(visibleIdsV0(enPublished), f.sectionIds)
  assert.deepEqual(visibleIdsV0(ruPublished), beforeRuVisibleIds)

  const afterRuProjection = fixtureProjectionV0(ruPublished, 'ru')
  assert.equal(artifactValid(sharedArtifact, afterRuProjection), false)
  assert.equal(artifactValid(visibleArtifact, afterRuProjection), true)

  const afterExistingEn = fixtureProjectionV0(enPublished, 'en')
  const afterExistingRu = fixtureProjectionV0(ruPublished, 'ru')
  assert.equal(getState(beforeExistingEn, i.sectionAEn)?.hash, getState(afterExistingEn, i.sectionAEn)?.hash)
  assert.equal(getState(beforeExistingEn, i.sectionBEn)?.hash, getState(afterExistingEn, i.sectionBEn)?.hash)
  assert.equal(getState(beforeExistingRu, i.sectionARu)?.hash, getState(afterExistingRu, i.sectionARu)?.hash)
  assert.equal(getState(beforeExistingRu, i.sectionBRu)?.hash, getState(afterExistingRu, i.sectionBRu)?.hash)

  const newId = String((enPublished.sections as Row[]).find((row) => String(row.sectionKey) === 'en-only')!.id)
  const sharedBeforeRuPublish = getState(afterRuProjection, i.structure)!.hash
  const enVisibleBeforeRuPublish = getState(afterExistingEn, i.visibleEn)!.hash

  const ruDraft = await readGuide(f.id, 'ru', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'ru',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (ruDraft.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: String(row.id) === newId ? 'Только RU-перевод' : row.heading,
        body: String(row.id) === newId ? 'Теперь раздел видим и по-русски.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)

  assert.equal(visibleIdsV0(await readGuide(f.id, 'ru', 'published')).includes(newId), false)
  assert.equal(visibleIdsV0(await readGuide(f.id, 'ru', 'draft')).includes(newId), true)

  await publishLocale(f.id, 'ru')
  const afterRuPublish = fixtureProjectionV0(await readGuide(f.id, 'ru', 'published'), 'ru')
  const afterEnRuPublish = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  assert.equal(getState(afterRuPublish, i.structure)?.hash, sharedBeforeRuPublish)
  assert.notEqual(getState(afterRuPublish, i.visibleRu)?.hash, getState(afterRuProjection, i.visibleRu)?.hash)
  assert.equal(getState(afterEnRuPublish, i.visibleEn)?.hash, enVisibleBeforeRuPublish)
})

await check('delete/tombstone semantics invalidate only EN draft before publication and never rebind old ID', async () => {
  const f = await createFreshGuide('delete')
  const i = ids(f.id, f.sectionIds)
  const before = await snapshotAll(f.id)
  const beforeEn = fixtureProjectionV0(await readGuide(f.id, 'en', 'draft'), 'en')
  const beforeRu = fixtureProjectionV0(await readGuide(f.id, 'ru', 'draft'), 'ru')
  const oldSection = getState(beforeEn, i.sectionAEn)!
  const oldArtifact = manifest('old-id', 'en', 'draft', [oldSection])

  const en = await readGuide(f.id, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (en.sections as Row[])
        .filter((row) => String(row.id) !== f.sectionIds[0])
        .map((row) => ({ id: row.id, sectionKey: row.sectionKey, heading: row.heading, body: row.body })),
    },
    overrideAccess: true,
  } as any)

  const after = await snapshotAll(f.id)
  const afterEn = fixtureProjectionV0(await readGuide(f.id, 'en', 'draft'), 'en')
  const afterRu = fixtureProjectionV0(await readGuide(f.id, 'ru', 'draft'), 'ru')
  assertExactChanged(snapshotDiff(before, after), [
    viewKey('draft', 'en', i.structure),
    viewKey('draft', 'en', i.visibleEn),
    viewKey('draft', 'en', i.sectionAEn),
  ])
  assert.equal(getState(beforeRu, i.structure)?.hash, getState(afterRu, i.structure)?.hash)
  assert.equal(getState(beforeRu, i.visibleRu)?.hash, getState(afterRu, i.visibleRu)?.hash)
  assert.equal(artifactValid(oldArtifact, afterEn), false)

  const tombstoned = new Map(afterEn)
  tombstoned.set(identityKey(i.sectionAEn), {
    identity: i.sectionAEn,
    exists: true,
    tombstoned: true,
    hash: componentHash(i.sectionAEn, { tombstoned: true }),
  })
  assert.equal(artifactValid(oldArtifact, tombstoned), false)

  const current = await readGuide(f.id, 'en', 'draft')
  const recreated = await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: [
        ...(current.sections as Row[]).map((row) => ({
          id: row.id,
          sectionKey: row.sectionKey,
          heading: row.heading,
          body: row.body,
        })),
        { sectionKey: 'requirements', heading: 'Requirements', body: 'Bring passport.' },
      ],
    },
    overrideAccess: true,
  } as any) as Row
  const recreatedRow = (recreated.sections as Row[]).find((row) => String(row.sectionKey) === 'requirements')
  assert.ok(recreatedRow)
  assert.notEqual(String(recreatedRow!.id), f.sectionIds[0])
})

await check('unpublishing locale yields fail-closed absence, not an empty visible structure', async () => {
  const f = await createFreshGuide('unpublish')
  const beforeEn = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  const i = ids(f.id, f.sectionIds)
  const sharedHash = getState(beforeEn, i.applicability)!.hash

  await unpublishLocale(f.id, 'ru')
  const ruPublished = await readGuide(f.id, 'ru', 'published')
  assert.notEqual(ruPublished._status, 'published')
  assert.equal(Array.isArray(ruPublished.sections) && visibleIdsV0(ruPublished).length === 0, false)

  const afterEn = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  assert.equal(getState(afterEn, i.applicability)?.hash, sharedHash)
})

await check('verified draft hash survives unchanged publish; edit-after-verification does not', async () => {
  const f = await createFreshGuide('verification')
  const i = ids(f.id, f.sectionIds)
  const draft = fixtureProjectionV0(await readGuide(f.id, 'en', 'draft'), 'en')
  const verifiedHash = getState(draft, i.sectionAEn)!.hash

  await publishLocale(f.id, 'en')
  const same = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  assert.equal(getState(same, i.sectionAEn)?.hash, verifiedHash)

  const en = await readGuide(f.id, 'en', 'draft')
  await payload.update({
    collection: 'invalidation-guides',
    id: f.id,
    locale: 'en',
    fallbackLocale: false,
    draft: true,
    data: {
      sections: (en.sections as Row[]).map((row) => ({
        id: row.id,
        sectionKey: row.sectionKey,
        heading: row.heading,
        body: String(row.id) === f.sectionIds[0] ? 'Edited after verification.' : row.body,
      })),
    },
    overrideAccess: true,
  } as any)
  await publishLocale(f.id, 'en')
  const changed = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  assert.notEqual(getState(changed, i.sectionAEn)?.hash, verifiedHash)
})

await check('change then revert makes artifact valid again; missing/tombstoned fails closed', async () => {
  const f = await createFreshGuide('predicate')
  const i = ids(f.id, f.sectionIds)
  const baseline = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  const section = getState(baseline, i.sectionAEn)!
  const artifact = manifest('predicate', 'en', 'published', [section])

  const changed = new Map(baseline)
  changed.set(identityKey(i.sectionAEn), { ...section, hash: componentHash(i.sectionAEn, { changed: true }) })
  assert.equal(artifactValid(artifact, changed), false)

  const reverted = new Map(changed)
  reverted.set(identityKey(i.sectionAEn), section)
  assert.equal(artifactValid(artifact, reverted), true)

  const missing = new Map(baseline)
  missing.delete(identityKey(i.sectionAEn))
  assert.equal(artifactValid(artifact, missing), false)

  const tombstoned = new Map(baseline)
  tombstoned.set(identityKey(i.sectionAEn), {
    ...section,
    tombstoned: true,
    hash: componentHash(i.sectionAEn, { tombstoned: true }),
  })
  assert.equal(artifactValid(artifact, tombstoned), false)
})

await check('manifest captures hashes actually read; later concurrent write makes artifact stale', async () => {
  const f = await createFreshGuide('race')
  const i = ids(f.id, f.sectionIds)
  const baseline = fixtureProjectionV0(await readGuide(f.id, 'en', 'published'), 'en')
  const before = getState(baseline, i.sectionAEn)!
  const artifact = manifest('race', 'en', 'published', [before])

  const current = new Map(baseline)
  current.set(identityKey(i.sectionAEn), {
    ...before,
    hash: componentHash(i.sectionAEn, { concurrent: 'new value' }),
  })

  assert.equal(artifact.inputs[0].hash, before.hash)
  assert.equal(artifactValid(artifact, current), false)
})

await check('structural scenarios are order-independent across fresh fixtures', async () => {
  const forward = ['reorder', 'en-only'] as const
  const reverse = [...forward].reverse()

  for (const name of forward) {
    if (name === 'reorder') await runReorderCase('order-forward-reorder')
    else {
      const f = await createFreshGuide('order-forward-en-only')
      await assertCleanBaseline(f)
    }
  }

  for (const name of reverse) {
    if (name === 'reorder') await runReorderCase('order-reverse-reorder')
    else {
      const f = await createFreshGuide('order-reverse-en-only')
      await assertCleanBaseline(f)
    }
  }
})

console.log('\n--- Local invalidation schema-pass summary ---')
console.log(`payload: ${PAYLOAD_VERSION}`)
console.log(`node: ${process.version}`)
console.log('projection: fixture-v0 (TEST ONLY; field-selection/partial-section/rich-text remain OPEN)')
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.criterion}`)
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

await payload.destroy()

if (failed.length > 0) process.exitCode = 1
