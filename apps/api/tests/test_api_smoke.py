"""Smoke tests for the API endpoints.

These tests hit the real database (must be running and seeded).
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


class TestHealth:
    def test_health(self):
        r = client.get("/health")
        assert r.status_code == 200
        assert r.json()["status"] == "ok"


class TestFilters:
    def test_filters(self):
        r = client.get("/filters")
        assert r.status_code == 200
        data = r.json()
        assert len(data["neighborhoods"]) >= 1
        assert len(data["venue_types"]) >= 1
        assert len(data["vibe_tags"]) >= 1


class TestVenues:
    def test_venue_list(self):
        r = client.get("/venues")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        assert len(data["items"]) > 0

    def test_venue_list_filtered(self):
        r = client.get("/venues?venue_type=bar")
        assert r.status_code == 200
        data = r.json()
        assert data["total"] > 0
        for item in data["items"]:
            assert item["venue_type"] == "bar"

    def test_venue_detail_by_slug(self):
        # Get a venue slug first
        list_r = client.get("/venues?limit=1")
        items = list_r.json()["items"]
        assert len(items) > 0
        slug = items[0]["slug"]

        r = client.get(f"/venues/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == slug
        assert "opening_hours" in data
        assert "similar_venues" in data
        assert "nearby_venues" in data


class TestQueryParse:
    def test_parse(self):
        r = client.post("/query/parse", json={"query": "cocktails in Soho"})
        assert r.status_code == 200
        data = r.json()
        sq = data["structured_query"]
        assert sq["area"] == "soho"
        assert sq["venue_type"] == "bar"
        assert data["confidence"] > 0


class TestPlans:
    def test_generate_plan(self):
        r = client.post("/plans/generate", json={
            "start_time": "2026-03-14T19:00:00",
            "desired_stops": ["restaurant", "bar"],
            "area": "shoreditch",
        })
        assert r.status_code == 200
        data = r.json()
        best = data["best_itinerary"]
        assert len(best["stops"]) == 2
        assert best["stops"][0]["stop_order"] == 1
        assert best["total_estimated_spend"] > 0
        assert len(best["why_this_plan"]) >= 1


class TestGraph:
    def test_graph(self):
        # Get a venue slug first
        list_r = client.get("/venues?limit=1")
        slug = list_r.json()["items"][0]["slug"]

        r = client.get(f"/graph/venue/{slug}")
        assert r.status_code == 200
        data = r.json()
        assert len(data["nodes"]) > 0
        assert len(data["edges"]) > 0
        # Center node should be a venue
        node_types = {n["type"] for n in data["nodes"]}
        assert "venue" in node_types
