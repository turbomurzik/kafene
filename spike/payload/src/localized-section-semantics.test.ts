import assert from 'node:assert/strict'
import test from 'node:test'
import {
  classifyLocalizedPair,
  isSemanticallyEmpty,
  isVisibleSection,
} from './localized-section-semantics.js'

test('isSemanticallyEmpty treats absent and empty values as empty', () => {
  for (const value of [null, undefined, '', ' ', '\t', '\n', '\r\n']) {
    assert.equal(isSemanticallyEmpty(value), true, JSON.stringify(value))
  }
})

test('isSemanticallyEmpty removes Unicode Z, Cc and Cf characters after NFC', () => {
  const emptyVectors = [
    '\u00A0', // NBSP — Zs
    '\u3000', // ideographic space — Zs
    '\u2028', // line separator — Zl
    '\u200B', // zero width space — Cf
    '\uFEFF', // BOM / zero width no-break space — Cf
    '\u00AD', // soft hyphen — Cf
    '\u2060', // word joiner — Cf
    '\u200D', // ZWJ — Cf
    ' \u200B\uFEFF\t\n',
  ]

  for (const value of emptyVectors) {
    assert.equal(isSemanticallyEmpty(value), true, JSON.stringify(value))
  }
})

test('isSemanticallyEmpty preserves meaningful content around ignorable characters', () => {
  const meaningfulVectors = [
    'a',
    ' a ',
    'a\u200B',
    'می\u200Cروم', // Persian text containing ZWNJ
    'e\u0301', // NFD e + combining acute; NFC still meaningful
    '\u0301', // combining mark alone remains meaningful by contract
    '❤️', // emoji plus variation selector
  ]

  for (const value of meaningfulVectors) {
    assert.equal(isSemanticallyEmpty(value), false, JSON.stringify(value))
  }
})

test('known out-of-rule invisible-looking characters remain meaningful', () => {
  for (const value of ['\u2800', '\u3164', '\u115F']) {
    assert.equal(isSemanticallyEmpty(value), false, JSON.stringify(value))
  }
})

test('classifyLocalizedPair returns untranslated, partial and complete states', () => {
  assert.equal(classifyLocalizedPair(null, undefined), 'untranslated')
  assert.equal(classifyLocalizedPair('\u200B', '\uFEFF'), 'untranslated')

  assert.equal(classifyLocalizedPair('Heading', null), 'partial')
  assert.equal(classifyLocalizedPair(null, 'Body'), 'partial')
  assert.equal(classifyLocalizedPair('Heading', '\u200B'), 'partial')
  assert.equal(classifyLocalizedPair('\uFEFF', 'Body'), 'partial')

  assert.equal(classifyLocalizedPair('Heading', 'Body'), 'complete')
  assert.equal(classifyLocalizedPair(' H\u200B ', ' B\u2060 '), 'complete')
})

test('isVisibleSection is true only for complete localized rows', () => {
  assert.equal(isVisibleSection({ heading: null, body: null }), false)
  assert.equal(isVisibleSection({ heading: 'Heading', body: null }), false)
  assert.equal(isVisibleSection({ heading: null, body: 'Body' }), false)
  assert.equal(isVisibleSection({ heading: 'Heading', body: 'Body' }), true)
})
