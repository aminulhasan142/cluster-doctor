"use client";

import { useState, useRef, useEffect } from "react";
import type { ClusterNode } from "@/types";

export interface NodeScreenPoint {
  node: ClusterNode;
  screenPos: { x: number; y: number } | null;
  riskScore: number;
  predictedTemp: number;
  predictedCpu: number;
}

interface HolographicHudOverlayProps {
  nodePoints: NodeScreenPoint[];
  selectedNodeId: number | null;
  onSelectNode: (nodeId: number) => void;
  hoveredNodeId: number | null;
  onHoverNode: (nodeId: number | null) => void;
  containerRect?: { width: number; height: number } | null;
}

function getRiskBadgeColor(score: number): { text: string; bg: string; border: string } {
  if (score > 70) {
    return {
      text: "text-rose-400",
      bg: "bg-rose-500/15",
      border: "border-rose-500/40",
    };
  }
  if (score > 30) {
    return {
      text: "text-amber-400",
      bg: "bg-amber-500/15",
      border: "border-amber-500/40",
    };
  }
  return {
    text: "text-emerald-400",
    bg: "bg-emerald-500/15",
    border: "border-emerald-500/40",
  };
}

function GhostCard({
  item,
  isHovered,
  isCritical,
  onMouseEnter,
  onMouseLeave,
  onClick,
}: {
  item: NodeScreenPoint;
  isHovered: boolean;
  isCritical: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClick: () => void;
}) {
  const badgeStyle = getRiskBadgeColor(item.riskScore);

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      className={`cursor-pointer rounded-xl border p-2.5 shadow-2xl backdrop-blur-xl transition-all duration-200 w-full max-w-[240px] ${
        isHovered
          ? "border-cyan-400/90 bg-black/90 scale-102 ring-2 ring-cyan-400/30"
          : isCritical
            ? "border-rose-500/60 bg-black/80 hover:border-rose-400"
            : "border-white/10 bg-black/75 hover:border-white/20"
      }`}
    >
      {/* Top Line: Short Hostname & Risk Badge */}
      <div className="flex items-center justify-between gap-1.5">
        <span className="font-mono text-xs font-bold uppercase tracking-wide text-foreground truncate">
          {item.node.hostname.replace("gpu-node-", "")}
        </span>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border ${badgeStyle.text} ${badgeStyle.bg} ${badgeStyle.border}`}
        >
          {item.riskScore}% Risk
        </span>
      </div>

      {/* Concise 2-Column Metric Grid */}
      <div className="mt-2 grid grid-cols-2 gap-1.5 font-mono text-xs">
        <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-1">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold">Temp</p>
          <p className={`font-semibold text-xs mt-0.5 ${getRiskBadgeColor(item.predictedTemp > 85 ? 80 : 20).text}`}>
            {item.predictedTemp.toFixed(1)}°C
          </p>
        </div>
        <div className="rounded-lg border border-white/5 bg-white/5 px-2 py-1">
          <p className="text-[9px] text-muted-foreground uppercase font-semibold">CPU</p>
          <p className={`font-semibold text-xs mt-0.5 ${getRiskBadgeColor(item.predictedCpu > 85 ? 80 : 20).text}`}>
            {item.predictedCpu.toFixed(0)}%
          </p>
        </div>
      </div>
    </div>
  );
}

export function HolographicHudOverlay({
  nodePoints,
  selectedNodeId,
  onSelectNode,
  hoveredNodeId,
  onHoverNode,
  containerRect,
}: HolographicHudOverlayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const [cardPositions, setCardPositions] = useState<Record<number, { x: number; y: number }>>({});

  const activeNodes = nodePoints
    .filter((np) => np.screenPos !== null)
    .sort((a, b) => b.riskScore - a.riskScore);

  const visibleNodes = isExpanded ? activeNodes : activeNodes.slice(0, 4);
  const hiddenCount = Math.max(0, activeNodes.length - 4);

  // Measure 2D card left-edge anchor coordinates relative to SVG overlay
  useEffect(() => {
    const updated: Record<number, { x: number; y: number }> = {};
    let hasChange = false;

    for (const item of visibleNodes) {
      const el = cardRefs.current[item.node.id];
      if (el) {
        const rect = el.getBoundingClientRect();
        const parentRect = el.offsetParent?.getBoundingClientRect();

        if (parentRect) {
          const x = rect.left - parentRect.left;
          const y = rect.top - parentRect.top + rect.height / 2;
          updated[item.node.id] = { x, y };

          const current = cardPositions[item.node.id];
          if (!current || Math.abs(current.x - x) > 1.5 || Math.abs(current.y - y) > 1.5) {
            hasChange = true;
          }
        }
      }
    }

    if (hasChange || Object.keys(cardPositions).length !== Object.keys(updated).length) {
      setCardPositions(updated);
    }
  }, [visibleNodes, containerRect]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* SVG Layer for Leader Lines */}
      <svg className="absolute inset-0 size-full z-10">
        <defs>
          <linearGradient id="lineGlowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.3" />
          </linearGradient>

          <linearGradient id="lineGlowRed" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.4" />
          </linearGradient>

          <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {visibleNodes.map((item) => {
          if (!item.screenPos) return null;
          const { x: nodeX, y: nodeY } = item.screenPos;
          const cardPos = cardPositions[item.node.id];
          if (!cardPos) return null;

          const { x: cardX, y: cardY } = cardPos;

          const isCritical = item.riskScore > 70;
          const isHovered = hoveredNodeId === item.node.id || selectedNodeId === item.node.id;

          const strokeColor = isCritical ? "url(#lineGlowRed)" : "url(#lineGlowCyan)";
          const strokeWidth = isHovered ? 2.2 : 1.2;

          const midX = (nodeX + cardX) / 2;

          return (
            <g key={`leader-line-${item.node.id}`} filter="url(#glowEffect)">
              {/* Anchor Dot at 3D Node Center */}
              <circle
                cx={nodeX}
                cy={nodeY}
                r={isHovered ? 4.5 : 3}
                className={isCritical ? "fill-rose-500 animate-ping" : "fill-cyan-400"}
              />
              <circle
                cx={nodeX}
                cy={nodeY}
                r={isHovered ? 3 : 2}
                className={isCritical ? "fill-rose-400" : "fill-cyan-300"}
              />

              {/* Curved Dogleg Leader Line */}
              <path
                d={`M ${nodeX} ${nodeY} C ${midX} ${nodeY}, ${midX} ${cardY}, ${cardX} ${cardY}`}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeDasharray={isCritical ? "4,4" : undefined}
                className="transition-all duration-200"
              />

              {/* Left Edge Anchor Dot on Card */}
              <circle cx={cardX} cy={cardY} r={3} className={isCritical ? "fill-rose-400" : "fill-cyan-400"} />
            </g>
          );
        })}
      </svg>

      {/* Right Perimeter HUD Cards Container */}
      <div className="pointer-events-auto absolute top-16 right-4 bottom-16 z-20 flex flex-col gap-3 w-64 max-w-[240px] overflow-y-auto pr-1">
        {visibleNodes.map((item) => {
          const isHovered = hoveredNodeId === item.node.id || selectedNodeId === item.node.id;
          const isCritical = item.riskScore > 70;

          return (
            <div
              key={`hud-wrapper-${item.node.id}`}
              ref={(el) => {
                cardRefs.current[item.node.id] = el;
              }}
            >
              <GhostCard
                item={item}
                isHovered={isHovered}
                isCritical={isCritical}
                onMouseEnter={() => onHoverNode(item.node.id)}
                onMouseLeave={() => onHoverNode(null)}
                onClick={() => onSelectNode(item.node.id)}
              />
            </div>
          );
        })}

        {/* Collapsible / Expandable Anomaly Chip */}
        {hiddenCount > 0 && !isExpanded && (
          <button
            onClick={() => setIsExpanded(true)}
            className="cursor-pointer rounded-xl border border-sky-500/40 bg-sky-950/80 p-2 text-center text-xs font-mono font-semibold text-sky-300 shadow-xl backdrop-blur-md hover:bg-sky-900/90 transition-all"
          >
            +{hiddenCount} more anomalies (Expand)
          </button>
        )}

        {isExpanded && activeNodes.length > 4 && (
          <button
            onClick={() => setIsExpanded(false)}
            className="cursor-pointer rounded-xl border border-white/10 bg-black/80 p-1.5 text-center text-xs font-mono text-muted-foreground shadow-xl backdrop-blur-md hover:text-foreground transition-all"
          >
            Collapse
          </button>
        )}
      </div>
    </div>
  );
}
