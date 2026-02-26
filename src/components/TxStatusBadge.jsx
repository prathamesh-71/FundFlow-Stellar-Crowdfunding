import React from 'react';

export default function TxStatusBadge({ status }) {
  const base =
    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium';

  if (status === 'success') {
    return (
      <span className={`${base} bg-emerald-500/10 text-emerald-400`}>
        ● Success
      </span>
    );
  }
  if (status === 'failed') {
    return (
      <span className={`${base} bg-red-500/10 text-red-400`}>● Failed</span>
    );
  }
  return (
    <span className={`${base} bg-slate-700/50 text-slate-200`}>
      ● Pending
    </span>
  );
}

