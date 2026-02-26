import React from 'react';

export default function ProgressBar({ raised, goal }) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  const pct = g > 0 ? Math.min(100, Math.round((r / g) * 100)) : 0;

  return (
    <div className="space-y-1">
      <div className="relative h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>
          <span className="font-semibold text-slate-100">{r}</span> / {g} XLM
        </span>
        <span>{pct}% funded</span>
      </div>
    </div>
  );
}

