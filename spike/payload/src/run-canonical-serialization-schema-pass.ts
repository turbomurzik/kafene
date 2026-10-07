import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_MAX_BYTES,
  DEFAULT_MAX_DEPTH,
  HASH_ENVELOPE_VERSION,
  SERIALIZATION_SPEC_VERSION,
  canonicalHash,
  canonicalSerialize,
  canonicalize,
} from './canonical-serialization.js'

const results: Array<{ name: string; ok: boolean; detail?: string }> = []

function check(name: string, fn: () => void) {
  try {
    fn()
    results.push({ name, ok: true })
    console.log(`PASS  ${name}`)
  } catch (error) {
    const detail = error instanceof Error ? error.stack ?? error.message : String(error)
    results.push({ name, ok: false, detail })
    console.error(`FAIL  ${name}`)
    console.error(detail)
  }
}

check('UTF-16 code-unit key ordering is deterministic and locale-independent', () => {
  const input = { a: 1, B: 2, _: 3, ä: 4, '10': 5, '2': 6, '😀': 7, '�': 8 }
  assert.equal(
    canonicalSerialize(input),
    '{"10":5,"2":6,"B":2,"_":3,"a":1,"ä":4,"😀":7,"�":8}',
  )
})

check('Unicode equivalent values and keys normalize to NFC', () => {
  assert.equal(
    canonicalSerialize({ value: 'Cafe\u0301', key: 'и\u0306 е\u0308 ά' }),
    canonicalSerialize({ value: 'Café', key: 'й ё ά' }),
  )
  assert.equal(canonicalSerialize({ 'Cafe\u0301': 1 }), canonicalSerialize({ Café: 1 }))
})

check('NFC key collision fails closed', () => {
  assert.throws(
    () => canonicalSerialize({ Café: 1, 'Cafe\u0301': 2 }),
    /key collision after normalization/,
  )
})

check('CRLF and CR normalize to LF', () => {
  assert.equal(
    canonicalSerialize({ value: 'one\r\ntwo\rthree' }),
    canonicalSerialize({ value: 'one\ntwo\nthree' }),
  )
})

check('null is explicit while undefined object field means absence', () => {
  const explicitNull = { title: 'Guide', summary: null }
  const absent = { title: 'Guide' }
  const undefinedField = { title: 'Guide', summary: undefined }

  assert.notEqual(canonicalSerialize(explicitNull), canonicalSerialize(absent))
  assert.equal(canonicalSerialize(undefinedField), canonicalSerialize(absent))
})

check('array order is semantic and preserved', () => {
  assert.notEqual(
    canonicalSerialize(['requirements', 'fees']),
    canonicalSerialize(['fees', 'requirements']),
  )
})

check('unsupported object/value types fail closed', () => {
  assert.throws(() => canonicalSerialize(new Date()), /only plain objects/)
  assert.throws(() => canonicalSerialize(new Map()), /only plain objects/)
  assert.throws(() => canonicalSerialize(new Set()), /only plain objects/)
  assert.throws(() => canonicalSerialize(Buffer.from('x')), /only plain objects/)
  assert.throws(() => canonicalSerialize(1n), /unsupported canonical serialization type/)
})

check('objects with toJSON fail closed', () => {
  assert.throws(
    () => canonicalSerialize({ value: 1, toJSON() { return { value: 1 } } }),
    /toJSON/,
  )
})

check('symbol keys fail closed', () => {
  const value: Record<PropertyKey, unknown> = { visible: 1 }
  value[Symbol('hidden')] = 2
  assert.throws(() => canonicalSerialize(value), /symbol keys/)
})

check('sparse and undefined array items fail closed', () => {
  const sparse = new Array(2)
  sparse[1] = 'value'
  assert.throws(() => canonicalSerialize(sparse), /sparse arrays/)
  assert.throws(() => canonicalSerialize(['one', undefined]), /undefined array items/)
})

check('cycles fail closed', () => {
  const value: Record<string, unknown> = {}
  value.self = value
  assert.throws(() => canonicalSerialize(value), /cycle detected/)
})

check('non-integer, unsafe and non-finite numbers fail closed; -0 becomes 0', () => {
  assert.throws(() => canonicalSerialize({ value: 1.5 }), /only integers/)
  assert.throws(() => canonicalSerialize({ value: 1e-7 }), /only integers/)
  assert.throws(
    () => canonicalSerialize({ value: Number.MAX_SAFE_INTEGER + 1 }),
    /unsafe integers/,
  )
  assert.throws(() => canonicalSerialize({ value: Number.NaN }), /NaN or Infinity/)
  assert.throws(() => canonicalSerialize({ value: Number.POSITIVE_INFINITY }), /NaN or Infinity/)
  assert.equal(canonicalSerialize({ value: -0 }), canonicalSerialize({ value: 0 }))
})

check('prototype-like keys and null-prototype objects serialize as ordinary data', () => {
  const value = Object.create(null) as Record<string, unknown>
  value.__proto__ = 'p'
  value.constructor = 'c'
  value.toString = 't'
  value.hasOwnProperty = 'h'
  value.normal = 'n'

  assert.equal(
    canonicalSerialize(value),
    '{"__proto__":"p","constructor":"c","hasOwnProperty":"h","normal":"n","toString":"t"}',
  )
})

check('unpaired UTF-16 surrogates fail closed', () => {
  assert.throws(() => canonicalSerialize({ value: '\ud800' }), /unpaired high surrogate/)
  assert.throws(() => canonicalSerialize({ value: '\udc00' }), /unpaired low surrogate/)
})

check('depth and byte limits fail closed', () => {
  const tooDeep = { a: { b: { c: true } } }
  assert.throws(() => canonicalSerialize(tooDeep, { maxDepth: 1 }), /max depth/)
  assert.throws(
    () => canonicalSerialize({ value: '1234567890' }, { maxBytes: 5 }),
    /max bytes/,
  )
})

check('domain separation distinguishes verification and generation hashes', () => {
  const value = { text: 'same bytes' }
  const verification = canonicalHash('verification', 'guide-section', value)
  const generation = canonicalHash('generation', 'guide-section', value)
  assert.notEqual(verification, generation)
  assert.match(verification, /^[0-9a-f]{64}$/)
  assert.match(generation, /^[0-9a-f]{64}$/)
})

check('component type participates in hash envelope', () => {
  const value = { text: 'same bytes' }
  assert.notEqual(
    canonicalHash('verification', 'guide-section', value),
    canonicalHash('verification', 'guide-summary', value),
  )
})

check('hash envelope framing rejects ambiguous component separators', () => {
  const value = { text: 'same bytes' }
  assert.throws(
    () => canonicalHash('verification', 'guide:section', value),
    /componentType must match/,
  )
  assert.throws(
    () => canonicalHash('verification', 'guide\u0000section', value),
    /componentType must match/,
  )
})

check('rich-text raw JSON is substrate-only, not semantic projection', () => {
  const oneNode = { root: { children: [{ type: 'text', text: 'Hello world', format: 0 }] } }
  const twoNodes = {
    root: {
      children: [
        { type: 'text', text: 'Hello ', format: 0 },
        { type: 'text', text: 'world', format: 0 },
      ],
    },
  }

  assert.notEqual(
    canonicalHash('verification', 'guide-section', oneNode),
    canonicalHash('verification', 'guide-section', twoNodes),
  )
})

check('canonicalization is idempotent', () => {
  const input = { z: 'Cafe\u0301\r\nline', a: { n: null, list: [{ b: 2, a: 1 }, 'text'] } }
  const once = canonicalize(input)
  const twice = canonicalize(once)
  assert.deepEqual(twice, once)
  assert.equal(canonicalSerialize(twice), canonicalSerialize(once))
})

check('golden vectors match pinned canonical bytes and hashes', () => {
  const vectorsURL = new URL('../golden/canonical-serialization-v1.1.json', import.meta.url)
  const vectors = JSON.parse(readFileSync(vectorsURL, 'utf8')) as Array<{
    name: string
    domain: 'verification' | 'generation'
    componentType: string
    input: unknown
    canonical: string
    sha256: string
  }>

  for (const vector of vectors) {
    assert.equal(canonicalSerialize(vector.input), vector.canonical, `${vector.name}: canonical`)
    assert.equal(
      canonicalHash(vector.domain, vector.componentType, vector.input),
      vector.sha256,
      `${vector.name}: sha256`,
    )
  }
})

check('independent Python implementation agrees with golden vectors', () => {
  const script = fileURLToPath(new URL('../reference/check-canonical-serialization.py', import.meta.url))
  const vectors = fileURLToPath(new URL('../golden/canonical-serialization-v1.1.json', import.meta.url))
  const output = execFileSync('python3', [script, vectors], { encoding: 'utf8' })
  assert.match(output, /PYTHON CROSS-CHECK PASS/)
})

console.log('\n--- Canonical serialization v1.1 schema-pass summary ---')
console.log(`serialization_spec_version: ${SERIALIZATION_SPEC_VERSION}`)
console.log(`hash_envelope_version: ${HASH_ENVELOPE_VERSION}`)
console.log(`default_max_depth: ${DEFAULT_MAX_DEPTH}`)
console.log(`default_max_bytes: ${DEFAULT_MAX_BYTES}`)
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`)
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

if (failed.length > 0) process.exitCode = 1
