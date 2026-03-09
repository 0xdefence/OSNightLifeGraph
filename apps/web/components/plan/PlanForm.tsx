"use client";

import { useState } from "react";

interface PlanFormProps {
  onGenerate: (params: {
    query?: string;
    area?: string;
    budget_total?: number;
    party_size?: number;
    start_time: string;
    desired_stops?: string[];
    preferences?: {
      vibes?: string[];
      good_for_date?: boolean;
      good_for_group?: boolean;
    };
  }) => void;
  isLoading?: boolean;
}

export function PlanForm({ onGenerate, isLoading }: PlanFormProps) {
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");
  const [budget, setBudget] = useState("");
  const [partySize, setPartySize] = useState("");
  const [startTime, setStartTime] = useState("19:00");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onGenerate({
      query: query || undefined,
      area: area || undefined,
      budget_total: budget ? Number(budget) : undefined,
      party_size: partySize ? Number(partySize) : undefined,
      start_time: new Date(`2026-03-14T${startTime}:00`).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs font-medium text-gray-500">
          Describe your night
        </label>
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Dinner then cocktails in Shoreditch, £80 budget"
          rows={2}
          className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Area (optional)
          </label>
          <input
            type="text"
            value={area}
            onChange={(e) => setArea(e.target.value)}
            placeholder="e.g. Shoreditch"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Budget (optional)
          </label>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="£ total"
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Party size
          </label>
          <input
            type="number"
            value={partySize}
            onChange={(e) => setPartySize(e.target.value)}
            placeholder="2"
            min={1}
            max={20}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Start time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-lg bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
      >
        {isLoading ? "Planning..." : "Generate plan"}
      </button>
    </form>
  );
}
