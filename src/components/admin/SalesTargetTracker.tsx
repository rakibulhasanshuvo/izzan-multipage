"use client";

import React from "react";
import { motion } from "framer-motion";

interface SalesTargetTrackerProps {
  currentSales: number;
  target?: number;
}

export default function SalesTargetTracker({ currentSales, target = 1000 }: SalesTargetTrackerProps) {
  const percentage = Math.min(Math.round((currentSales / target) * 100), 100);

  // SVG parameters for the circular ring
  const radius = 50;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-3xl rounded-3xl p-6 md:p-8 border border-white dark:border-zinc-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex flex-col justify-between h-full relative overflow-hidden group">
      {/* Background glow sphere */}
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-500"></div>

      <div>
        <h3 className="font-serif text-[20px] md:text-[22px] text-zinc-900 dark:text-zinc-100 font-medium border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-6">
          Sales Target Progress
        </h3>

        {/* Circular Progress & Metrics */}
        <div className="flex flex-col sm:flex-row items-center gap-8 justify-center py-2">
          {/* Circular Progress Ring */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="progress-gradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--color-primary-light, #818cf8)" />
                  <stop offset="100%" stopColor="var(--color-primary, #6366f1)" />
                </linearGradient>
              </defs>
              {/* Background Circle */}
              <circle
                cx="60"
                cy="60"
                r={radius}
                className="stroke-zinc-100 dark:stroke-zinc-800/80 fill-transparent"
                strokeWidth={strokeWidth}
              />
              {/* Animated Progress Circle */}
              <motion.circle
                cx="60"
                cy="60"
                r={radius}
                className="fill-transparent"
                stroke="url(#progress-gradient)"
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            {/* Centered Percentage Text */}
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[26px] font-bold text-zinc-900 dark:text-zinc-100 leading-none tracking-tight">
                {percentage}%
              </span>
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-semibold mt-1">
                Complete
              </span>
            </div>
          </div>

          {/* Metrics Column */}
          <div className="space-y-4 flex-1 min-w-[150px]">
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Current Sales
              </span>
              <span className="text-[22px] font-bold text-zinc-800 dark:text-zinc-100 font-mono">
                ${currentSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
                Monthly Target
              </span>
              <span className="text-[15px] font-medium text-zinc-500 dark:text-zinc-400 font-mono">
                ${target.toLocaleString(undefined, { minimumFractionDigits: 0 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Progress Bar / Tip Footer */}
      <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4 mt-6">
        <div className="flex justify-between items-center text-[12px] text-zinc-500 dark:text-zinc-400">
          <span>Daily Run Rate Target</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200 font-mono">
            ${Math.round(target / 30)} / day
          </span>
        </div>
      </div>
    </div>
  );
}
