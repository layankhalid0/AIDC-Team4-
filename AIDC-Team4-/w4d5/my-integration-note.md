# Integration note: team > (v1, go-live)

Copy this file, fill every angle bracket, and hand it to your paired Agentic AI
team. It is Part A of the cross-cohort runbook
(`../../../week-06-capstone/cross-cohort-runbook.md`); the full operating rules
for the window live there.

- **base_url** (client form, ends in `/v1` - paste into an OpenAI client):
  https://t10.aidc.nadir.sh/v1

- **service root** (no `/v1` - the runbook's triage curls and `verify.sh`
  build paths from this):
  https://t10.aidc.nadir.sh

- **model id:**
  Qwen/Qwen2.5-1.5B-Instruct-AWQ
- **auth:** bearer key, not handed over; no key stored in this file
- **modalities:** text in, text out, tool calls per the OpenAI schema.
- **example call:** the exact `curl` from your green check, with the key
  redacted
- **SLOs we publish:** availability 99% over the window · e2e p95 < 3000 ms (tier 0) · error rate < 1%
- **limits, declared honestly:** max_tokens clamp 256 · concurrency knee ~4 (from your wk-3 bench) · vLLM max model length 4096
- **on-call:** Layan · Team Discord · response within 15 minutes during the window
