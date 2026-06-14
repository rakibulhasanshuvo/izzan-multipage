"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ChartDataPoint {
  label: string; // e.g., "Mon"
  revenue: number;
  orders: number;
  dateStr: string; // e.g., "June 8"
}

interface OverviewChartProps {
  data: ChartDataPoint[];
}

export default function OverviewChart({ data }: OverviewChartProps) {
  const [activeTab, setActiveTab] = useState<"revenue" | "orders">("revenue");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Fallback data if no database records exist
  const hasData = data.some((d) => d.revenue > 0 || d.orders > 0);
  const chartData = hasData
    ? data
    : [
        { label: "Mon", revenue: 120, orders: 3, dateStr: "Projected" },
        { label: "Tue", revenue: 150, orders: 4, dateStr: "Projected" },
        { label: "Wed", revenue: 220, orders: 5, dateStr: "Projected" },
        { label: "Thu", revenue: 180, orders: 4, dateStr: "Projected" },
        { label: "Fri", revenue: 300, orders: 8, dateStr: "Projected" },
        { label: "Sat", revenue: 450, orders: 12, dateStr: "Projected" },
        { label: "Sun", revenue: 380, orders: 9, dateStr: "Projected" },
      ];

  const values = chartData.map((d) => (activeTab === "revenue" ? d.revenue : d.orders));
  const maxVal = Math.max(...values, 10); // Avoid division by zero, set minimum scale limit

  // SVG dimensions
  const svgWidth = 600;
  const svgHeight = 240;
  const paddingLeft = 50;
  const paddingRight = 30;
  const paddingTop = 40;
  const paddingBottom = 40;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  // Calculate coordinates
  const points = chartData.map((d, i) => {
    const val = activeTab === "revenue" ? d.revenue : d.orders;
    const x = paddingLeft + (i / (chartData.length - 1)) * chartWidth;
    const y = paddingTop + chartHeight - (val / maxVal) * chartHeight;
    return { x, y, val, label: d.label, dateStr: d.dateStr };
  });

  // Construct path strings
  const linePath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
    ""
  );

  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : "";

  // Helper for formatting y-axis values
  const formatYAxis = (val: number) => {
    if (activeTab === "revenue") {
      return `$${Math.round(val)}`;
    }
    return Math.round(val).toString();
  };

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col h-full justify-between">
      {/* Header with Tabs */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="font-serif text-[20px] md:text-[22px] text-zinc-900 dark:text-zinc-100 font-medium">
            Performance Trend
          </h3>
          <p className="text-[13px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            {!hasData ? "Displaying projected target projections" : "Recent boutique activity"}
          </p>
        </div>
        <div className="flex bg-zinc-100/80 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200/20 dark:border-zinc-700/30">
          <button
            onClick={() => setActiveTab("revenue")}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === "revenue"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Revenue
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-1.5 rounded-lg text-[13px] font-medium transition-all cursor-pointer ${
              activeTab === "orders"
                ? "bg-white dark:bg-zinc-900 text-zinc-950 dark:text-zinc-50 shadow-sm font-semibold"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
            }`}
          >
            Orders
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex-1 w-full min-h-[220px]">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-full select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            {/* Ambient Gradient Fill */}
            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-primary, #6366f1)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid Lines (Horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = paddingTop + chartHeight * ratio;
            return (
              <g key={ratio}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={svgWidth - paddingRight}
                  y2={y}
                  className="stroke-zinc-100 dark:stroke-zinc-800/60"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 10}
                  y={y + 4}
                  className="text-[10px] fill-zinc-400 dark:fill-zinc-500 font-mono text-right"
                  textAnchor="end"
                >
                  {formatYAxis(maxVal * (1 - ratio))}
                </text>
              </g>
            );
          })}

          {/* Dotted target projection background line (when there is no data) */}
          {!hasData && (
            <path
              d={points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y + 10}` : `L ${p.x} ${p.y + 10}`)).join(" ")}
              className="fill-none stroke-zinc-300 dark:stroke-zinc-700"
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
          )}

          {/* Main Chart Path Area */}
          <AnimatePresence mode="popLayout">
            <motion.path
              key={`${activeTab}-area`}
              initial={{ opacity: 0, d: areaPath }}
              animate={{ opacity: 1, d: areaPath }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              fill="url(#chart-gradient)"
            />
          </AnimatePresence>

          {/* Main Chart Path Stroke Line */}
          <AnimatePresence mode="popLayout">
            <motion.path
              key={`${activeTab}-line`}
              initial={{ pathLength: 0, opacity: 0, d: linePath }}
              animate={{ pathLength: 1, opacity: 1, d: linePath }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="fill-none stroke-primary dark:stroke-primary"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </AnimatePresence>

          {/* Invisible interactive hover bars */}
          {points.map((p, i) => {
            const barWidth = chartWidth / (points.length - 1);
            return (
              <rect
                key={i}
                x={p.x - barWidth / 2}
                y={paddingTop}
                width={barWidth}
                height={chartHeight}
                className="fill-transparent cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
              />
            );
          })}

          {/* Active Data Points / Glow Rings */}
          {points.map((p, i) => {
            const isHovered = hoveredIndex === i;
            return (
              <g key={i} className="pointer-events-none">
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? 6 : 4}
                  className={`transition-all duration-300 ${
                    isHovered
                      ? "fill-primary stroke-white dark:stroke-zinc-900 stroke-2"
                      : "fill-white dark:fill-zinc-900 stroke-primary stroke-2"
                  }`}
                />
                {isHovered && (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={12}
                    className="fill-primary/20 animate-ping"
                  />
                )}
              </g>
            );
          })}

          {/* X Axis Labels */}
          {points.map((p, i) => (
            <text
              key={i}
              x={p.x}
              y={svgHeight - 10}
              className={`text-[11px] font-medium transition-colors text-center ${
                hoveredIndex === i
                  ? "fill-zinc-900 dark:fill-zinc-50 font-semibold"
                  : "fill-zinc-400 dark:fill-zinc-500"
              }`}
              textAnchor="middle"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip Overlay */}
        <AnimatePresence>
          {hoveredIndex !== null && points[hoveredIndex] && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.15 }}
              className="absolute bg-zinc-900/95 dark:bg-white/95 text-white dark:text-zinc-900 px-3.5 py-2 rounded-xl text-[12px] font-medium shadow-xl border border-zinc-800 dark:border-zinc-200 pointer-events-none z-30"
              style={{
                left: `${(points[hoveredIndex].x / svgWidth) * 100}%`,
                top: `${(points[hoveredIndex].y / svgHeight) * 100 - 25}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="text-[10px] text-zinc-400 dark:text-zinc-500 tracking-wider uppercase">
                {points[hoveredIndex].dateStr}
              </div>
              <div className="text-[14px] font-bold mt-0.5 font-mono">
                {activeTab === "revenue"
                  ? `$${points[hoveredIndex].val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : `${points[hoveredIndex].val} order${points[hoveredIndex].val === 1 ? "" : "s"}`}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
