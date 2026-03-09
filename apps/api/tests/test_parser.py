"""Tests for the deterministic query parser."""

from app.services.parser import parse_query


class TestAreaDetection:
    def test_simple_area(self):
        r = parse_query("bars in Shoreditch")
        assert r.area == "shoreditch"

    def test_area_synonym(self):
        r = parse_query("dinner in East London")
        assert r.area == "shoreditch"

    def test_multiword_area(self):
        r = parse_query("drinks in Covent Garden")
        assert r.area == "covent-garden"

    def test_no_area(self):
        r = parse_query("cocktails somewhere nice")
        assert r.area is None


class TestVenueTypeDetection:
    def test_restaurant_synonym(self):
        r = parse_query("dinner in Soho")
        assert r.venue_type == "restaurant"

    def test_bar(self):
        r = parse_query("cocktails tonight")
        assert r.venue_type == "bar"

    def test_club(self):
        r = parse_query("clubbing in Dalston")
        assert r.venue_type == "club"


class TestRouteDetection:
    def test_arrow_route(self):
        r = parse_query("dinner then cocktails then dancing")
        assert r.is_route is True
        assert len(r.desired_stops) >= 2

    def test_multi_stop_order(self):
        r = parse_query("dinner then drinks then club in Shoreditch")
        assert r.is_route is True
        assert r.desired_stops[0] == "restaurant"
        assert "bar" in r.desired_stops
        assert "club" in r.desired_stops

    def test_no_route(self):
        r = parse_query("a nice bar in Peckham")
        assert r.is_route is False


class TestBudgetDetection:
    def test_under_amount(self):
        r = parse_query("dinner under £50")
        assert r.budget_total == 50.0

    def test_budget_keyword(self):
        r = parse_query("night out budget £100")
        assert r.budget_total == 100.0

    def test_per_person(self):
        r = parse_query("£30pp for 4 people")
        assert r.budget_pp == 30.0
        assert r.party_size == 4
        assert r.budget_total == 120.0

    def test_no_budget(self):
        r = parse_query("fun bars in Camden")
        assert r.budget_total is None


class TestPartySizeDetection:
    def test_people(self):
        r = parse_query("dinner for 6 people")
        assert r.party_size == 6

    def test_group_of(self):
        r = parse_query("group of 8")
        assert r.party_size == 8


class TestVibeDetection:
    def test_romantic(self):
        r = parse_query("romantic restaurant")
        assert "romantic" in r.vibes

    def test_multiple_vibes(self):
        r = parse_query("trendy and lively bar")
        assert "stylish" in r.vibes
        assert "lively" in r.vibes

    def test_casual_synonym(self):
        r = parse_query("chill pub in Peckham")
        assert "relaxed" in r.vibes


class TestFlagDetection:
    def test_date_flag(self):
        r = parse_query("good date spot in Soho")
        assert r.good_for_date is True

    def test_group_flag(self):
        r = parse_query("somewhere for a group of friends")
        assert r.good_for_group is True

    def test_late_night(self):
        r = parse_query("late night drinks")
        assert r.late_night is True


class TestCuisineDetection:
    def test_japanese(self):
        r = parse_query("sushi in Soho")
        assert "japanese" in r.cuisines

    def test_italian(self):
        r = parse_query("pasta restaurant")
        assert "italian" in r.cuisines


class TestGenreDetection:
    def test_house_music(self):
        r = parse_query("techno club in Hackney")
        assert "techno" in r.music_genres

    def test_jazz(self):
        r = parse_query("jazz bar in Soho")
        assert "jazz" in r.music_genres


class TestConfidence:
    def test_rich_query_high_confidence(self):
        r = parse_query("romantic dinner in Shoreditch under £80 for date night")
        assert r.confidence >= 0.7

    def test_empty_query_low_confidence(self):
        r = parse_query("something")
        assert r.confidence <= 0.5


class TestDemoQueries:
    """Test all demo queries from PRODUCT.md."""

    def test_cheap_eats_shoreditch(self):
        r = parse_query("cheap eats in Shoreditch")
        assert r.area == "shoreditch"
        assert "affordable" in r.vibes

    def test_date_night_soho(self):
        r = parse_query("romantic date night in Soho under £100")
        assert r.area == "soho"
        assert r.good_for_date is True
        assert r.budget_total == 100.0

    def test_group_night_brixton(self):
        r = parse_query("group night out in Brixton, late")
        assert r.area == "brixton"
        assert r.good_for_group is True
        assert r.late_night is True

    def test_multi_stop(self):
        r = parse_query("dinner then cocktails then dancing in Shoreditch")
        assert r.is_route is True
        assert r.area == "shoreditch"
        assert len(r.desired_stops) >= 2

    def test_wine_bar_notting_hill(self):
        r = parse_query("wine bar in Notting Hill")
        assert r.area == "notting-hill"
        assert r.venue_type == "bar"

    def test_techno_club_hackney(self):
        r = parse_query("techno club in Hackney")
        assert r.area == "hackney"
        assert r.venue_type == "club"
        assert "techno" in r.music_genres
