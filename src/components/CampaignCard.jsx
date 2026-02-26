import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar.jsx';

function getCampaignImage(title) {
  const t = title.toLowerCase();
  if (t.includes('water') || t.includes('village')) {
    return 'https://images.unsplash.com/photo-1508599589920-14cfa1c1fe4a?auto=format&fit=crop&w=900&q=80';
  }
  if (t.includes('agriculture') || t.includes('farmer') || t.includes('co-op')) {
    return 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=900&q=80';
  }
  if (t.includes('child')) {
    return 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?auto=format&fit=crop&w=900&q=80';
  }
  if (t.includes('women')) {
    return 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80';
  }
  if (t.includes('pharma') || t.includes('health')) {
    return 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80';
  }
  if (t.includes('forest') || t.includes('climate')) {
    return 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80';
  }
  return 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80';
}

export default function CampaignCard({
  campaign,
  onDonateClick,
  isOwner
}) {
  const { campaign_id, title, description, goal, raised, is_active, owner } =
    campaign;
  const shortOwner = `${owner.slice(0, 4)}...${owner.slice(-4)}`;
  const imageUrl = getCampaignImage(title);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/70 shadow-sm shadow-slate-950/40 transition hover:-translate-y-0.5 hover:border-accent/70 hover:shadow-lg">
      <div className="relative h-28 w-full overflow-hidden bg-slate-800">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/10 to-transparent" />
        <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between gap-2 text-[11px] text-slate-100">
          <span className="line-clamp-1 font-semibold drop-shadow">
            {title}
          </span>
          <span
            className={`rounded-full px-2 py-0.5 font-medium backdrop-blur ${
              is_active
                ? 'bg-emerald-500/20 text-emerald-200'
                : 'bg-slate-900/70 text-slate-300'
            }`}
          >
            {is_active ? 'Active' : 'Closed'}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="mb-2 line-clamp-2 text-xs text-slate-300">
          {description}
        </p>
        <div className="mb-3 text-[11px] text-slate-400">
          Owner:{' '}
          <span className="font-mono text-slate-300" title={owner}>
            {shortOwner}
          </span>
        </div>
        <ProgressBar raised={raised} goal={goal} />
        <div className="mt-4 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={!is_active}
            onClick={onDonateClick}
            className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-slate-950 shadow hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Donate
          </button>
          <Link
            to={`/campaign/${campaign_id}`}
            className="text-xs font-medium text-slate-200 hover:text-accent"
          >
            View details →
          </Link>
        </div>
        {isOwner && (
          <p className="mt-2 text-[11px] font-medium text-emerald-400">
            You are the owner
          </p>
        )}
      </div>
    </div>
  );
}

