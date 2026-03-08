# ARCHITECTURE.md

## Architecture summary
DarkKnight is a monorepo with a single frontend app, a single backend API, a PostgreSQL database, and a lightweight C++ optimizer module callable from Python.

This is a **modular monolith**, not a microservice system.

## Top-level components
### apps/web
Next.js frontend.
Responsibilities:
- search UI
- filters
- map rendering
- venue cards and details
- plan generation UI
- graph view UI
- API integration

### apps/api
FastAPI backend.
Responsibilities:
- venue search/filter endpoints
- venue detail endpoint
- natural language parsing endpoint
- itinerary generation endpoint
- graph endpoint
- ranking logic
- DB access

### packages/optimizer
C++17 module with pybind11.
Responsibilities:
- itinerary scoring
- candidate sequence ranking
- Python-callable optimization path
- pure Python fallback when unavailable

### PostgreSQL
System of record.
Responsibilities:
- normalized core data
- search support
- relationships
- seed data persistence

## Data flow
1. User enters search or plan intent in the frontend.
2. Frontend sends either:
   - structured filter request to `/venues`
   - plain query to `/query/parse`
   - planning request to `/plans/generate`
3. API parses and normalizes input.
4. API queries Postgres for candidates.
5. Ranking layer scores candidates.
6. Planner calls optimizer module or Python fallback.
7. API returns shaped data for UI.
8. Frontend renders list, map, detail, plan, and graph views.

## Key architectural constraints
- PostgreSQL only for v1; no graph database
- deterministic parser; no LLM required
- C++ only where it adds real value
- no background infrastructure required beyond what is necessary to seed and run locally
- local-first developer workflow

## Why C++ exists
C++ is included for the itinerary scoring / optimization path so the project shows:
- serious systems thinking
- mixed-language integration
- performance-aware design

But C++ must remain narrow in scope. Python owns overall app logic.

## Backend module shape
Suggested layout:

```text
apps/api/app/
  main.py
  core/
    config.py
  db/
    base.py
    session.py
  models/
  schemas/
  services/
    search.py
    parser.py
    planner.py
    graph.py
  api/routes/
    health.py
    filters.py
    venues.py
    query.py
    plans.py
    graph.py
  utils/
```

## Frontend module shape
Suggested layout:

```text
apps/web/
  app/
    page.tsx
    explore/
    venue/[slug]/
  components/
    search/
    filters/
    venue/
    plan/
    graph/
    map/
  lib/
    api.ts
    query.ts
    utils.ts
```

## Non-architectural goals
Do not turn this into:
- event-driven architecture theater
- service mesh theater
- infra portfolio bait

The architecture should feel intentional, compact, and credible.
