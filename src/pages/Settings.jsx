import React, { useContext, useState } from 'react';
import { AppContext } from '../App.jsx';
import { HORIZON_URL, RPC_URL, saveStoredContractId } from '../lib/soroban.js';
import { useWallet } from '../lib/wallet.jsx';

export default function Settings() {
  const { contractId, setContractId, NETWORK_PASSPHRASE } =
    useContext(AppContext);
  const wallet = useWallet();
  const [value, setValue] = useState(contractId || '');
  const [saved, setSaved] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setContractId(value.trim());
    saveStoredContractId(value.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-50">
          Settings
        </h1>
        <p className="mt-1 text-xs text-slate-400">
          Configure the Soroban contract and network details.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm space-y-4"
      >
        <div>
          <label className="text-xs font-medium text-slate-300">
            Contract address (ID)
          </label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs font-mono text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Paste the contract id returned by{' '}
            <code className="rounded bg-slate-800 px-1 py-0.5">
              soroban contract deploy
            </code>
            .
          </p>
        </div>
        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-accent/90"
          >
            Save settings
          </button>
          {saved && (
            <span className="text-xs text-emerald-400">Saved ✅</span>
          )}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        <InfoCard label="Network passphrase" value={NETWORK_PASSPHRASE} />
        <InfoCard label="RPC URL" value={RPC_URL} />
        <InfoCard label="Horizon URL" value={HORIZON_URL} />
        <InfoCard
          label="Connected wallet"
          value={wallet.address || 'Not connected'}
        />
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 break-all text-xs text-slate-100">{value}</p>
    </div>
  );
}

