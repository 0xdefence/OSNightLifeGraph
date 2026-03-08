# DATA_MODEL.md

## Modeling principles
- normalized where it keeps data clear
- pragmatic denormalization only when helpful for read paths
- UUID primary keys
- slugs for user-facing routes
- all seeded data must be realistic enough to demo

## Core entities
### neighborhoods
Fields:
- id
- name
- slug
- center_lat
- center_lng
- description

Seed neighborhoods:
- Soho
- Shoreditch
- Camden
- Peckham
- Hackney
- Covent Garden
- Notting Hill
- Dalston
- London Bridge
- Brixton

### venue_types
Canonical values:
- restaurant
- bar
- club

### venues
Fields:
- id
- slug
- name
- description
- venue_type_id
- neighborhood_id
- address
- lat
- lng
- price_band (1-5)
- average_spend_gbp
- average_rating
- booking_url nullable
- is_bookable
- good_for_date
- good_for_group
- good_for_late_night
- closes_after_midnight
- noise_level (1-5)
- dress_code nullable
- popularity_score
- source_type
- created_at
- updated_at

### vibe_tags
Examples:
- stylish
- romantic
- lively
- chaotic
- relaxed
- intimate
- bougie
- affordable
- music-forward
- wine-led
- date-night
- group-friendly
- late-night

### cuisines
Examples:
- Italian
- Japanese
- French
- Modern European
- Middle Eastern
- British
- Korean
- Thai
- Mexican
- Steakhouse

### music_genres
Examples:
- house
- techno
- disco
- hip hop
- afrobeats
- jazz
- open format
- live music

### opening_hours
Fields:
- venue_id
- day_of_week
- opens_at
- closes_at

### events
Fields:
- id
- venue_id
- name
- start_at
- end_at
- genre
- estimated_cover_gbp

### transit_nodes
Fields:
- id
- name
- lat
- lng
- line_names

### venue_similarity
Fields:
- venue_id
- similar_venue_id
- similarity_score
- reason

### itineraries
Fields:
- id
- query_text nullable
- area_name nullable
- budget_total nullable
- party_size
- start_time
- total_estimated_spend
- total_score
- created_at

### itinerary_stops
Fields:
- id
- itinerary_id
- stop_order
- venue_id
- estimated_arrival_time
- estimated_departure_time
- estimated_spend_gbp
- explanation

## Join tables
- venue_vibe_tags
- venue_cuisines
- venue_music_genres
- venue_transit_nodes optional

## Seed data rules
- 100 to 150 venues
- at least 10 neighborhoods
- 20 to 40 events
- 15 to 20 transit nodes
- every venue must have:
  - a type
  - a neighborhood
  - coordinates
  - at least 2 vibe tags
  - realistic hours
  - plausible spend
- a meaningful subset must be bookable
- a meaningful subset must be late-night
- enough variety must exist for at least:
  - cheap date spots
  - Soho wine bars
  - Shoreditch dinner + cocktails + club plans
  - group-friendly Peckham / Brixton nights

## Query vocabulary alignment
The seeded data must be rich enough that the parser can map user language into actual filters.

Example mappings supported by data:
- cheap -> lower price band / lower average spend
- bougie -> higher price band / stylish tag
- date spot -> good_for_date + intimate/romantic/wine-led
- good music -> music-forward + genre match
- late -> closes_after_midnight / good_for_late_night
- cocktails -> bar / stylish / lively
- dinner -> restaurant
- club -> club
