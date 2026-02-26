import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:justify-end sm:px-6 pointer-events-none">
      <div className="flex flex-col gap-3 w-full max-w-sm pointer-events-auto">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl border px-4 py-3 shadow-lg bg-slate-900/95 backdrop-blur-sm flex items-start gap-3 ${
              toast.type === 'error'
                ? 'border-red-500/60'
                : toast.type === 'success'
                ? 'border-emerald-500/60'
                : 'border-slate-700/70'
            }`}
          >
            <div
              className={`mt-1 h-2 w-2 rounded-full ${
                toast.type === 'error'
                  ? 'bg-red-500'
                  : toast.type === 'success'
                  ? 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            <div className="flex-1">
              {toast.title && (
                <p className="text-sm font-semibold text-slate-50">
                  {toast.title}
                </p>
              )}
              {toast.message && (
                <p className="mt-0.5 text-xs text-slate-300">
                  {toast.message}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="ml-2 text-slate-400 hover:text-slate-100"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

