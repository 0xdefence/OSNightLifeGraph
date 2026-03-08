# CLAUDE.md

## Mission
Build DarkKnight v1 as a recruiter-demoable local-first product.

## Priority order
1. Product clarity
2. Usable UI
3. Clean data model
4. Working API flows
5. Real planner
6. Narrow but real C++ integration
7. Tests and docs

## Hard rules
- do not introduce infra not required by v1
- do not change the product into a generic framework
- do not add auth, payments, scraping, or LLM dependencies to the critical path
- do not make the UI flashy
- do not replace PostgreSQL with a graph database
- do not widen city scope beyond London

## If uncertain
Choose the simplest implementation that preserves:
- search
- venue detail
- planner
- graph view
- local runnability

## Drift rule
Before changing scope, check:
- docs/PRODUCT.md
- docs/UX_GUARDRAILS.md
- docs/DATA_MODEL.md
- docs/API_SPEC.md

If implementation differs from docs, either:
- update the docs intentionally, or
- revert the implementation drift
