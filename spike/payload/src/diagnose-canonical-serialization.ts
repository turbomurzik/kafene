import { readFileSync } from 'node:fs'
import { canonicalSerialize } from './canonical-serialization.js'

function hexBytes(value: string): string {
  return Buffer.from(value, 'utf8')
    .toString('hex')
    .match(/.{1,2}/g)!
    .join(' ')
}

function firstDiff(a: Buffer, b: Buffer): number {
  const n = Math.min(a.length, b.length)
  for (let i = 0; i < n; i += 1) {
    if (a[i] !== b[i]) return i
  }
  return a.length === b.length ? -1 : n
}

function utf16Units(value: string): string {
  const units: string[] = []
  for (let i = 0; i < value.length; i += 1) {
    units.push('0x' + value.charCodeAt(i).toString(16).padStart(4, '0'))
  }
  return units.join(' ')
}

const vectorsURL = new URL('../golden/canonical-serialization-v1.1.json', import.meta.url)
const vectors = JSON.parse(readFileSync(vectorsURL, 'utf8')) as Array<{
  name: string
  input: Record<string, unknown>
  canonical: string
}>

const vector = vectors.find((item) => item.name === 'unicode-keys')
if (!vector) throw new Error('unicode-keys golden vector not found')

const actual = canonicalSerialize(vector.input)
const expected = vector.canonical

const expectedBytes = Buffer.from(expected, 'utf8')
const actualBytes = Buffer.from(actual, 'utf8')
const diff = firstDiff(expectedBytes, actualBytes)

console.log('--- unicode-keys diagnostic ---')
console.log('')
console.log('EXPECTED:')
console.log(expected)
console.log('')
console.log('ACTUAL:')
console.log(actual)
console.log('')
console.log('EXPECTED UTF-8 HEX:')
console.log(hexBytes(expected))
console.log('')
console.log('ACTUAL UTF-8 HEX:')
console.log(hexBytes(actual))
console.log('')
console.log('FIRST DIFFERING BYTE OFFSET:')
console.log(diff)
console.log('')
console.log('INPUT KEYS + UTF-16 CODE UNITS:')
for (const key of Object.keys(vector.input)) {
  console.log(`${JSON.stringify(key)}  ->  ${utf16Units(key)}`)
}
console.log('')
console.log('EXPECTED KEY ORDER (contract / golden):')
console.log(['10', '2', 'B', '_', 'a', 'ä', '😀', '�'].map(JSON.stringify).join(' < '))
console.log('')
console.log('NOTE:')
console.log('- This command does not modify the serializer.')
console.log('- We are checking whether the mismatch is only JS integer-like property enumeration,')
console.log('  and whether the astral/BMP key pair has any additional ordering defect.')
