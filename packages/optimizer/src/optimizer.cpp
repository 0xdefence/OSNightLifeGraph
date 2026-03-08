#include <pybind11/pybind11.h>
#include <pybind11/stl.h>
#include <vector>
#include <string>
#include <cmath>
#include <algorithm>
#include <numeric>

namespace py = pybind11;

struct Stop {
    std::string venue_id;
    double lat;
    double lng;
    double spend;
    double score;
};

// Haversine distance in km
double haversine(double lat1, double lng1, double lat2, double lng2) {
    constexpr double R = 6371.0;
    double dlat = (lat2 - lat1) * M_PI / 180.0;
    double dlng = (lng2 - lng1) * M_PI / 180.0;
    double a = std::sin(dlat / 2) * std::sin(dlat / 2) +
               std::cos(lat1 * M_PI / 180.0) * std::cos(lat2 * M_PI / 180.0) *
               std::sin(dlng / 2) * std::sin(dlng / 2);
    return R * 2.0 * std::atan2(std::sqrt(a), std::sqrt(1.0 - a));
}

// Score an itinerary: higher is better
double score_itinerary(const std::vector<Stop>& stops, double budget, double max_travel_km) {
    if (stops.empty()) return 0.0;

    double total_spend = 0.0;
    double total_distance = 0.0;
    double venue_score_sum = 0.0;

    for (size_t i = 0; i < stops.size(); ++i) {
        total_spend += stops[i].spend;
        venue_score_sum += stops[i].score;
        if (i + 1 < stops.size()) {
            total_distance += haversine(
                stops[i].lat, stops[i].lng,
                stops[i + 1].lat, stops[i + 1].lng
            );
        }
    }

    // Budget penalty
    double budget_factor = (budget > 0 && total_spend > budget)
        ? std::max(0.0, 1.0 - (total_spend - budget) / budget)
        : 1.0;

    // Distance penalty
    double distance_factor = 1.0;
    if (max_travel_km > 0 && stops.size() > 1) {
        double avg_leg = total_distance / static_cast<double>(stops.size() - 1);
        if (avg_leg > max_travel_km) {
            distance_factor = std::max(0.0, 1.0 - (avg_leg - max_travel_km) / max_travel_km);
        }
    }

    double avg_venue_score = venue_score_sum / static_cast<double>(stops.size());

    return avg_venue_score * budget_factor * distance_factor;
}

// Rank candidate itineraries and return indices sorted best-first
std::vector<size_t> rank_itineraries(
    const std::vector<std::vector<Stop>>& candidates,
    double budget,
    double max_travel_km
) {
    std::vector<std::pair<double, size_t>> scored;
    scored.reserve(candidates.size());

    for (size_t i = 0; i < candidates.size(); ++i) {
        double s = score_itinerary(candidates[i], budget, max_travel_km);
        scored.emplace_back(s, i);
    }

    std::sort(scored.begin(), scored.end(), [](const auto& a, const auto& b) {
        return a.first > b.first;
    });

    std::vector<size_t> result;
    result.reserve(scored.size());
    for (const auto& p : scored) {
        result.push_back(p.second);
    }
    return result;
}

PYBIND11_MODULE(_optimizer, m) {
    m.doc() = "DarkKnight itinerary scoring optimizer";

    py::class_<Stop>(m, "Stop")
        .def(py::init<>())
        .def_readwrite("venue_id", &Stop::venue_id)
        .def_readwrite("lat", &Stop::lat)
        .def_readwrite("lng", &Stop::lng)
        .def_readwrite("spend", &Stop::spend)
        .def_readwrite("score", &Stop::score);

    m.def("haversine", &haversine, "Haversine distance in km");
    m.def("score_itinerary", &score_itinerary, "Score an itinerary");
    m.def("rank_itineraries", &rank_itineraries, "Rank candidate itineraries");
}
