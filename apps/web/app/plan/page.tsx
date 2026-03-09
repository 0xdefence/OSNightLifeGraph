"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generatePlan } from "@/lib/api";
import type { PlanResponse, PlanItinerary } from "@/lib/types";
import {
  Clock,
  Wallet,
  Route,
  CalendarDays,
  Users,
  Share,
  MapPin,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Navigation,
  RefreshCcw,
  X,
  GripVertical,
  MoreHorizontal,
} from "lucide-react";

export default function PlanPage() {
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Form state
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [partySize, setPartySize] = useState("2");
  const [startTime, setStartTime] = useState("19:30");

  const mutation = useMutation({
    mutationFn: generatePlan,
    onSuccess: (data) => {
      setResult(data);
      setActiveIndex(0);
    },
  });

  function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({
      query: query || undefined,
      area: area || undefined,
      budget_total: budget ? Number(budget) : undefined,
      party_size: partySize ? Number(partySize) : undefined,
      start_time: new Date(`2026-03-14T${startTime}:00`).toISOString(),
    });
  }

  const all = result
    ? [result.best_itinerary, ...result.alternatives]
    : [];
  const active: PlanItinerary | null = all[activeIndex] ?? null;

  const totalWalkMin = active
    ? active.stops.reduce(
        (acc, s) => acc + (s.estimated_travel_minutes_to_next ?? 0),
        0,
      )
    : 0;

  const stopLabels = ["Dinner", "Drinks", "Late Night", "After Hours"];

  return (
    <div className="flex flex-col w-full h-full bg-[#FAFAFA] overflow-hidden font-sans antialiased text-neutral-900">
      {/* Toolbar */}
      <header className="flex-none bg-white border-b border-neutral-200 h-16 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h1 className="text-base font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              {area || "London"} Evening
              <button className="p-1 text-neutral-400 hover:text-neutral-900 rounded">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </h1>
            <div className="text-[11px] font-medium text-neutral-500">
              {active
                ? `${active.stops.length} stops planned`
                : "Set up your night"}
            </div>
          </div>

          <div className="w-px h-6 bg-neutral-200 hidden md:block" />

          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-50 text-xs font-semibold text-neutral-600 border border-neutral-100">
              <CalendarDays className="w-3.5 h-3.5 text-neutral-400" />
              {new Date().toLocaleDateString("en-GB", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-50 text-xs font-semibold text-neutral-600 border border-neutral-100">
              <Clock className="w-3.5 h-3.5 text-neutral-400" />
              {startTime} Start
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-50 text-xs font-semibold text-neutral-600 border border-neutral-100">
              <Users className="w-3.5 h-3.5 text-neutral-400" />
              {partySize} Guests
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="h-9 px-4 text-xs font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-2 transition-colors border border-neutral-200 rounded shadow-sm hover:bg-neutral-50 bg-white">
            <Share className="w-3.5 h-3.5" /> Share
          </button>
          <button className="h-9 px-5 bg-neutral-900 text-white text-xs font-bold rounded hover:bg-black transition-colors shadow-sm flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <div className="w-[480px] flex-none bg-white border-r border-neutral-200 overflow-y-auto flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          {!active ? (
            /* Form state */
            <div className="p-8">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-6">
                Plan your night
              </h2>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                    Describe your night
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g. Dinner then cocktails in Shoreditch, £80 budget"
                    rows={2}
                    className="w-full rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm px-3 py-2 transition-all placeholder:text-neutral-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                      Area
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="e.g. Shoreditch"
                      className="w-full rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm px-3 py-1.5 transition-all placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                      Budget
                    </label>
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      placeholder="£ total"
                      className="w-full rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm px-3 py-1.5 transition-all placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                      Party Size
                    </label>
                    <input
                      type="number"
                      value={partySize}
                      onChange={(e) => setPartySize(e.target.value)}
                      min={1}
                      max={20}
                      className="w-full rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm px-3 py-1.5 transition-all placeholder:text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-neutral-500 uppercase tracking-widest mb-2 block">
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full rounded-md bg-neutral-100/70 border border-transparent focus:bg-white focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 outline-none text-sm px-3 py-1.5 transition-all placeholder:text-neutral-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full h-10 bg-neutral-900 text-white text-sm font-bold rounded-md hover:bg-black transition-colors shadow-sm disabled:opacity-50"
                >
                  {mutation.isPending ? "Planning..." : "Generate Plan"}
                </button>
              </form>
              {mutation.isError && (
                <p className="mt-3 text-sm text-red-600">
                  Something went wrong. Try again.
                </p>
              )}
            </div>
          ) : (
            /* Results state */
            <>
              {/* Option switcher */}
              <div className="flex items-center justify-between p-8 pb-5">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() =>
                      setActiveIndex(Math.max(0, activeIndex - 1))
                    }
                    disabled={activeIndex === 0}
                    className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-30"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <div className="flex flex-col items-center">
                    <span className="text-sm font-bold text-neutral-900">
                      Option {activeIndex + 1} of {all.length}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest mt-1">
                      {activeIndex === 0 ? "Best Plan" : "Alternative"}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      setActiveIndex(
                        Math.min(all.length - 1, activeIndex + 1),
                      )
                    }
                    disabled={activeIndex === all.length - 1}
                    className="p-1.5 rounded-md border border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 transition-colors shadow-sm disabled:opacity-30"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-green-800 bg-green-50 px-2.5 py-1 rounded border border-green-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Fits
                  criteria
                </div>
              </div>

              {/* Plan summary */}
              <div className="px-8 pb-8">
                <div className="bg-neutral-50/50 border border-neutral-200 rounded-lg p-5">
                  <h3 className="text-xs font-bold text-neutral-900 mb-4 uppercase tracking-widest">
                    Plan Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                        <Wallet className="w-3 h-3" /> Est. Spend
                      </span>
                      <span className="text-lg font-bold text-neutral-900">
                        £{Math.round(active.total_estimated_spend)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                        <Route className="w-3 h-3" /> Total Walk
                      </span>
                      <span className="text-lg font-bold text-neutral-900">
                        {totalWalkMin} min
                      </span>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <span className="text-[10px] font-semibold text-neutral-500 uppercase tracking-widest flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Stops
                      </span>
                      <span className="text-lg font-bold text-neutral-900">
                        {active.stops.length}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why this plan */}
                {active.why_this_plan.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {active.why_this_plan.map((reason, i) => (
                      <p
                        key={i}
                        className="text-xs text-neutral-500 leading-relaxed"
                      >
                        {reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>

              {/* Timeline */}
              <div className="px-8 pb-20 flex flex-col relative">
                <div className="absolute left-[54px] top-6 bottom-12 w-px bg-neutral-200 z-0" />

                {active.stops.map((stop, index) => {
                  const isLast = index === active.stops.length - 1;
                  const label =
                    stopLabels[index] ?? `Stop ${index + 1}`;

                  return (
                    <div key={index}>
                      <div className="relative z-10 flex gap-5 group">
                        {/* Time column */}
                        <div className="flex flex-col items-end flex-none w-16 mt-0.5">
                          <span className="text-xs font-bold text-neutral-900 whitespace-nowrap">
                            Stop {stop.stop_order}
                          </span>
                          <span className="text-[10px] font-semibold text-neutral-400 mt-1">
                            ~£{stop.estimated_spend_gbp}
                          </span>
                        </div>

                        {/* Timeline dot */}
                        <div className="relative flex flex-col items-center mt-1.5 flex-none z-10">
                          <div className="w-3 h-3 rounded-full bg-neutral-900 border-2 border-white ring-1 ring-neutral-200 shadow-sm z-10" />
                        </div>

                        {/* Card */}
                        <div className="flex-1 bg-white border border-neutral-200 rounded-lg p-5 transition-all hover:border-neutral-400 hover:shadow-md mb-1 relative overflow-hidden group/card">
                          <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity cursor-grab bg-neutral-50 border-r border-neutral-100">
                            <GripVertical className="w-4 h-4 text-neutral-400" />
                          </div>

                          <div className="flex justify-between items-start mb-3 pl-2">
                            <div>
                              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-1.5 flex items-center gap-1.5">
                                <span className="w-4 h-4 rounded-full bg-neutral-100 flex items-center justify-center text-[9px] text-neutral-700">
                                  {index + 1}
                                </span>
                                {label}
                              </div>
                              <h4 className="text-lg font-bold text-neutral-900 tracking-tight leading-none mb-2">
                                {stop.venue.name}
                              </h4>
                              <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                                <span>{stop.venue.venue_type}</span>
                                <span className="text-neutral-300">
                                  &bull;
                                </span>
                                <span>{stop.venue.neighborhood}</span>
                                <span className="text-neutral-300">
                                  &bull;
                                </span>
                                <span className="text-neutral-900">
                                  ~£{stop.estimated_spend_gbp}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-1 opacity-0 group-hover/card:opacity-100 transition-opacity">
                              <button
                                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded bg-white hover:bg-neutral-100 border border-transparent hover:border-neutral-200 transition-all shadow-sm"
                                title="Swap"
                              >
                                <RefreshCcw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                className="p-1.5 text-neutral-400 hover:text-red-600 rounded bg-white hover:bg-red-50 border border-transparent hover:border-red-100 transition-all shadow-sm"
                                title="Remove"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-sm text-neutral-600 leading-relaxed pt-3 border-t border-neutral-100 ml-2">
                            {stop.explanation}
                          </p>

                          {stop.venue.vibe_tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3 ml-2">
                              {stop.venue.vibe_tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-semibold bg-neutral-100 text-neutral-600 px-1.5 py-0.5 rounded"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Travel connector */}
                      {!isLast &&
                        stop.estimated_travel_minutes_to_next != null && (
                          <div className="ml-[92px] my-3 flex items-center gap-3">
                            <div className="bg-neutral-50 border border-neutral-200/60 px-3 py-1.5 rounded text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2 z-10 shadow-sm">
                              <Navigation className="w-3 h-3 text-neutral-400" />
                              {Math.round(
                                stop.estimated_travel_minutes_to_next,
                              )}{" "}
                              min walk
                              <span className="text-neutral-300 font-normal normal-case">
                                ({stop.distance_to_next_km?.toFixed(1)}km)
                              </span>
                            </div>
                          </div>
                        )}
                    </div>
                  );
                })}
              </div>

              {/* New plan button */}
              <div className="p-4 border-t border-neutral-100 bg-white flex-none">
                <button
                  onClick={() => {
                    setResult(null);
                    setActiveIndex(0);
                  }}
                  className="w-full h-10 text-xs font-semibold rounded-md border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Plan a different night
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right side - map area */}
        <div className="flex-1 relative bg-[#EBEBEB] overflow-hidden flex items-center justify-center">
          {active ? (
            <div className="text-center">
              <p className="text-sm font-semibold text-neutral-600">
                {active.stops.length} stops across{" "}
                {new Set(active.stops.map((s) => s.venue.neighborhood)).size}{" "}
                area
                {new Set(active.stops.map((s) => s.venue.neighborhood)).size > 1
                  ? "s"
                  : ""}
              </p>
              <p className="mt-1 text-xs text-neutral-400">
                Route map coming soon
              </p>
            </div>
          ) : (
            <div className="text-center">
              <p className="text-sm text-neutral-400">
                Fill in the form to generate a plan
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
