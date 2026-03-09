"use client";

import { Suspense, useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { fetchVenueGraph, fetchVenues } from "@/lib/api";
import type { GraphNode, GraphEdge } from "@/lib/types";
import {
  MapPin,
  Music,
  Utensils,
  Sparkles,
  Calendar,
  Building2,
  Star,
  ArrowLeft,
  ArrowUpRight,
  Network,
  ZoomIn,
  Search,
} from "lucide-react";

type NodeType =
  | "venue"
  | "neighborhood"
  | "vibe_tag"
  | "cuisine"
  | "music_genre"
  | "event"
  | "similar";

const nodeConfig: Record<
  string,
  { icon: React.ElementType; classes: string }
> = {
  venue: {
    icon: Star,
    classes:
      "w-16 h-16 bg-neutral-900 text-white border-4 border-white shadow-md ring-1 ring-black/10",
  },
  neighborhood: {
    icon: MapPin,
    classes: "w-11 h-11 bg-stone-100 text-stone-600 border border-stone-200",
  },
  vibe_tag: {
    icon: Sparkles,
    classes: "w-11 h-11 bg-purple-50 text-purple-600 border border-purple-200",
  },
  music_genre: {
    icon: Music,
    classes: "w-11 h-11 bg-blue-50 text-blue-600 border border-blue-200",
  },
  cuisine: {
    icon: Utensils,
    classes: "w-11 h-11 bg-orange-50 text-orange-600 border border-orange-200",
  },
  event: {
    icon: Calendar,
    classes:
      "w-11 h-11 bg-emerald-50 text-emerald-600 border border-emerald-200",
  },
  similar: {
    icon: Building2,
    classes:
      "w-12 h-12 bg-white text-neutral-800 border-2 border-neutral-200 shadow-sm",
  },
};

function layoutPositions(
  nodes: GraphNode[],
): { node: GraphNode; x: number; y: number }[] {
  const center = nodes.find((n) => n.type === "venue");
  if (!center) return nodes.map((n, i) => ({ node: n, x: 50, y: 50 }));

  const others = nodes.filter((n) => n.id !== center.id);
  const positioned: { node: GraphNode; x: number; y: number }[] = [
    { node: center, x: 50, y: 50 },
  ];

  const radius = 32;
  others.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
    positioned.push({
      node,
      x: 50 + radius * Math.cos(angle),
      y: 50 + radius * Math.sin(angle),
    });
  });

  return positioned;
}

export default function GraphPage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center"><p className="text-sm text-neutral-400">Loading...</p></div>}>
      <GraphPageInner />
    </Suspense>
  );
}

function GraphPageInner() {
  const searchParams = useSearchParams();
  const initialSlug = searchParams.get("venue") || "";
  const [venueSlug, setVenueSlug] = useState(initialSlug);
  const [searchInput, setSearchInput] = useState(initialSlug);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Fetch venue list for search
  const { data: venueList } = useQuery({
    queryKey: ["venues", { limit: "200" }],
    queryFn: () => fetchVenues({ limit: "200" }),
  });

  // Fetch graph data
  const { data: graphData, isLoading } = useQuery({
    queryKey: ["graph", venueSlug],
    queryFn: () => fetchVenueGraph(venueSlug),
    enabled: !!venueSlug,
  });

  const positioned = useMemo(
    () => (graphData ? layoutPositions(graphData.nodes) : []),
    [graphData],
  );

  const posMap = useMemo(
    () => new Map(positioned.map((p) => [p.node.id, p])),
    [positioned],
  );

  const edges = graphData?.edges ?? [];

  const connectedIds = useMemo(() => {
    if (!selectedNode) return new Set<string>();
    const ids = new Set<string>();
    edges.forEach((e) => {
      if (e.source === selectedNode) ids.add(e.target);
      if (e.target === selectedNode) ids.add(e.source);
    });
    return ids;
  }, [selectedNode, edges]);

  const selectedNodeData = selectedNode
    ? graphData?.nodes.find((n) => n.id === selectedNode)
    : null;
  const connectedNodes = graphData?.nodes.filter((n) =>
    connectedIds.has(n.id),
  ) ?? [];

  const nodesByType = useMemo(() => {
    const groups: Record<string, GraphNode[]> = {};
    (graphData?.nodes ?? []).forEach((n) => {
      if (!groups[n.type]) groups[n.type] = [];
      groups[n.type].push(n);
    });
    return groups;
  }, [graphData]);

  return (
    <div className="flex w-full h-full bg-white overflow-hidden">
      {/* Left: Graph canvas */}
      <div className="flex-1 relative border-r border-neutral-200 flex flex-col bg-[#FDFDFD]">
        {/* Venue selector */}
        <div className="absolute top-5 left-5 z-20 flex gap-3 items-center">
          <div className="bg-white/90 backdrop-blur-sm border border-neutral-200 rounded-lg p-1 shadow-sm flex gap-1 items-center">
            <Search className="w-3.5 h-3.5 text-neutral-400 ml-2" />
            <select
              value={venueSlug}
              onChange={(e) => {
                setVenueSlug(e.target.value);
                setSelectedNode(null);
              }}
              className="px-2 py-1.5 text-xs font-semibold bg-transparent outline-none text-neutral-900 min-w-[180px]"
            >
              <option value="">Select venue...</option>
              {(venueList?.items ?? []).map((v) => (
                <option key={v.slug} value={v.slug}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>

          {selectedNode && (
            <button
              onClick={() => setSelectedNode(null)}
              className="bg-white/90 backdrop-blur-sm border border-neutral-200 shadow-sm px-3 py-1.5 rounded-lg text-xs font-semibold text-neutral-600 hover:text-neutral-900 hover:bg-white flex items-center gap-1.5 transition-colors"
            >
              <ZoomIn className="w-3.5 h-3.5" />
              Reset Focus
            </button>
          )}
        </div>

        {/* Dot grid background */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(#d4d4d4_1px,transparent_1px)] [background-size:24px_24px]" />
        </div>

        {!venueSlug ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Network className="w-8 h-8 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-neutral-600">
                Select a venue to explore its graph
              </p>
              <p className="text-xs text-neutral-400 mt-1">
                Use the dropdown above or navigate from Explore
              </p>
            </div>
          </div>
        ) : isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-neutral-400">Loading graph...</p>
          </div>
        ) : (
          <>
            {/* SVG Edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
              {edges.map((edge, i) => {
                const src = posMap.get(edge.source);
                const tgt = posMap.get(edge.target);
                if (!src || !tgt) return null;

                const isSelectedEdge =
                  selectedNode &&
                  (edge.source === selectedNode ||
                    edge.target === selectedNode);
                const isMuted = selectedNode && !isSelectedEdge;

                return (
                  <line
                    key={i}
                    x1={`${src.x}%`}
                    y1={`${src.y}%`}
                    x2={`${tgt.x}%`}
                    y2={`${tgt.y}%`}
                    className={`transition-all duration-500 ease-out ${
                      isMuted
                        ? "stroke-neutral-200 opacity-20 stroke-1"
                        : isSelectedEdge
                          ? "stroke-neutral-900 stroke-[2] opacity-60"
                          : "stroke-neutral-300 stroke-[1.5] opacity-80"
                    }`}
                  />
                );
              })}
            </svg>

            {/* HTML Nodes */}
            {positioned.map(({ node, x, y }) => {
              const isSelected = node.id === selectedNode;
              const isConnected =
                selectedNode && connectedIds.has(node.id);
              const isMuted =
                selectedNode && !isSelected && !isConnected;

              const config = nodeConfig[node.type] ?? nodeConfig.venue;
              const Icon = config.icon;

              return (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2 cursor-pointer group z-10 transition-all duration-500 ease-out ${
                    isMuted
                      ? "opacity-30 grayscale-[60%] scale-95"
                      : "opacity-100"
                  } ${isSelected ? "z-30" : "hover:z-20"}`}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  onClick={() =>
                    setSelectedNode(isSelected ? null : node.id)
                  }
                >
                  <div
                    className={`rounded-full flex items-center justify-center transition-all duration-300 ${config.classes} ${
                      isSelected
                        ? "ring-4 ring-neutral-900/20 ring-offset-2 scale-110 shadow-xl"
                        : isConnected
                          ? "ring-2 ring-neutral-400 ring-offset-1 shadow-md scale-105"
                          : "hover:scale-105 hover:shadow-md"
                    }`}
                  >
                    <Icon
                      className={
                        node.type === "venue" ? "w-6 h-6" : "w-4 h-4"
                      }
                    />
                  </div>

                  <span
                    className={`text-[11px] px-2 py-0.5 rounded backdrop-blur-md transition-all duration-300 ${
                      isSelected
                        ? "font-bold text-white bg-neutral-900 shadow-md scale-110"
                        : isConnected
                          ? "font-bold text-neutral-900 bg-white/90 shadow-sm border border-neutral-200/60"
                          : "font-semibold text-neutral-600 bg-white/70 border border-white/20 group-hover:text-neutral-900 group-hover:bg-white group-hover:border-neutral-200 group-hover:shadow-sm"
                    }`}
                  >
                    {node.label.length > 20
                      ? node.label.slice(0, 18) + "..."
                      : node.label}
                  </span>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Right: Sidebar */}
      <div className="w-[340px] flex-none bg-white flex flex-col relative z-20 shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
        {selectedNodeData ? (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b border-neutral-100 flex items-center gap-3 bg-[#FAFAFA]/50">
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1.5 hover:bg-white hover:shadow-sm border border-transparent hover:border-neutral-200 rounded-md text-neutral-500 transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Node Details
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 shadow-sm ${
                  (nodeConfig[selectedNodeData.type] ?? nodeConfig.venue)
                    .classes
                }`}
              >
                {(() => {
                  const Icon = (
                    nodeConfig[selectedNodeData.type] ?? nodeConfig.venue
                  ).icon;
                  return <Icon className="w-5 h-5" />;
                })()}
              </div>

              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5">
                {selectedNodeData.type.replace("_", " ")}
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 tracking-tight leading-none mb-3">
                {selectedNodeData.label}
              </h2>

              <h3 className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2 mt-8">
                <Network className="w-3.5 h-3.5" />
                Connected Entities ({connectedNodes.length})
              </h3>

              <div className="space-y-2">
                {connectedNodes.map((cn) => {
                  const cnConfig =
                    nodeConfig[cn.type] ?? nodeConfig.venue;
                  const CnIcon = cnConfig.icon;
                  return (
                    <button
                      key={cn.id}
                      onClick={() => setSelectedNode(cn.id)}
                      className="w-full text-left p-3 rounded-xl border border-neutral-200/60 bg-white hover:border-neutral-300 hover:shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center ${cnConfig.classes} border-none shadow-none ring-0`}
                        >
                          <CnIcon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-neutral-900 leading-tight">
                            {cn.label}
                          </span>
                          <span className="text-[10px] font-medium text-neutral-400 capitalize">
                            {cn.type.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-neutral-300 group-hover:text-neutral-900 transition-colors" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <div className="p-6 border-b border-neutral-100 bg-[#FAFAFA]/50">
              <h2 className="text-lg font-bold text-neutral-900 tracking-tight mb-1">
                Graph Explorer
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                Click any node to explore its connections and properties.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              {/* Legend */}
              <div>
                <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-4">
                  Node Legend
                </h3>
                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                  {Object.entries(nodeConfig).map(([type, config]) => {
                    const Icon = config.icon;
                    return (
                      <div key={type} className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center ${config.classes} border-none shadow-none ring-0`}
                        >
                          <Icon className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-semibold text-neutral-600 capitalize">
                          {type.replace("_", " ")}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <hr className="border-neutral-100" />

              {/* Entity list */}
              {graphData && (
                <div>
                  <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-5">
                    Graph Entities
                  </h3>
                  <div className="space-y-6">
                    {Object.entries(nodesByType).map(([type, typeNodes]) => {
                      if (type === "venue") return null;
                      return (
                        <div key={type}>
                          <h4 className="text-[11px] font-bold text-neutral-400 capitalize mb-2.5">
                            {type.replace("_", " ")}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {typeNodes.map((n) => (
                              <button
                                key={n.id}
                                onClick={() => setSelectedNode(n.id)}
                                className="px-2.5 py-1 bg-white border border-neutral-200/80 rounded-md text-xs font-semibold text-neutral-600 hover:border-neutral-400 hover:text-neutral-900 hover:shadow-sm transition-all"
                              >
                                {n.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
