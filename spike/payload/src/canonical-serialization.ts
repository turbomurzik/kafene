import { createHash } from 'node:crypto'

export const HASH_SPEC_VERSION = 'kafene-canonical-json-v1'

type CanonicalPrimitive = null | boolean | number | string
export type CanonicalValue =
  | CanonicalPrimitive
  | CanonicalValue[]
  | { [key: string]: CanonicalValue }

function canonicalNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new TypeError('canonical serialization does not allow NaN or Infinity')
  }

  // JSON already has a single deterministic spelling for finite numbers.
  // Normalize -0 to 0 so semantically identical numeric zero hashes equally.
  return Object.is(value, -0) ? 0 : value
}

export function canonicalize(value: unknown): CanonicalValue {
  if (value === null) return null

  if (typeof value === 'string') return value.normalize('NFC')
  if (typeof value === 'number') return canonicalNumber(value)
  if (typeof value === 'boolean') return value

  if (Array.isArray(value)) {
    return value.map((item) => {
      if (typeof item === 'undefined') {
        throw new TypeError('undefined array items are not allowed in canonical serialization')
      }
      return canonicalize(item)
    })
  }

  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, child]) => typeof child !== 'undefined')
      .sort(([a], [b]) => a.localeCompare(b, 'en'))
      .map(([key, child]) => [key.normalize('NFC'), canonicalize(child)] as const)

    return Object.fromEntries(entries)
  }

  throw new TypeError(`unsupported canonical serialization type: ${typeof value}`)
}

export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalHash(value: unknown): string {
  return createHash('sha256')
    .update(canonicalSerialize(value), 'utf8')
    .digest('hex')
}
