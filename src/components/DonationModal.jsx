import React, { useState } from 'react';

export default function DonationModal({
  open,
  onClose,
  onConfirm,
  loading
}) {
  const [amount, setAmount] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    const v = parseFloat(amount);
    if (!Number.isFinite(v) || v <= 0) return;
    onConfirm(v);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-800 bg-slate-900 p-5 shadow-xl">
        <h2 className="text-sm font-semibold text-slate-50">
          Donate to Campaign
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter the amount of XLM you want to contribute.
        </p>
        <div className="mt-4">
          <label className="text-xs font-medium text-slate-300">
            Amount (XLM)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="10"
          />
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-700 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleConfirm}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Processing…' : 'Donate'}
          </button>
        </div>
      </div>
    </div>
  );
}

