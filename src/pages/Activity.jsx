import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '../App.jsx';

export default function Activity() {
  const { events } = useContext(AppContext);

  const items = useMemo(() => {
    return events
      .slice()
      .reverse()
      .map((e) => {
        const topic0 = e.topic?.[0] || '';
        const type =
          topic0 === 'CampaignCreated'
            ? 'created'
            : topic0 === 'DonationMade'
            ? 'donation'
            : topic0 === 'CampaignClosed'
            ? 'closed'
            : 'other';

        const campaignId =
          e.topic?.[2] || e.topic?.[1] || e.topic?.[0];
        const donor = e.topic?.[1];
        const amount = e.value?.[0];
        const ledger = e.ledger;

        return {
          id: `${topic0}-${campaignId}-${ledger}`,
          type,
          campaignId,
          donor,
          amount,
          ledger
        };
      });
  }, [events]);

  const imageForType = (type) => {
    if (type === 'donation') {
      return 'https://images.unsplash.com/photo-1605902711622-cfb43c4437b5?auto=format&fit=crop&w=600&q=80';
    }
    if (type === 'created') {
      return 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=600&q=80';
    }
    if (type === 'closed') {
      return 'https://images.unsplash.com/photo-1523287562758-66c7fc58967a?auto=format&fit=crop&w=600&q=80';
    }
    return 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80';
  };

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-50">
        Activity feed
      </h1>
      <p className="mt-1 text-xs text-slate-400">
        Live Soroban event stream from the FundFlow contract. Auto-updates
        every few seconds with on-chain crowdfunding activity.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
        {items.length === 0 ? (
          <p className="text-xs text-slate-400">
            No events yet. Create a campaign or donate to see activity
            here.
          </p>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <div className="flex items-start gap-3">
                  <div className="hidden h-12 w-16 overflow-hidden rounded-lg bg-slate-800 sm:block">
                    <img
                      src={imageForType(item.type)}
                      alt={item.type}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div
                    className={`mt-0.5 h-6 w-6 rounded-full text-[10px] font-semibold leading-6 text-center ${
                      item.type === 'created'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : item.type === 'donation'
                        ? 'bg-accent/20 text-accent'
                        : item.type === 'closed'
                        ? 'bg-red-500/20 text-red-300'
                        : 'bg-slate-700/40 text-slate-200'
                    }`}
                  >
                    {item.type === 'donation'
                      ? 'D'
                      : item.type === 'created'
                      ? 'C'
                      : item.type === 'closed'
                      ? 'X'
                      : '?'}
                  </div>
                  <div>
                    <p className="text-xs text-slate-100">
                      {item.type === 'donation' && (
                        <>
                          <span className="font-mono text-slate-200">
                            {item.donor?.slice(0, 4)}...
                            {item.donor?.slice(-4)}
                          </span>{' '}
                          donated{' '}
                          <span className="font-semibold text-slate-50">
                            {item.amount} XLM
                          </span>
                        </>
                      )}
                      {item.type === 'created' && (
                        <>New campaign created on-chain.</>
                      )}
                      {item.type === 'closed' && <>Campaign was closed.</>}
                      {item.type === 'other' && <>Contract event</>}
                    </p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Campaign{' '}
                      <Link
                        to={`/campaign/${item.campaignId}`}
                        className="font-mono text-accent"
                      >
                        #{item.campaignId}
                      </Link>{' '}
                      • Ledger #{item.ledger}
                    </p>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500">
                  live • few sec ago
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

