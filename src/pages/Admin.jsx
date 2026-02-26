import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App.jsx';
import { useWallet } from '../lib/wallet.jsx';
import TxStatusBadge from '../components/TxStatusBadge.jsx';

export default function Admin() {
  const { stats, campaigns, transactions, adminAddresses } =
    useContext(AppContext);
  const { address } = useWallet();
  const [requestName, setRequestName] = useState('');
  const [requestOrg, setRequestOrg] = useState('');
  const [requestReason, setRequestReason] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const isAdmin = useMemo(
    () => !!address && Array.isArray(adminAddresses) && adminAddresses.includes(address),
    [address, adminAddresses]
  );

  if (!address) {
    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-lg font-semibold text-slate-50">Admin data center</h1>
        <p className="text-xs text-slate-400">
          Connect an admin wallet to access detailed analytics, campaigns, and transaction
          insights for FundFlow.
        </p>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
          <p>
            This space is reserved for project owners and operations. Once your Freighter
            or Albedo wallet is connected, you&apos;ll be able to monitor campaigns,
            donations, and requests in real time.
          </p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    const handleRequest = (e) => {
      e.preventDefault();
      const trimmedName = requestName.trim();
      const trimmedReason = requestReason.trim();
      if (!trimmedName || !trimmedReason) return;

      const existing = JSON.parse(
        localStorage.getItem('fundflow_admin_requests') || '[]'
      );
      existing.push({
        name: trimmedName,
        org: requestOrg.trim(),
        reason: trimmedReason,
        address,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(
        'fundflow_admin_requests',
        JSON.stringify(existing)
      );
      setRequestSubmitted(true);
      setRequestName('');
      setRequestOrg('');
      setRequestReason('');
      setTimeout(() => setRequestSubmitted(false), 3000);
    };

    return (
      <div className="max-w-3xl space-y-4">
        <h1 className="text-lg font-semibold text-slate-50">Admin data center</h1>
        <p className="text-xs text-slate-400">
          This view is restricted. Only approved admin wallets can access the FundFlow
          data center. If you operate an institute, foundation, or major backer and need
          access, submit a request below.
        </p>
        <div className="rounded-2xl border border-red-500/40 bg-red-950/40 p-4 text-xs text-slate-200">
          <p className="font-semibold text-red-200">Access denied</p>
          <p className="mt-1 text-red-100/80">
            The connected wallet is not on the admin allowlist. Ask the project owner to
            add your public key to the{' '}
            <code className="rounded bg-red-900/60 px-1 py-0.5 text-[10px]">
              VITE_ADMIN_ADDRESS
            </code>{' '}
            setting if you should have access.
          </p>
        </div>
        <form
          onSubmit={handleRequest}
          className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-200"
        >
          <p className="font-semibold text-slate-100">
            Request admin / data-center access
          </p>
          <p className="text-[11px] text-slate-400">
            Share a few details about your role (e.g. foundation, institute, operations)
            so the owner can review your request.
          </p>
          <div>
            <label className="text-[11px] font-medium text-slate-300">
              Your name
            </label>
            <input
              type="text"
              value={requestName}
              onChange={(e) => setRequestName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Jane Doe"
              required
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-300">
              Institute / foundation (optional)
            </label>
            <input
              type="text"
              value={requestOrg}
              onChange={(e) => setRequestOrg(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Stellar Impact Foundation"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-slate-300">
              Why do you need admin access?
            </label>
            <textarea
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              className="mt-1 h-20 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              placeholder="Explain what data you need to monitor and how you manage funding."
              required
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-full bg-accent px-4 py-1.5 text-[11px] font-semibold text-slate-950 shadow hover:bg-accent/90"
            >
              Submit request
            </button>
            {requestSubmitted && (
              <span className="text-[11px] text-emerald-400">
                Request recorded locally ✅
              </span>
            )}
          </div>
        </form>
      </div>
    );
  }

  const activeCampaigns = campaigns.filter((c) => c.is_active);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold text-slate-50">Admin data center</h1>
        <p className="mt-1 text-xs text-slate-400">
          Internal overview of campaigns, donations, and on-chain activity. Only visible
          to admin wallets.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <SummaryCard
          label="Total raised (XLM)"
          value={stats.totalRaised}
          sub="Across all campaigns"
        />
        <SummaryCard
          label="Active campaigns"
          value={activeCampaigns.length}
          sub="Currently fundraising"
        />
        <SummaryCard
          label="On-chain actions"
          value={stats.totalDonations}
          sub="Creates & donations"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[2fr,1.4fr]">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-100">Campaign overview</h2>
          <p className="mt-1 text-[11px] text-slate-400">
            Snapshot of all campaigns, including admin-only themes such as pharma,
            agriculture, child foundations, and women empowerment societies.
          </p>
          <div className="mt-3 max-h-72 overflow-y-auto text-xs">
            <table className="min-w-full border-separate border-spacing-y-1">
              <thead className="text-[11px] text-slate-400">
                <tr>
                  <th className="px-2 py-1 text-left">ID</th>
                  <th className="px-2 py-1 text-left">Creator Wallet & Title</th>
                  <th className="px-2 py-1 text-left">Status</th>
                  <th className="px-2 py-1 text-right">Raised / Goal</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((c) => (
                  <tr
                    key={c.campaign_id}
                    className="rounded-lg bg-slate-950/60 text-slate-100 transition-colors hover:bg-white/5"
                  >
                    <td className="px-2 py-1 align-top text-[11px] font-mono text-slate-400">
                      #{c.campaign_id}
                    </td>
                    <td className="px-2 py-1 align-top">
                      <p className="line-clamp-1 text-xs font-semibold text-white">{c.title}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className="flex h-4 w-4 items-center justify-center rounded bg-accent/20 text-[8px]">
                          🛡️
                        </span>
                        <code className="text-[10px] text-accent font-mono block">
                          {c.owner ? `${c.owner.slice(0, 12)}...${c.owner.slice(-6)}` : 'Unknown Owner'}
                        </code>
                      </div>
                    </td>
                    <td className="px-2 py-1 align-top text-[11px]">
                      {c.is_active ? (
                        <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 text-emerald-300">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full border border-slate-700/60 bg-slate-700/40 px-2.5 py-0.5 text-slate-300">
                          Closed
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1 align-top text-right text-[11px] font-medium text-slate-200">
                      {c.raised} / {c.goal} XLM
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Recent requests & donations
            </h2>
            <p className="mt-1 text-[11px] text-slate-400">
              High-level log of recent create, donate, and close actions. Use this as an
              admin-only &ldquo;data center&rdquo; view across PCs.
            </p>
            <div className="mt-3 max-h-64 overflow-y-auto space-y-2 text-xs">
              {transactions.length === 0 ? (
                <p className="text-[11px] text-slate-400">
                  No local transactions yet. Actions you take from this browser will
                  appear here.
                </p>
              ) : (
                transactions.slice(0, 8).map((tx) => (
                  <div
                    key={tx.hash}
                    className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/60 px-3 py-2"
                  >
                    <div>
                      <p className="text-[11px] font-medium text-slate-100">
                        {tx.label}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {tx.method} •{' '}
                        {tx.hash && !tx.hash.startsWith('pending-')
                          ? `${tx.hash.slice(0, 6)}...${tx.hash.slice(-4)}`
                          : 'pending…'}
                      </p>
                    </div>
                    <TxStatusBadge status={tx.status} />
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] text-slate-300 shadow-sm">
            <p className="font-semibold text-slate-100">
              Requested fund actions (demo)
            </p>
            <p className="mt-1">
              Use the Transactions screen and this panel to review requested fund flows
              before approving or closing campaigns. In a production deployment, this is
              where multi‑sig approvals or backoffice automation would be wired in.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold text-slate-50">{value}</p>
      <p className="mt-1 text-[11px] text-slate-400">{sub}</p>
    </div>
  );
}

