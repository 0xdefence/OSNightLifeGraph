# BUILD_PLAN.md

## Build order
This order is mandatory unless a blocker forces a change.

1. Scaffold monorepo
2. Stand up local Postgres via docker-compose
3. Implement models and Alembic migrations
4. Add seed fixtures and seed script
5. Implement basic `/health`, `/filters`, `/venues`, `/venues/{id}`
6. Implement deterministic query parser
7. Implement planner service in Python
8. Add C++ optimizer module and wire Python fallback
9. Implement graph endpoint
10. Build frontend explore page
11. Build venue detail drawer/page
12. Build plan view
13. Build graph panel
14. Wire frontend to backend
15. Add tests
16. Write README
17. Sanity-check demo flow end to end

## Phase gates
### Gate 1: data foundation complete
- migrations run cleanly
- seed loads successfully
- API can return venue list and venue detail

### Gate 2: discovery complete
- search works
- filters work
- parser works for sample queries
- explore page is usable

### Gate 3: planning complete
- planner returns sensible itineraries
- explanations exist
- C++ path is integrated or Python fallback is clearly functional

### Gate 4: demo complete
- graph view works
- UI feels coherent
- README is usable by another developer

## Implementation shortcuts allowed
- haversine distance instead of live routing
- heuristic travel time estimate
- seeded similarity instead of ML similarity
- deterministic parser instead of LLM parser

## Implementation shortcuts not allowed
- fake itinerary output disconnected from data
- placeholder graph with hardcoded nodes
- broken filters
- empty venue detail state for core data
- massive unfinished infra setup
