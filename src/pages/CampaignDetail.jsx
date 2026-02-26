import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../App.jsx';
import { useWallet } from '../lib/wallet.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import DonationModal from '../components/DonationModal.jsx';
import { nativeToScVal } from '@stellar/stellar-sdk';

export default function CampaignDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, events, guardedInvoke, addToast } =
    useContext(AppContext);
  const wallet = useWallet();

  const [campaign, setCampaign] = useState(null);
  const [donateOpen, setDonateOpen] = useState(false);
  const [donating, setDonating] = useState(false);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const cid = Number(id);
    const found = campaigns.find((c) => Number(c.campaign_id) === cid);
    if (!found) {
      navigate('/campaigns');
      return;
    }
    setCampaign(found);
  }, [campaigns, id, navigate]);

  const isOwner = useMemo(() => {
    if (!wallet.address || !campaign) return false;
    return wallet.address === campaign.owner;
  }, [wallet.address, campaign]);

  const donorEvents = useMemo(() => {
    if (!campaign) return [];
    return events
      .filter((e) => {
        const topic0 = e.topic?.[0] || '';
        if (topic0 !== 'DonationMade') return false;
        const cid = Number(e.topic?.[2]);
        return cid === Number(campaign.campaign_id);
      })
      .map((e) => ({
        donor: e.topic?.[1],
        amount: e.value?.[0],
        raised: e.value?.[1],
        ts: e.ledger
      }))
      .slice()
      .reverse();
  }, [events, campaign]);

  const handleDonate = async (amount) => {
    if (!campaign) return;
    try {
      setDonating(true);
      await wallet.checkBalance(amount + 1);

      await guardedInvoke({
        label: `Donate ${amount} XLM`,
        method: 'donate',
        args: [
          nativeToScVal(campaign.campaign_id, { type: 'u32' }),
          nativeToScVal(BigInt(Math.round(amount)), { type: 'i128' })
        ]
      });

      setDonateOpen(false);
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

  const handleClose = async () => {
    if (!campaign) return;
    try {
      setClosing(true);
      await guardedInvoke({
        label: 'Close campaign',
        method: 'close_campaign',
        args: [nativeToScVal(campaign.campaign_id, { type: 'u32' })]
      });
    } finally {
      setClosing(false);
    }
  };

  if (!campaign) {
    return (
      <p className="text-xs text-slate-400">
        Loading campaign details…
      </p>
    );
  }

  const shortOwner = `${campaign.owner.slice(0, 4)}...${campaign.owner.slice(
    -4
  )}`;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Campaign #{campaign.campaign_id}
          </p>
          <h1 className="mt-1 text-lg font-semibold text-slate-50">
            {campaign.title}
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          {isOwner && (
            <button
              type="button"
              disabled={!campaign.is_active || closing}
              onClick={handleClose}
              className="rounded-full border border-red-500/60 px-3 py-1.5 text-xs font-semibold text-red-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {closing ? 'Closing…' : 'Close Campaign'}
            </button>
          )}
          <button
            type="button"
            disabled={!campaign.is_active}
            onClick={() => {
              if (!wallet.address) {
                addToast(
                  'error',
                  'Wallet required',
                  'Connect a wallet to donate.'
                );
                return;
              }
              setDonateOpen(true);
            }}
            className="rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-slate-950 shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Donate
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-6 md:grid-cols-[2fr,1.4fr]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Overview
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-xs text-slate-300">
              {campaign.description}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>
                Owner:{' '}
                <span className="font-mono text-slate-200" title={campaign.owner}>
                  {shortOwner}
                </span>
              </span>
              <span>•</span>
              <span>
                Status:{' '}
                <span
                  className={`font-medium ${
                    campaign.is_active ? 'text-emerald-400' : 'text-slate-400'
                  }`}
                >
                  {campaign.is_active ? 'Active' : 'Closed'}
                </span>
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Funding progress
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Goal: {campaign.goal} XLM • Raised: {campaign.raised} XLM
            </p>
            <div className="mt-3">
              <ProgressBar raised={campaign.raised} goal={campaign.goal} />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-100">
              Recent donors
            </h2>
            {donorEvents.length === 0 ? (
              <p className="mt-2 text-xs text-slate-400">
                No donations yet. Be the first supporter.
              </p>
            ) : (
              <ul className="mt-3 space-y-2">
                {donorEvents.map((d, i) => (
                  <li
                    key={`${d.donor}-${i}`}
                    className="flex items-center justify-between text-xs text-slate-300"
                  >
                    <div>
                      <p className="font-mono text-[11px] text-slate-200">
                        {d.donor?.slice(0, 4)}...{d.donor?.slice(-4)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Ledger #{d.ts}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-50">
                        {d.amount} XLM
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <DonationModal
        open={donateOpen}
        onClose={() => setDonateOpen(false)}
        onConfirm={handleDonate}
        loading={donating}
      />
    </>
  );
}

