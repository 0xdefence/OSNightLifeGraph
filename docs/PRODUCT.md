# PRODUCT.md

## One-line product
DarkKnight is a graph-driven London hospitality discovery and night-planning app that combines structured venue data, deterministic query parsing, explainable recommendations, and itinerary generation.

## Core user promise
A user can type something like:
- "Friday night in Shoreditch, not too expensive, good music"
- "Second date in Soho under £40 pp, good wine, bookable"
- "Dinner then cocktails then a club in East London under £120"

And DarkKnight returns:
- relevant venues
- a usable filtered map/list view
- venue details
- an optional full night plan
- a simple explanation of why the choices make sense

## Domain
DarkKnight covers:
- restaurants
- bars
- clubs
- events
- neighborhoods
- vibe tags
- price bands
- music genres
- cuisines
- transit nodes
- route planning

## User stories
### Explore
As a user, I want to search and filter London venues using a plain-language query plus structured filters so I can quickly find places that fit my intent.

### Decide
As a user, I want to open a venue and immediately see its type, area, spend level, hours, tags, suitability, and nearby/related places so I can decide fast.

### Plan
As a user, I want DarkKnight to create a night itinerary such as restaurant -> bar -> club so I do not need to manually stitch together a route.

### Understand
As a user, I want to know why a venue or plan was chosen so the product feels trustworthy rather than random.

### Inspect
As a user, I want a simple relationship view connecting a venue to its area, tags, genres, cuisines, events, and similar venues.

## Product principles
- Serious UI, playful domain
- Consumer shell, serious backend
- Plain and usable beats clever and flashy
- Deterministic behavior beats magical behavior for v1
- Trustworthy recommendations beat novelty
- Recruiter-demoable beats overbuilt

## Non-goals for v1
- user auth
- social network features
- live booking integrations
- real-time traffic/transit APIs
- scraping pipelines
- enterprise permissions
- LLM-heavy agent workflows
- general city intelligence platform
- multi-city support

## MVP scope
### Included
- explore page with list + map
- structured filters
- natural language query parsing without LLM
- venue detail view
- itinerary generation
- explanation strings
- relationship graph view for selected venue
- seeded synthetic London data

### Excluded
- payments
- account system
- admin dashboard
- external partner integrations
- mobile-first polish
- real map routing
- personalized recommendation history

## Recruiter-demo framing
Describe it as:

> Built DarkKnight, a graph-driven hospitality discovery and night-planning system for London that models venues, neighborhoods, tags, and events; supports deterministic natural-language query parsing; and generates explainable itineraries using a Python backend with a C++ scoring module.

## Success criteria
V1 succeeds if a recruiter can:
1. load the app locally
2. search and filter venues
3. click a venue and understand it immediately
4. generate a sensible night plan
5. see a clean graph view
6. understand that the project has real backend thinking without feeling overengineered
