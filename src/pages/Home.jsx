import React, { useContext, useMemo, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import CampaignCard from '../components/CampaignCard.jsx';

function ChatMessage({ event }) {
  const isCreate = event.topic?.[0] === 'CampaignCreated';
  const colorClass = isCreate ? 'text-emerald-400' : 'text-accent';

  // Format the visual message defensively
  // In Javascript, ScVal strings/addresses might not be plain strings.
  const rawAddress = event.topic?.[1];
  const addressStr = typeof rawAddress === 'string' ? rawAddress : String(rawAddress);
  const displayAddress = addressStr.length > 12
    ? `${addressStr.slice(0, 6)}...${addressStr.slice(-4)}`
    : addressStr || 'Unknown';

  const campaignId = event.topic?.[2] || '?';

  const msg = isCreate
    ? `Wallet ${displayAddress} created Campaign #${campaignId}`
    : `Wallet ${displayAddress} donated to Campaign #${campaignId}`;

  return (
    <div className="flex animate-scroll-up items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 shadow-sm backdrop-blur-md">
      <div className={`flex h-8 w-8 items-center justify-center rounded-full bg-white/10 ${colorClass}`}>
        {isCreate ? '🚀' : '💎'}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-100">{msg}</p>
        <p className="text-[10px] text-slate-400">Ledger {event.ledger} • Just now</p>
      </div>
    </div>
  );
}

export default function Home() {
  const { stats, campaigns, events } = useContext(AppContext);

  const trending = useMemo(() => {
    return [...campaigns]
      .sort(
        (a, b) =>
          Number(b.raised || 0) / Number(b.goal || 1) -
          Number(a.raised || 0) / Number(a.goal || 1)
      )
      .slice(0, 3);
  }, [campaigns]);

  // Take the most recent events for the chat flow
  const recentChats = useMemo(() => {
    return events.slice(0, 8);
  }, [events]);

  return (
    <>
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/80 to-slate-900/80 p-8 shadow-2xl backdrop-blur-xl sm:p-12">
        {/* Glow Effects */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-accent/20 blur-[100px]"></div>
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-purple-500/20 blur-[100px]"></div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-[1fr,400px]">
          <div>
            <div className="inline-flex animate-pulse items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-accent">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-accent"></span>
              </span>
              Live on Stellar Testnet
            </div>

            <h1 className="mt-8 text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-400 sm:text-6xl lg:text-7xl">
              FundFlow. <br />
              <span className="bg-gradient-to-r from-accent to-purple-400 bg-clip-text text-transparent">
                Redefining Crowdfunding.
              </span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-300">
              Create campaigns, raise funds, and build trust with 100% on-chain transparency. Connect your wallet and unleash the power of decentralized finance for your projects today.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                to="/create"
                className="group relative inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-slate-950 transition-all hover:scale-105 hover:bg-slate-100 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]"
              >
                Start a Campaign
                <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
              <Link
                to="/campaigns"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-3.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-lg"
              >
                Explore Projects
              </Link>
            </div>

            {/* Quick Stats Grid */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <StatCard label="Total Volume" value={`${stats.totalRaised} XLM`} />
              <StatCard label="Live Projects" value={stats.totalCampaigns} />
              <StatCard label="Network Actions" value={stats.totalDonations} />
            </div>
          </div>

          {/* Trending Flow Chat UI */}
          <div className="relative hidden h-[500px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/50 shadow-inner backdrop-blur-md lg:block">
            <div className="absolute inset-x-0 top-0 z-20 h-20 bg-gradient-to-b from-slate-950 to-transparent"></div>
            <div className="absolute inset-x-0 bottom-0 z-20 h-20 bg-gradient-to-t from-slate-950 to-transparent"></div>

            <div className="p-4">
              <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-slate-400">
                Live Network Activity
              </h3>
              <div className="relative flex h-[400px] flex-col gap-3 overflow-hidden">
                {recentChats.length > 0 ? (
                  recentChats.map((evt, idx) => (
                    <ChatMessage key={idx} event={evt} />
                  ))
                ) : (
                  <p className="text-sm text-slate-500">Waiting for on-chain events...</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Campaigns Grid */}
      <section className="mt-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Trending Campaigns</h2>
            <p className="mt-1 text-sm text-slate-400">Projects gaining the most momentum right now.</p>
          </div>
          <Link to="/campaigns" className="text-sm font-semibold text-accent hover:text-white transition-colors">
            View all →
          </Link>
        </div>

        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {trending.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-white/10 bg-white/5 p-8 text-center backdrop-blur-sm">
              <p className="text-slate-400">No campaigns yet. <Link to="/create" className="text-accent underline">Create the first one.</Link></p>
            </div>
          ) : (
            trending.map((c) => (
              <div className="transition-transform hover:-translate-y-1 hover:shadow-2xl hover:shadow-accent/10" key={c.campaign_id}>
                <CampaignCard
                  campaign={c}
                  onDonateClick={() => { }}
                  isOwner={false}
                />
              </div>
            ))
          )}
        </div>
      </section>

      <footer className="mt-20 border-t border-white/10 py-8 text-center text-sm text-slate-500">
        <p>
          FundFlow runs on Stellar Testnet. View transactions on{' '}
          <a href="https://stellar.expert/explorer/testnet" target="_blank" rel="noreferrer" className="text-accent hover:underline">
            StellarExpert
          </a>.
        </p>
      </footer>
    </>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm transition-all hover:bg-white/10">
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100"></div>
      <p className="relative z-10 text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </p>
      <p className="relative z-10 mt-2 text-2xl font-bold tracking-tight text-white drop-shadow-md">
        {value}
      </p>
    </div>
  );
}

