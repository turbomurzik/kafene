import { createHash } from 'node:crypto'

export const SERIALIZATION_SPEC_VERSION = 'kafene-canonical-json-v1.1'
export const HASH_ENVELOPE_VERSION = 'kafene-sha256-domain-v1'
export const DEFAULT_MAX_DEPTH = 64
export const DEFAULT_MAX_BYTES = 1_048_576

type HashDomain = 'verification' | 'generation'
type CanonicalPrimitive = null | boolean | number | string
export type CanonicalValue =
  | CanonicalPrimitive
  | CanonicalValue[]
  | { [key: string]: CanonicalValue }

type CanonicalizeOptions = {
  maxDepth?: number
}

type SerializeOptions = CanonicalizeOptions & {
  maxBytes?: number
}

function isPlainObject(value: object): value is Record<string, unknown> {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function assertWellFormedUtf16(value: string, label: string) {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code >= 0xd800 && code <= 0xdbff) {
      const next = value.charCodeAt(i + 1)
      if (!(next >= 0xdc00 && next <= 0xdfff)) {
        throw new TypeError(`${label} contains an unpaired high surrogate`)
      }
      i += 1
      continue
    }
    if (code >= 0xdc00 && code <= 0xdfff) {
      throw new TypeError(`${label} contains an unpaired low surrogate`)
    }
  }
}

function normalizeString(value: string, label: string): string {
  assertWellFormedUtf16(value, label)
  return value.replace(/\r\n?/g, '\n').normalize('NFC')
}

function compareUtf16CodeUnits(a: string, b: string): number {
  const length = Math.min(a.length, b.length)
  for (let i = 0; i < length; i += 1) {
    const aa = a.charCodeAt(i)
    const bb = b.charCodeAt(i)
    if (aa !== bb) return aa < bb ? -1 : 1
  }
  if (a.length === b.length) return 0
  return a.length < b.length ? -1 : 1
}

function canonicalNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new TypeError('canonical serialization does not allow NaN or Infinity')
  }
  if (Number.isInteger(value) && !Number.isSafeInteger(value)) {
    throw new TypeError('canonical serialization does not allow unsafe integers')
  }
  return Object.is(value, -0) ? 0 : value
}

function canonicalizeInternal(
  value: unknown,
  seen: WeakSet<object>,
  depth: number,
  maxDepth: number,
  path: string,
): CanonicalValue {
  if (depth > maxDepth) {
    throw new RangeError(`canonical serialization exceeds max depth ${maxDepth}`)
  }

  if (value === null) return null
  if (typeof value === 'string') return normalizeString(value, path)
  if (typeof value === 'number') return canonicalNumber(value)
  if (typeof value === 'boolean') return value

  if (
    typeof value === 'undefined' ||
    typeof value === 'bigint' ||
    typeof value === 'symbol' ||
    typeof value === 'function'
  ) {
    throw new TypeError(`unsupported canonical serialization type at ${path}: ${typeof value}`)
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) throw new TypeError(`cycle detected at ${path}`)
    seen.add(value)

    for (let i = 0; i < value.length; i += 1) {
      if (!(i in value)) {
        seen.delete(value)
        throw new TypeError(`sparse arrays are not allowed at ${path}[${i}]`)
      }
      if (typeof value[i] === 'undefined') {
        seen.delete(value)
        throw new TypeError(`undefined array items are not allowed at ${path}[${i}]`)
      }
    }

    const result = value.map((item, index) =>
      canonicalizeInternal(item, seen, depth + 1, maxDepth, `${path}[${index}]`),
    )
    seen.delete(value)
    return result
  }

  if (typeof value === 'object') {
    if (!isPlainObject(value)) {
      throw new TypeError(
        `only plain objects are allowed at ${path}; got ${value.constructor?.name ?? 'unknown'}`,
      )
    }

    if (typeof (value as { toJSON?: unknown }).toJSON === 'function') {
      throw new TypeError(`objects with toJSON are not allowed at ${path}`)
    }

    const symbols = Object.getOwnPropertySymbols(value)
    if (symbols.length > 0) {
      throw new TypeError(`symbol keys are not allowed at ${path}`)
    }

    if (seen.has(value)) throw new TypeError(`cycle detected at ${path}`)
    seen.add(value)

    const normalized = new Map<string, CanonicalValue>()
    for (const [rawKey, child] of Object.entries(value)) {
      if (typeof child === 'undefined') continue

      const key = normalizeString(rawKey, `${path} key`)
      if (normalized.has(key)) {
        seen.delete(value)
        throw new TypeError(`key collision after normalization at ${path}: ${JSON.stringify(key)}`)
      }

      normalized.set(
        key,
        canonicalizeInternal(child, seen, depth + 1, maxDepth, `${path}.${key}`),
      )
    }

    seen.delete(value)

    return Object.fromEntries(
      [...normalized.entries()].sort(([a], [b]) => compareUtf16CodeUnits(a, b)),
    )
  }

  throw new TypeError(`unsupported canonical serialization value at ${path}`)
}

export function canonicalize(
  value: unknown,
  options: CanonicalizeOptions = {},
): CanonicalValue {
  return canonicalizeInternal(
    value,
    new WeakSet<object>(),
    0,
    options.maxDepth ?? DEFAULT_MAX_DEPTH,
    '$',
  )
}

export function canonicalSerialize(
  value: unknown,
  options: SerializeOptions = {},
): string {
  const serialized = JSON.stringify(canonicalize(value, options))
  const byteLength = Buffer.byteLength(serialized, 'utf8')
  const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES

  if (byteLength > maxBytes) {
    throw new RangeError(
      `canonical serialization exceeds max bytes ${maxBytes}: got ${byteLength}`,
    )
  }

  return serialized
}

function assertComponentType(componentType: string) {
  if (!/^[a-z][a-z0-9._-]{0,127}$/.test(componentType)) {
    throw new TypeError('componentType must match ^[a-z][a-z0-9._-]{0,127}$')
  }
}

export function canonicalHash(
  domain: HashDomain,
  componentType: string,
  value: unknown,
  options: SerializeOptions = {},
): string {
  assertComponentType(componentType)
  const bytes = canonicalSerialize(value, options)
  const prefix = `kafene:${domain}:${componentType}\0`

  return createHash('sha256')
    .update(prefix, 'utf8')
    .update(bytes, 'utf8')
    .digest('hex')
}
