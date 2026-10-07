#!/usr/bin/env python3
import hashlib
import json
import math
import sys
import unicodedata

MAX_SAFE_INTEGER = 9007199254740991

def normalize_string(value: str) -> str:
    value.encode("utf-16", "strict")
    return unicodedata.normalize("NFC", value.replace("\r\n", "\n").replace("\r", "\n"))

def utf16_key(value: str):
    raw = value.encode("utf-16-be")
    return tuple(int.from_bytes(raw[i:i+2], "big") for i in range(0, len(raw), 2))

def canonicalize(value):
    if value is None or isinstance(value, bool):
        return value
    if isinstance(value, str):
        return normalize_string(value)
    if isinstance(value, int):
        if abs(value) > MAX_SAFE_INTEGER:
            raise TypeError("unsafe integer")
        return value
    if isinstance(value, float):
        if not math.isfinite(value):
            raise TypeError("non-finite number")
        if value.is_integer() and abs(value) > MAX_SAFE_INTEGER:
            raise TypeError("unsafe integer")
        return 0 if value == 0 else value
    if isinstance(value, list):
        return [canonicalize(item) for item in value]
    if isinstance(value, dict):
        normalized = {}
        for raw_key, child in value.items():
            if not isinstance(raw_key, str):
                raise TypeError("non-string key")
            key = normalize_string(raw_key)
            if key in normalized:
                raise TypeError("normalized key collision")
            normalized[key] = canonicalize(child)
        return {key: normalized[key] for key in sorted(normalized, key=utf16_key)}
    raise TypeError(f"unsupported type: {type(value)!r}")

def serialize(value) -> str:
    return json.dumps(canonicalize(value), ensure_ascii=False, separators=(",", ":"), allow_nan=False)

def hash_value(domain: str, component_type: str, value) -> str:
    payload = f"kafene:{domain}:{component_type}\0".encode("utf-8") + serialize(value).encode("utf-8")
    return hashlib.sha256(payload).hexdigest()

def main(path: str):
    with open(path, "r", encoding="utf-8") as handle:
        vectors = json.load(handle)

    for vector in vectors:
        actual_canonical = serialize(vector["input"])
        if actual_canonical != vector["canonical"]:
            raise AssertionError(
                f'{vector["name"]}: canonical mismatch\n'
                f'expected={vector["canonical"]!r}\nactual={actual_canonical!r}'
            )
        actual_hash = hash_value(vector["domain"], vector["componentType"], vector["input"])
        if actual_hash != vector["sha256"]:
            raise AssertionError(
                f'{vector["name"]}: hash mismatch\n'
                f'expected={vector["sha256"]}\nactual={actual_hash}'
            )

    print(f"PYTHON CROSS-CHECK PASS: {len(vectors)}/{len(vectors)} vectors")

if __name__ == "__main__":
    main(sys.argv[1])
