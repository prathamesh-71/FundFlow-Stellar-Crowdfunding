import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/', label: 'Overview' },
  { to: '/campaigns', label: 'Campaigns' },
  { to: '/create', label: 'Create Campaign' },
  { to: '/activity', label: 'Activity' },
  { to: '/transactions', label: 'Transactions' },
  { to: '/admin', label: 'Admin' },
  { to: '/settings', label: 'Settings' }
];

export default function Sidebar({ open }) {
  return (
    <aside
      className={`${open ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'
        } fixed inset-y-0 left-0 z-30 w-60 border-r border-slate-800 bg-slate-950/95 backdrop-blur-sm transition-transform sm:static sm:block`}
    >
      <div className="flex h-full flex-col">
        <div className="px-4 pb-4 pt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Navigation
        </div>
        <nav className="flex-1 space-y-1 px-2 pb-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                [
                  'flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-slate-800 text-slate-50'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-slate-50'
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-800 px-4 py-3 text-xs text-slate-500">
          <p className="font-medium text-slate-300">FundFlow</p>
          <p>Stellar Testnet Crowdfunding</p>
        </div>
      </div>
    </aside>
  );
}

