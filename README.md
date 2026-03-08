# DarkKnight

DarkKnight is a graph-driven hospitality discovery and night-planning app for London.

It uses a serious, boring, usable consumer UI on top of a more structured backend:
- deterministic query parsing
- structured filters
- venue graph relationships
- itinerary planning
- explainable recommendations

This repo is the **v1 recruiter-demoable build**, not a generic framework.

## Product summary
DarkKnight helps a user:
- search for restaurants, bars, clubs, and events
- filter by area, vibe, budget, type, cuisine, music, and suitability
- explore results in a split-screen list + map UI
- open venue details and related venues
- generate a night itinerary such as dinner -> cocktails -> club
- see simple explanations for why a plan was chosen
- inspect a clean relationship graph for a venue

## V1 constraints
These are mandatory.

- London only
- No auth required
- No scraping required
- No LLM dependency required
- No paid external APIs required
- No microservices
- No Kubernetes, Kafka, Neo4j, Elasticsearch, or other heavy infra
- No cyberpunk or hacker styling
- Must run locally with seeded synthetic data
- Must be understandable by a recruiter in under 2 minutes

## Core stack
### Frontend
- Next.js (App Router)
- React
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack Query
- Zod
- MapLibre GL JS

### Backend
- Python 3.12
- FastAPI
- Pydantic v2
- SQLAlchemy 2.x
- Alembic
- psycopg
- pytest

### Optimizer
- C++17
- pybind11
- Python fallback if extension is unavailable

### Data
- PostgreSQL 16
- pg_trgm
- UUID primary keys

### Tooling
- pnpm workspaces
- uv
- Docker / docker-compose
- Makefile or equivalent scripts

## Repo shape

```text
/
  apps/
    web/
    api/
  packages/
    optimizer/
    shared-types/
  infra/
    docker-compose.yml
  scripts/
    seed_data/
  docs/
    PRODUCT.md
    ARCHITECTURE.md
    DATA_MODEL.md
    API_SPEC.md
    UX_GUARDRAILS.md
    BUILD_PLAN.md
    DEFINITION_OF_DONE.md
```

## Single source of truth
To avoid drift, use these docs in order of authority:

1. `docs/PRODUCT.md`
2. `docs/UX_GUARDRAILS.md`
3. `docs/DATA_MODEL.md`
4. `docs/API_SPEC.md`
5. `docs/ARCHITECTURE.md`
6. `docs/BUILD_PLAN.md`
7. `docs/DEFINITION_OF_DONE.md`

If code or implementation choices conflict with these docs, update the docs first or explicitly record the deviation.
