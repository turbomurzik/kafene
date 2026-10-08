import assert from 'node:assert/strict'
import test from 'node:test'
import {
  projectLocalizedDocument,
  projectVisibleSections,
} from './localized-section-projection.js'

test('projectVisibleSections keeps only complete rows', () => {
  const rows = [
    { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
    { sectionKey: 'b', heading: null, body: null },
    { sectionKey: 'c', heading: 'Partial', body: null },
    { sectionKey: 'd', heading: '\u200B', body: '\uFEFF' },
    { sectionKey: 'e', heading: 'Echo', body: 'Echo body' },
  ]

  const visible = projectVisibleSections(rows)

  assert.deepEqual(
    visible.map((row) => row.sectionKey),
    ['a', 'e'],
  )
})

test('projectVisibleSections preserves source order and row payload', () => {
  const first = {
    id: '1',
    sectionKey: 'first',
    heading: 'First',
    body: 'Body 1',
    extra: { source: 'x' },
  }
  const second = {
    id: '2',
    sectionKey: 'second',
    heading: 'Second',
    body: 'Body 2',
    extra: { source: 'y' },
  }

  const visible = projectVisibleSections([second, first])

  assert.equal(visible.length, 2)
  assert.equal(visible[0], second)
  assert.equal(visible[1], first)
})

test('projectVisibleSections does not mutate the source array', () => {
  const rows = [
    { sectionKey: 'a', heading: 'Alpha', body: 'Alpha body' },
    { sectionKey: 'b', heading: null, body: null },
  ]
  const snapshot = structuredClone(rows)

  const visible = projectVisibleSections(rows)

  assert.deepEqual(rows, snapshot)
  assert.notEqual(visible, rows)
})

test('projectVisibleSections returns an empty list for absent sections', () => {
  assert.deepEqual(projectVisibleSections(undefined), [])
  assert.deepEqual(projectVisibleSections(null), [])
})

test('projectLocalizedDocument returns a new document with only visible sections', () => {
  const document = {
    id: 'guide-1',
    title: 'Guide',
    locale: 'ru',
    sections: [
      { sectionKey: 'a', heading: 'Альфа', body: 'Текст' },
      { sectionKey: 'b', heading: null, body: null },
      { sectionKey: 'c', heading: 'Частично', body: null },
    ],
    untouched: { value: 42 },
  }

  const projected = projectLocalizedDocument(document)

  assert.notEqual(projected, document)
  assert.equal(projected.id, document.id)
  assert.equal(projected.title, document.title)
  assert.equal(projected.untouched, document.untouched)
  assert.deepEqual(
    projected.sections.map((row) => row.sectionKey),
    ['a'],
  )

  assert.equal(document.sections.length, 3)
})

test('projection uses the canonical semantic classifier for mixed invisible content', () => {
  const rows = [
    { sectionKey: 'empty', heading: '\u200B', body: '\uFEFF' },
    { sectionKey: 'meaningful', heading: ' A\u200B ', body: ' B\u2060 ' },
  ]

  assert.deepEqual(
    projectVisibleSections(rows).map((row) => row.sectionKey),
    ['meaningful'],
  )
})
