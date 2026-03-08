# UX_GUARDRAILS.md

## Core design direction
DarkKnight must look boring, usable, and trustworthy.

Reference feel:
- Uber
- Google Maps
- OpenTable
- Linear
- Notion

Not reference feel:
- cyberpunk dashboards
- hacker UIs
- black-background sci-fi control rooms
- flashy concept-dribbble pages
- fake enterprise "intelligence platform" aesthetics

## Layout
### Primary explore screen
Split layout.

Left side:
- search input
- filters
- result cards
- selected detail drawer or panel

Right side:
- map
- pins
- route lines for plans
- optional neighborhood highlight

This split layout is the default desktop experience.

## Required screens
1. Explore
2. Venue detail
3. Plan / itinerary view
4. Graph panel or graph tab

## Style rules
- light gray / white surfaces
- dark text
- restrained accent color only if necessary
- soft borders
- subtle shadows
- moderate rounding
- strong spacing
- clean hierarchy
- no decorative noise

## Interaction rules
- user should be able to search immediately on load
- filters should be obvious and not hidden behind multiple menus
- map and list should both be useful
- clicking a venue should feel instant
- plan generation should feel like a practical tool, not AI theater
- explanation text should be short, plain, and specific

## Graph rules
- graph view must be clean and secondary
- graph is not the home page hero
- graph background stays light
- nodes and edges should be minimal and readable
- graph must support selected venue context, not become a separate complex product

## Copy rules
Use plain labels.
Prefer:
- Good for dates
- Good for groups
- Late night
- Avg spend
- Why this place
- Similar places
- Works well with

Avoid:
- ontology
- operational context engine
- intelligence fabric
- mission layer
- AI copilot

## What to avoid
- huge marketing hero section
- too many charts
- tables as the main UI
- dense analyst-console aesthetics
- comic-book branding inside the product UI
- Batman visual references in the product experience

## Decision rule
If a UI choice looks "cool" but makes the app less obvious, remove it.
