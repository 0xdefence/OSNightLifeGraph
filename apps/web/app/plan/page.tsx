"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { generatePlan } from "@/lib/api";
import { PlanForm } from "@/components/plan/PlanForm";
import { PlanResult } from "@/components/plan/PlanResult";
import type { PlanResponse } from "@/lib/types";
import Link from "next/link";

export default function PlanPage() {
  const [result, setResult] = useState<PlanResponse | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const mutation = useMutation({
    mutationFn: generatePlan,
    onSuccess: (data) => {
      setResult(data);
      setActiveIndex(0);
    },
  });

  return (
    <div className="flex h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-100 bg-white px-4 py-3">
        <h1 className="text-lg font-bold text-gray-900">DarkKnight</h1>
        <Link
          href="/"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Explore
        </Link>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: form + results */}
        <div className="w-[420px] shrink-0 overflow-auto border-r border-gray-100 bg-white p-4">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Plan your night
          </h2>
          <PlanForm
            onGenerate={(params) => mutation.mutate(params)}
            isLoading={mutation.isPending}
          />

          {mutation.isError && (
            <p className="mt-3 text-sm text-red-600">
              Something went wrong. Try again.
            </p>
          )}

          {result && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Your plan
              </h3>
              <PlanResult
                best={result.best_itinerary}
                alternatives={result.alternatives}
                onSelectAlternative={setActiveIndex}
                activeIndex={activeIndex}
              />
            </div>
          )}
        </div>

        {/* Right: map placeholder for plan stops */}
        <div className="flex flex-1 items-center justify-center bg-gray-50">
          {result ? (
            <div className="text-center">
              <p className="text-sm text-gray-500">
                {(result.best_itinerary?.stops ?? []).length > 0
                  ? `${result.best_itinerary.stops.length} stops planned`
                  : "No stops"}
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Map view coming in next iteration
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              Fill in the form to generate a plan
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
