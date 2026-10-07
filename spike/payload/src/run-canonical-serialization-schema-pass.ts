import assert from 'node:assert/strict'
import {
  HASH_SPEC_VERSION,
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

check('object key ordering is deterministic', () => {
  const a = {
    z: 3,
    a: 1,
    nested: {
      beta: 2,
      alpha: 1,
    },
  }

  const b = {
    nested: {
      alpha: 1,
      beta: 2,
    },
    a: 1,
    z: 3,
  }

  assert.equal(canonicalSerialize(a), canonicalSerialize(b))
  assert.equal(canonicalHash(a), canonicalHash(b))
})

check('Unicode canonically equivalent strings normalize to NFC', () => {
  const composed = 'Café'
  const decomposed = 'Cafe\u0301'

  assert.notEqual(composed.length, decomposed.length)
  assert.equal(canonicalSerialize({ value: composed }), canonicalSerialize({ value: decomposed }))
  assert.equal(canonicalHash({ value: composed }), canonicalHash({ value: decomposed }))
})

check('null remains explicit and differs from absent/undefined field', () => {
  const explicitNull = { title: 'Guide', summary: null }
  const absent = { title: 'Guide' }
  const undefinedField = { title: 'Guide', summary: undefined }

  assert.notEqual(canonicalSerialize(explicitNull), canonicalSerialize(absent))
  assert.notEqual(canonicalHash(explicitNull), canonicalHash(absent))

  // JS undefined means field absence for this contract.
  assert.equal(canonicalSerialize(undefinedField), canonicalSerialize(absent))
  assert.equal(canonicalHash(undefinedField), canonicalHash(absent))
})

check('array order is semantic and preserved', () => {
  const first = ['requirements', 'fees']
  const second = ['fees', 'requirements']

  assert.notEqual(canonicalSerialize(first), canonicalSerialize(second))
  assert.notEqual(canonicalHash(first), canonicalHash(second))
})

check('undefined array items fail closed', () => {
  assert.throws(
    () => canonicalSerialize(['one', undefined, 'three']),
    /undefined array items are not allowed/,
  )
})

check('finite numbers are stable and -0 normalizes to 0', () => {
  assert.equal(canonicalSerialize({ value: -0 }), canonicalSerialize({ value: 0 }))
  assert.equal(canonicalHash({ value: -0 }), canonicalHash({ value: 0 }))
  assert.throws(() => canonicalSerialize({ value: Number.NaN }), /NaN or Infinity/)
  assert.throws(() => canonicalSerialize({ value: Number.POSITIVE_INFINITY }), /NaN or Infinity/)
})

check('rich-text object key order and Unicode differences do not change hash', () => {
  // Representative Payload/Lexical-style JSON tree. The serializer intentionally
  // treats rich text as structured data, not as HTML or rendered plaintext.
  const richA = {
    root: {
      type: 'root',
      version: 1,
      direction: 'ltr',
      format: '',
      indent: 0,
      children: [
        {
          type: 'paragraph',
          version: 1,
          direction: 'ltr',
          format: '',
          indent: 0,
          children: [
            {
              type: 'text',
              version: 1,
              detail: 0,
              format: 0,
              mode: 'normal',
              style: '',
              text: 'Café requirements',
            },
          ],
        },
      ],
    },
  }

  const richB = {
    root: {
      children: [
        {
          children: [
            {
              text: 'Cafe\u0301 requirements',
              style: '',
              mode: 'normal',
              format: 0,
              detail: 0,
              version: 1,
              type: 'text',
            },
          ],
          indent: 0,
          format: '',
          direction: 'ltr',
          version: 1,
          type: 'paragraph',
        },
      ],
      indent: 0,
      format: '',
      direction: 'ltr',
      version: 1,
      type: 'root',
    },
  }

  assert.equal(canonicalSerialize(richA), canonicalSerialize(richB))
  assert.equal(canonicalHash(richA), canonicalHash(richB))
})

check('rich-text semantic child order changes hash', () => {
  const a = {
    root: {
      children: [
        { type: 'text', text: 'First' },
        { type: 'text', text: 'Second' },
      ],
    },
  }

  const b = {
    root: {
      children: [
        { type: 'text', text: 'Second' },
        { type: 'text', text: 'First' },
      ],
    },
  }

  assert.notEqual(canonicalHash(a), canonicalHash(b))
})

check('serialization is idempotent', () => {
  const input = {
    z: 'Cafe\u0301',
    a: {
      n: null,
      list: [{ b: 2, a: 1 }, 'text'],
    },
  }

  const once = canonicalize(input)
  const twice = canonicalize(once)

  assert.deepEqual(twice, once)
  assert.equal(canonicalSerialize(twice), canonicalSerialize(once))
})

console.log('\n--- Canonical serialization schema-pass summary ---')
console.log(`hash_spec_version: ${HASH_SPEC_VERSION}`)
for (const result of results) {
  console.log(`${result.ok ? 'PASS' : 'FAIL'}  ${result.name}`)
}

const failed = results.filter((result) => !result.ok)
console.log(`\n${results.length - failed.length}/${results.length} checks passed.`)

if (failed.length > 0) process.exitCode = 1
