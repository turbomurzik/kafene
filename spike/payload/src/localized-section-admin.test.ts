import assert from 'node:assert/strict'
import test from 'node:test'
import { getLocalizedSectionAdminLabel } from './localized-section-admin.js'

test('row label shows sectionKey and untranslated state', () => {
  assert.equal(
    getLocalizedSectionAdminLabel({
      sectionKey: 'transport',
      heading: null,
      body: null,
    }, 1),
    'transport — untranslated',
  )
})

test('row label shows partial state', () => {
  assert.equal(
    getLocalizedSectionAdminLabel({
      sectionKey: 'housing',
      heading: 'Housing',
      body: null,
    }, 2),
    'housing — partial',
  )
})

test('row label shows complete state', () => {
  assert.equal(
    getLocalizedSectionAdminLabel({
      sectionKey: 'tax',
      heading: 'Tax',
      body: 'Tax body',
    }, 3),
    'tax — complete',
  )
})

test('row label uses canonical Unicode emptiness semantics', () => {
  assert.equal(
    getLocalizedSectionAdminLabel({
      sectionKey: 'health',
      heading: '\u200B',
      body: '\uFEFF',
    }, 4),
    'health — untranslated',
  )
})

test('row label falls back to row number when sectionKey is unavailable', () => {
  assert.equal(
    getLocalizedSectionAdminLabel({
      heading: 'Heading',
      body: 'Body',
    }, 5),
    'Section 5 — complete',
  )
})
