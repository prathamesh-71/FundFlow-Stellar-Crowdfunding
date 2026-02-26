import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App.jsx';
import TxStatusBadge from '../components/TxStatusBadge.jsx';

export default function Transactions() {
  const { transactions } = useContext(AppContext);
  const [filter, setFilter] = useState('all');

  const filtered = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter((t) => t.status === filter);
  }, [transactions, filter]);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Transactions
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            On-chain actions initiated from FundFlow. Stored locally for
            your convenience.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Filter label="All" value="all" current={filter} set={setFilter} />
          <Filter
            label="Pending"
            value="pending"
            current={filter}
            set={setFilter}
          />
          <Filter
            label="Success"
            value="success"
            current={filter}
            set={setFilter}
          />
          <Filter
            label="Failed"
            value="failed"
            current={filter}
            set={setFilter}
          />
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
        <div className="hidden grid-cols-[1.3fr,1fr,1.4fr,1fr] border-b border-slate-800 bg-slate-950/70 px-4 py-2 text-[11px] font-medium text-slate-400 sm:grid">
          <div>Action</div>
          <div>Status</div>
          <div>Transaction</div>
          <div className="text-right">Time</div>
        </div>
        <div className="divide-y divide-slate-800">
          {filtered.length === 0 ? (
            <p className="px-4 py-4 text-xs text-slate-400">
              No transactions yet.
            </p>
          ) : (
            filtered.map((tx) => <TxRow key={tx.hash} tx={tx} />)
          )}
        </div>
      </div>
    </div>
  );
}

function Filter({ label, value, current, set }) {
  const active = current === value;
  return (
    <button
      type="button"
      onClick={() => set(value)}
      className={`rounded-full px-3 py-1 text-xs font-medium ${
        active
          ? 'bg-slate-100 text-slate-900'
          : 'border border-slate-700 text-slate-300 hover:bg-slate-900'
      }`}
    >
      {label}
    </button>
  );
}

function TxRow({ tx }) {
  const shortHash =
    tx.hash && !tx.hash.startsWith('pending-')
      ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-6)}`
      : 'pending…';

  const created = tx.createdAt
    ? new Date(tx.createdAt).toLocaleTimeString()
    : '';

  return (
    <div className="grid grid-cols-1 gap-2 px-4 py-3 text-xs text-slate-200 sm:grid-cols-[1.3fr,1fr,1.4fr,1fr] sm:items-center">
      <div>
        <p className="font-medium text-slate-50">{tx.label}</p>
        <p className="text-[11px] text-slate-400">{tx.method}</p>
      </div>
      <div>
        <TxStatusBadge status={tx.status} />
      </div>
      <div className="space-y-1">
        <p className="font-mono text-[11px] text-slate-300">{shortHash}</p>
        {tx.explorerUrl && (
          <button
            type="button"
            onClick={() => window.open(tx.explorerUrl, '_blank')}
            className="text-[11px] text-accent hover:underline"
          >
            View in StellarExpert
          </button>
        )}
      </div>
      <div className="text-right text-[11px] text-slate-400">
        {created}
      </div>
    </div>
  );
}

