#!/usr/bin/env python3
"""Load KAFENE synthetic fixtures into a configured Discourse instance.

Uses only the supported REST API. No direct DB writes.
"""
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

BASE = os.environ["DISCOURSE_BASE_URL"].rstrip("/")
KEY = os.environ["DISCOURSE_API_KEY"]
USERNAME = os.environ.get("DISCOURSE_API_USERNAME", "system")

ROOT = Path(__file__).resolve().parents[1]
CORPUS = ROOT / "fixtures" / "corpus.jsonl"
MAP = ROOT / "category-map.json"

def post(path, payload):
    data = urllib.parse.urlencode(payload).encode()
    req = urllib.request.Request(
        BASE + path,
        data=data,
        method="POST",
        headers={
            "Api-Key": KEY,
            "Api-Username": USERNAME,
            "Content-Type": "application/x-www-form-urlencoded",
            "User-Agent": "kafene-discourse-spike/0.1",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

def category_for(item, mapping):
    prefix = item["language"]
    if item["kind"] == "guide":
        key = f"{prefix}_guides"
    else:
        key = f"{prefix}_discussions"
    cid = mapping["categories"].get(key)
    if not cid:
        raise RuntimeError(f"Missing category id for {key} in {MAP}")
    return cid

def main():
    mapping = json.loads(MAP.read_text())
    created = {}
    for line in CORPUS.read_text().splitlines():
        if not line.strip():
            continue
        item = json.loads(line)
        payload = {
            "title": item["title"],
            "raw": item["body"],
            "category": str(category_for(item, mapping)),
        }
        # Tags are deliberately simple; the live spike can add controlled tag groups.
        tags = [f"domain-{item['domain']}", f"kind-{item['kind']}", f"lang-{item['language']}"]
        if item.get("stale"):
            tags.append("source-stale")
        payload["tags[]"] = tags
        result = post("/posts.json", payload)
        created[item["fixture_id"]] = {
            "topic_id": result.get("topic_id"),
            "post_id": result.get("id"),
        }
        print(item["fixture_id"], created[item["fixture_id"]])
        time.sleep(0.15)
    out = ROOT / "fixtures" / "created-map.json"
    out.write_text(json.dumps(created, indent=2) + "\n")
    print(f"Wrote {out}")

if __name__ == "__main__":
    main()
