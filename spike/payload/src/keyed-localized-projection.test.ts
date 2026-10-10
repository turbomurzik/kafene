import assert from 'node:assert/strict'
import test from 'node:test'
import {
  projectKeyedLocalizedDocument,
  projectVisibleKeyedSections,
} from './keyed-localized-projection.js'

test('projection joins localized content by sectionKey after reorder', () => {
  const sections = [
    { id: 'row-c', sectionKey: 'c' },
    { id: 'row-a', sectionKey: 'a' },
    { id: 'row-b', sectionKey: 'b' },
  ]
  const content = {
    a: { heading: 'A', body: 'Body A' },
    b: { heading: null, body: null },
    c: { heading: 'C', body: 'Body C' },
  }

  assert.deepEqual(projectVisibleKeyedSections(sections, content), [
    { id: 'row-c', sectionKey: 'c', heading: 'C', body: 'Body C' },
    { id: 'row-a', sectionKey: 'a', heading: 'A', body: 'Body A' },
  ])
})

test('projection filters partial and untranslated keyed entries', () => {
  const sections = [
    { sectionKey: 'a' },
    { sectionKey: 'b' },
    { sectionKey: 'c' },
  ]
  const content = {
    a: { heading: 'A', body: 'Body A' },
    b: { heading: 'B', body: null },
    c: { heading: null, body: null },
  }

  assert.deepEqual(
    projectVisibleKeyedSections(sections, content).map((row) => row.sectionKey),
    ['a'],
  )
})

test('projection preserves source order and does not mutate source inputs', () => {
  const sections = [
    { id: '2', sectionKey: 'b', extra: 2 },
    { id: '1', sectionKey: 'a', extra: 1 },
  ]
  const content = {
    a: { heading: 'A', body: 'Body A' },
    b: { heading: 'B', body: 'Body B' },
  }
  const sectionsSnapshot = structuredClone(sections)
  const contentSnapshot = structuredClone(content)

  const projected = projectVisibleKeyedSections(sections, content)

  assert.deepEqual(projected.map((row) => row.sectionKey), ['b', 'a'])
  assert.deepEqual(sections, sectionsSnapshot)
  assert.deepEqual(content, contentSnapshot)
})

test('document projection leaves original document untouched', () => {
  const document = {
    id: 'guide-1',
    title: 'Guide',
    sections: [
      { id: 'a1', sectionKey: 'a' },
      { id: 'b1', sectionKey: 'b' },
    ],
    sectionContent: {
      a: { heading: 'A', body: 'Body A' },
      b: { heading: null, body: null },
    },
    untouched: { value: 42 },
  }

  const projected = projectKeyedLocalizedDocument(document)

  assert.notEqual(projected, document)
  assert.equal(projected.untouched, document.untouched)
  assert.deepEqual(projected.sections, [
    { id: 'a1', sectionKey: 'a', heading: 'A', body: 'Body A' },
  ])
  assert.equal(document.sections.length, 2)
})
