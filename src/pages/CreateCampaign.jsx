import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { useWallet } from '../lib/wallet.jsx';
import { nativeToScVal } from '@stellar/stellar-sdk';
import { fetchAllCampaigns } from '../lib/soroban.js';

export default function CreateCampaign() {
  const { contractId, guardedInvoke, addToast, setCampaigns } =
    useContext(AppContext);
  const wallet = useWallet();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!wallet.address) {
      addToast('error', 'Wallet required', 'Connect a wallet to create.');
      return;
    }
    if (!contractId) {
      addToast(
        'error',
        'Contract not configured',
        'Set the contract address in Settings first.'
      );
      return;
    }

    const g = parseFloat(goal);
    if (!title.trim() || !description.trim() || !Number.isFinite(g) || g <= 0) {
      addToast(
        'error',
        'Invalid form',
        'Title, description and positive goal are required.'
      );
      return;
    }

    try {
      setSubmitting(true);

      await wallet.checkBalance(g + 1);

      await guardedInvoke({
        label: 'Create campaign',
        method: 'create_campaign',
        args: [
          nativeToScVal(title),
          nativeToScVal(description),
          nativeToScVal(BigInt(Math.round(g)), { type: 'i128' })
        ]
      });

      const cs = await fetchAllCampaigns(contractId);
      setCampaigns(cs);
      const newest = cs[cs.length - 1];
      if (newest) {
        navigate(`/campaign/${newest.campaign_id}`);
      } else {
        navigate('/campaigns');
      }
    } catch (e) {
      if (e.code === 'INSUFFICIENT_BALANCE') {
        addToast('error', 'Insufficient balance', e.message);
      } else {
        console.error(e);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h1 className="text-lg font-semibold text-slate-50">
        Create a new campaign
      </h1>
      <p className="mt-1 text-xs text-slate-400">
        Launch a crowdfunding campaign and accept XLM donations on Stellar
        Testnet.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        <div>
          <label className="text-xs font-medium text-slate-300">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Plant Trees with Stellar"
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 h-28 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="Explain what you are raising funds for and how they will be used."
            required
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-300">
            Goal (XLM)
          </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            placeholder="500"
            required
          />
          <p className="mt-1 text-[11px] text-slate-500">
            We will check your XLM balance before submitting to avoid failed
            transactions.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center rounded-full bg-accent px-5 py-2 text-sm font-semibold text-slate-950 shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Creating on-chain…' : 'Create campaign'}
          </button>
        </div>
      </form>
    </div>
  );
}

