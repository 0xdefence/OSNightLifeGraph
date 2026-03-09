"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchVenueGraph } from "@/lib/api";
import type { GraphNode, GraphEdge } from "@/lib/types";

const NODE_COLORS: Record<string, string> = {
  venue: "#111827",
  neighborhood: "#2563eb",
  vibe_tag: "#7c3aed",
  cuisine: "#0891b2",
  music_genre: "#c026d3",
  event: "#ea580c",
  similar: "#059669",
};

const EDGE_COLORS: Record<string, string> = {
  located_in: "#93c5fd",
  has_vibe: "#c4b5fd",
  serves_cuisine: "#a5f3fc",
  plays_genre: "#f0abfc",
  hosts_event: "#fed7aa",
  similar_to: "#6ee7b7",
};

interface VenueGraphProps {
  slug: string;
}

function layoutNodes(nodes: GraphNode[], edges: GraphEdge[]) {
  const center = nodes.find((n) => n.type === "venue");
  if (!center) return [];

  const others = nodes.filter((n) => n.id !== center.id);
  const cx = 200;
  const cy = 200;
  const radius = 140;

  const positioned: { node: GraphNode; x: number; y: number }[] = [
    { node: center, x: cx, y: cy },
  ];

  others.forEach((node, i) => {
    const angle = (2 * Math.PI * i) / others.length - Math.PI / 2;
    positioned.push({
      node,
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    });
  });

  return positioned;
}

export function VenueGraph({ slug }: VenueGraphProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["graph", slug],
    queryFn: () => fetchVenueGraph(slug),
  });

  if (isLoading) {
    return <div className="text-sm text-gray-400">Loading graph...</div>;
  }

  if (!data || data.nodes.length === 0) {
    return <div className="text-sm text-gray-400">No graph data.</div>;
  }

  const positioned = layoutNodes(data.nodes, data.edges);
  const posMap = new Map(positioned.map((p) => [p.node.id, p]));

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full">
      {/* Edges */}
      {data.edges.map((edge, i) => {
        const src = posMap.get(edge.source);
        const tgt = posMap.get(edge.target);
        if (!src || !tgt) return null;
        return (
          <line
            key={i}
            x1={src.x}
            y1={src.y}
            x2={tgt.x}
            y2={tgt.y}
            stroke={EDGE_COLORS[edge.type] ?? "#e5e7eb"}
            strokeWidth={1.5}
            strokeOpacity={0.6}
          />
        );
      })}
      {/* Nodes */}
      {positioned.map(({ node, x, y }) => {
        const isCenter = node.type === "venue";
        const r = isCenter ? 24 : 16;
        return (
          <g key={node.id}>
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={NODE_COLORS[node.type] ?? "#6b7280"}
              opacity={0.9}
            />
            <text
              x={x}
              y={y + r + 12}
              textAnchor="middle"
              className="fill-gray-700 text-[9px]"
            >
              {node.label.length > 18
                ? node.label.slice(0, 16) + "..."
                : node.label}
            </text>
            <text
              x={x}
              y={y + r + 22}
              textAnchor="middle"
              className="fill-gray-400 text-[7px]"
            >
              {node.type.replace("_", " ")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
