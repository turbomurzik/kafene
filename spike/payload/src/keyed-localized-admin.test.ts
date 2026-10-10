import assert from 'node:assert/strict'
import test from 'node:test'
import {
  buildKeyedSectionAdminRows,
  getDuplicateSectionKeys,
} from './keyed-localized-admin.js'

test('admin rows follow shared structure order and join localized content by key', () => {
  const rows = buildKeyedSectionAdminRows(
    [
      { sectionKey: 'c' },
      { sectionKey: 'a' },
      { sectionKey: 'b' },
    ],
    {
      a: { heading: 'Альфа', body: 'Текст альфа' },
      b: { heading: null, body: null },
      c: { heading: 'Гамма', body: null },
    },
  )

  assert.deepEqual(rows, [
    {
      index: 0,
      sectionKey: 'c',
      heading: 'Гамма',
      body: null,
      state: 'partial',
    },
    {
      index: 1,
      sectionKey: 'a',
      heading: 'Альфа',
      body: 'Текст альфа',
      state: 'complete',
    },
    {
      index: 2,
      sectionKey: 'b',
      heading: null,
      body: null,
      state: 'untranslated',
    },
  ])
})

test('admin rows treat missing keyed content as untranslated', () => {
  const rows = buildKeyedSectionAdminRows(
    [{ sectionKey: 'a' }, { sectionKey: 'missing' }],
    { a: { heading: 'A', body: 'Body A' } },
  )

  assert.equal(rows[1].state, 'untranslated')
  assert.equal(rows[1].heading, undefined)
  assert.equal(rows[1].body, undefined)
})

test('duplicate detector returns each duplicate key once', () => {
  assert.deepEqual(
    getDuplicateSectionKeys([
      { sectionKey: 'a' },
      { sectionKey: 'b' },
      { sectionKey: 'a' },
      { sectionKey: 'a' },
      { sectionKey: 'b' },
    ]),
    ['a', 'b'],
  )
})

test('duplicate detector ignores missing or empty technical keys', () => {
  assert.deepEqual(
    getDuplicateSectionKeys([
      {},
      { sectionKey: '' },
      { sectionKey: 'a' },
    ]),
    [],
  )
})
