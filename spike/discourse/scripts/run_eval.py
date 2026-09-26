#!/usr/bin/env python3
"""Calculate deterministic retrieval metrics from exported spike results.

Input results JSONL format:
{"case_id":"...", "ranked_fixture_ids":["id1","id2",...]}

This script deliberately does NOT call an undocumented Discourse semantic endpoint.
The live runner must export rankings through the supported interface verified during
the spike.
"""
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES = ROOT / "evaluation" / "cross_language_cases.jsonl"

def load_jsonl(path):
    return [json.loads(x) for x in Path(path).read_text().splitlines() if x.strip()]

def main():
    if len(sys.argv) != 2:
        raise SystemExit("usage: run_eval.py retrieval-results.jsonl")
    cases = {x["case_id"]: x for x in load_jsonl(CASES)}
    results = {x["case_id"]: x for x in load_jsonl(sys.argv[1])}
    n = len(cases)
    hits = {1:0,3:0,5:0}
    rr = 0.0
    missing = []
    for cid, case in cases.items():
        ranked = results.get(cid, {}).get("ranked_fixture_ids", [])
        expected = set(case["expected_fixture_ids"])
        rank = next((i+1 for i,x in enumerate(ranked) if x in expected), None)
        if rank is None:
            missing.append(cid)
            continue
        rr += 1.0 / rank
        for k in hits:
            if rank <= k:
                hits[k] += 1
    print(json.dumps({
        "cases": n,
        "hit_at_1": hits[1]/n if n else 0,
        "hit_at_3": hits[3]/n if n else 0,
        "hit_at_5": hits[5]/n if n else 0,
        "mrr": rr/n if n else 0,
        "misses": missing,
    }, indent=2))

if __name__ == "__main__":
    main()
