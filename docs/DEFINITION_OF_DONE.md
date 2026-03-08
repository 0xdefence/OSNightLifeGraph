# DEFINITION_OF_DONE.md

DarkKnight v1 is done only when all of the following are true.

## Repo / structure
- monorepo exists and matches intended layout
- frontend app runs locally
- backend app runs locally
- optimizer package exists and is integrated

## Data / database
- PostgreSQL schema is created through migrations
- seed data loads successfully
- seeded data is realistic enough to support demo queries

## Core product flows
### Explore
- venue list loads
- map loads or degrades gracefully
- filters work
- search works
- result cards are useful

### Venue detail
- clicking a venue shows full detail
- hours, spend, tags, area, and suitability are visible
- nearby or similar venues are present

### Parser
- sample plain-English queries parse into sensible structured output
- parser is deterministic and explainable

### Planner
- plan generation returns a sensible itinerary
- itinerary respects stop order where possible
- budget is considered
- hours are considered
- travel distance is considered
- explanation text is present
- alternatives are returned when possible

### Graph
- graph endpoint returns real venue-centric relationships
- frontend graph view renders real nodes and edges
- graph is readable and clean

## Technical quality
- C++ optimizer path is wired into planning flow or can be switched on cleanly
- Python fallback works if C++ module is unavailable
- code does not contain obvious unfinished core TODOs
- tests cover parser, planner, and at least one API smoke path
- README explains local setup clearly

## Recruiter test
A recruiter or engineer should be able to:
1. run the app locally from docs
2. search a venue
3. open a venue
4. generate a night plan
5. inspect the graph
6. understand why the project is technically serious

If that demo path breaks, it is not done.
