# DarkKnight

Graph-driven hospitality discovery and night-planning app for London.

Serious, boring, usable consumer UI on top of a structured backend:
deterministic query parsing, venue graph relationships, itinerary planning,
and explainable recommendations. No LLM dependency.

## Quick start

**Prerequisites**: Docker, Node.js 18+, pnpm, Python 3.12+, uv

```bash
# 1. Clone and install
git clone <repo-url> && cd OSNightLifeGraph
pnpm install
cd apps/api && uv sync && cd ../..

# 2. Start Postgres
make db
# Wait a few seconds for the container to initialize

# 3. Run migrations and seed data
make migrate
make seed

# 4. Start the API (terminal 1)
make api

# 5. Start the frontend (terminal 2)
make web
```

Open **http://localhost:3000** — that's it.

## Demo flow (recruiter test)

1. Open the app → venue list + map loads
2. Type "cocktails in Soho" → results filter to Soho bars
3. Click a venue card → detail panel with hours, tags, events, similar places
4. Switch to "Graph" tab → venue relationship graph renders
5. Click "Plan a night" → describe a night ("dinner then drinks in Shoreditch, £80 budget")
6. Hit "Generate plan" → multi-stop itinerary with explanations

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router), React 19, TypeScript, Tailwind, TanStack Query, MapLibre GL JS |
| Backend | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.x, Alembic |
| Optimizer | C++17 + pybind11 (Python fallback if not built) |
| Database | PostgreSQL 16, pg_trgm, UUID primary keys |
| Tooling | pnpm workspaces, uv, Docker, Makefile |

## API endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check |
| GET | `/filters` | Available filter options |
| GET | `/venues` | Venue list with filtering |
| GET | `/venues/{slug}` | Venue detail |
| POST | `/query/parse` | NLP query → structured filters |
| POST | `/plans/generate` | Generate night itinerary |
| GET | `/graph/venue/{slug}` | Venue relationship graph |

## Repo layout

```
/
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # FastAPI backend
├── packages/
│   ├── optimizer/    # C++17 + Python fallback
│   └── shared-types/ # TypeScript types
├── infra/
│   └── docker-compose.yml
└── docs/             # Spec files (source of truth)
```

## Make targets

```bash
make dev        # Start everything (db + api + web)
make db         # Start Postgres container
make api        # Start FastAPI server
make web        # Start Next.js dev server
make migrate    # Run Alembic migrations
make seed       # Load seed data (120 venues, 30 events)
make test       # Run pytest suite
make clean      # Remove build artifacts
```

## Tests

```bash
make test
# or directly:
cd apps/api && uv run pytest -v
```

Tests cover:
- **Parser**: area, venue type, route, budget, party size, vibes, flags, cuisines, genres, confidence — plus all 6 demo queries from the product spec
- **API smoke**: health, filters, venue list/detail, query parse, plan generation, graph endpoint

## Data

Seeded with 120 synthetic London venues across 10 neighborhoods, 30 events,
bidirectional similarity links, opening hours, and transit node associations.
All deterministic (uuid5-based) so `make seed` is idempotent.

## V1 constraints

- London only
- No auth, payments, scraping, or LLM on critical path
- No heavy infra (no K8s, Kafka, Neo4j, Elasticsearch)
- Runs locally with seeded synthetic data
- Must be understandable by a recruiter in under 2 minutes
