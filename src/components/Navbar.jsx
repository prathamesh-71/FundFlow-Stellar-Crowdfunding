import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../lib/wallet.jsx';

export default function Navbar({ onToggleSidebar }) {
  const { address, shortAddress, connecting, connect, disconnect } = useWallet();
  const location = useLocation();

  const isSettings = location.pathname.startsWith('/settings');

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="mr-1 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 sm:hidden"
            onClick={onToggleSidebar}
          >
            Menu
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-accent/20 px-2 py-1 text-xs font-semibold text-accent">
              FundFlow
            </div>
            <span className="hidden text-sm font-medium text-slate-200 sm:inline">
              Stellar Crowdfunding
            </span>
          </Link>
          <span className="ml-3 hidden rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 sm:inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Testnet
          </span>
        </div>

        <div className="flex items-center gap-3">
          {isSettings && (
            <span className="hidden text-xs text-slate-400 sm:inline">
              Settings
            </span>
          )}

          {address ? (
            <div className="flex items-center gap-2">
              <div className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs text-slate-200">
                <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {shortAddress}
              </div>
              <button
                type="button"
                onClick={disconnect}
                className="rounded-full border border-slate-700 px-3 py-1 text-xs font-medium text-slate-200 hover:bg-slate-800"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={connecting}
              onClick={connect}
              className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-sm hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {connecting ? 'Connecting…' : 'Connect Wallet'}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

