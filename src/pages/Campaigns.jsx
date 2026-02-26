import React, { useContext, useMemo, useState } from 'react';
import { AppContext } from '../App.jsx';
import { useWallet } from '../lib/wallet.jsx';
import CampaignCard from '../components/CampaignCard.jsx';
import DonationModal from '../components/DonationModal.jsx';
import { nativeToScVal } from '@stellar/stellar-sdk';

export default function Campaigns() {
  const { campaigns, guardedInvoke, addToast } = useContext(AppContext);
  const wallet = useWallet();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeCampaign, setActiveCampaign] = useState(null);
  const [donating, setDonating] = useState(false);

  const filtered = useMemo(() => {
    let list = campaigns;
    if (filter === 'trending') {
      list = [...list].sort(
        (a, b) =>
          Number(b.raised || 0) / Number(b.goal || 1) -
          Number(a.raised || 0) / Number(a.goal || 1)
      );
    } else if (filter === 'donate') {
      list = [...list]
        .filter((c) => c.is_active)
        .sort(
          (a, b) =>
            Number(b.raised || 0) / Number(b.goal || 1) -
            Number(a.raised || 0) / Number(a.goal || 1)
        );
    } else if (filter === 'active') {
      list = list.filter((c) => c.is_active);
    } else if (filter === 'closed') {
      list = list.filter((c) => !c.is_active);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }

    return list;
  }, [campaigns, filter, search]);

  const openDonate = (campaign) => {
    if (!wallet.address) {
      addToast('error', 'Wallet required', 'Connect a wallet to donate.');
      return;
    }
    setActiveCampaign(campaign);
  };

  const handleDonate = async (amount) => {
    if (!activeCampaign) return;
    try {
      setDonating(true);

      await wallet.checkBalance(amount + 1);

      await guardedInvoke({
        label: `Donate ${amount} XLM`,
        method: 'donate',
        args: [
          nativeToScVal(activeCampaign.campaign_id, { type: 'u32' }),
          nativeToScVal(BigInt(Math.round(amount)), { type: 'i128' })
        ]
      });

      setActiveCampaign(null);
    } catch (e) {
      if (e.code === 'INSUFFICIENT_BALANCE') {
        addToast('error', 'Insufficient balance', e.message);
      } else {
        console.error(e);
      }
    } finally {
      setDonating(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-50">
            Campaigns
          </h1>
          <p className="text-xs text-slate-400">
            Browse all FundFlow campaigns on Stellar Testnet.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterButton
            label="All"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterButton
            label="Trending"
            active={filter === 'trending'}
            onClick={() => setFilter('trending')}
          />
          <FilterButton
            label="Donate"
            active={filter === 'donate'}
            onClick={() => setFilter('donate')}
          />
          <FilterButton
            label="Active"
            active={filter === 'active'}
            onClick={() => setFilter('active')}
          />
          <FilterButton
            label="Closed"
            active={filter === 'closed'}
            onClick={() => setFilter('closed')}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or description..."
          className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400">
            No campaigns found. Try a different filter.
          </p>
        ) : (
          filtered.map((c) => (
            <CampaignCard
              key={c.campaign_id}
              campaign={c}
              onDonateClick={() => openDonate(c)}
              isOwner={wallet.address === c.owner}
            />
          ))
        )}
      </div>

      <DonationModal
        open={!!activeCampaign}
        onClose={() => setActiveCampaign(null)}
        onConfirm={handleDonate}
        loading={donating}
      />
    </>
  );
}

function FilterButton({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition ${
        active
          ? 'bg-slate-100 text-slate-900'
          : 'border border-slate-700 text-slate-300 hover:bg-slate-900'
      }`}
    >
      {label}
    </button>
  );
}

