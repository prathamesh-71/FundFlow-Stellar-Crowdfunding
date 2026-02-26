import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import Toast from './components/Toast.jsx';
import Home from './pages/Home.jsx';
import Campaigns from './pages/Campaigns.jsx';
import CampaignDetail from './pages/CampaignDetail.jsx';
import CreateCampaign from './pages/CreateCampaign.jsx';
import Activity from './pages/Activity.jsx';
import Transactions from './pages/Transactions.jsx';
import Settings from './pages/Settings.jsx';
import Admin from './pages/Admin.jsx';
import { WalletProvider, useWallet } from './lib/wallet.jsx';
import {
  fetchAllCampaigns,
  fetchRecentEvents,
  invokeContractMethod,
  loadStoredContractId,
  loadStoredTransactions,
  saveStoredContractId,
  saveStoredTransactions,
  NETWORK_PASSPHRASE
} from './lib/soroban.js';

export const AppContext = createContext(null);

let toastIdCounter = 0;

const ADMIN_ADDRESSES = [
  import.meta.env.VITE_ADMIN_ADDRESS ||
  'GABCDEMDEMOAURORAOWNER00000000000000000000000000001'
];

const DEMO_CAMPAIGNS = [
  {
    campaign_id: 1,
    title: 'Clean Water for Village Aurora',
    description:
      'Help us deploy solar-powered water pumps to provide clean drinking water to 300+ families in Village Aurora.',
    goal: 1200,
    raised: 840,
    owner: 'GABCDEMDEMOAURORAOWNER00000000000000000000000000001',
    is_active: true
  },
  {
    campaign_id: 2,
    title: 'Open Source Education Grants',
    description:
      'Micro-grants for students building public-good tools in the Stellar ecosystem.',
    goal: 2000,
    raised: 1450,
    owner: 'GABCDEMDEMOEDUOWNER0000000000000000000000000000002',
    is_active: true
  },
  {
    campaign_id: 3,
    title: 'Reforest the Coastal Belt',
    description:
      'Plant 10,000 mangrove saplings to protect coastal communities from floods and erosion.',
    goal: 5000,
    raised: 2100,
    owner: 'GABCDEMDEMOFORESTOWNER000000000000000000000000003',
    is_active: true
  },
  {
    campaign_id: 4,
    title: 'Community Internet Hub',
    description:
      'Set up a community-run internet hub powered by satellite links for rural learners.',
    goal: 3500,
    raised: 3500,
    owner: 'GABCDEMDEMOINTERNET000000000000000000000000000004',
    is_active: false
  },
  {
    campaign_id: 5,
    title: 'Disaster Relief Emergency Fund',
    description:
      'Rapid-response fund for food, blankets and medical kits after local climate disasters.',
    goal: 8000,
    raised: 6200,
    owner: 'GABCDEMDEMODEMERGENCY0000000000000000000000000005',
    is_active: true
  },
  {
    campaign_id: 6,
    title: 'Global Health Access Fund',
    description:
      'Crowdfund telemedicine kits and essential medicines for remote clinics in under-served regions.',
    goal: 6000,
    raised: 2800,
    owner: 'GABCDEMDEMOGHEALTH000000000000000000000000000006',
    is_active: true
  },
  {
    campaign_id: 7,
    title: 'Creators on Stellar',
    description:
      'Support independent artists and musicians experimenting with NFTs and on-chain patronage.',
    goal: 3000,
    raised: 950,
    owner: 'GABCDEMDEMOCREATOR000000000000000000000000000007',
    is_active: true
  },
  {
    campaign_id: 8,
    title: 'DevRel Community Grants',
    description:
      'Small grants for meetups, workshops, and hackathons that grow the Stellar and Soroban developer ecosystem.',
    goal: 4000,
    raised: 1900,
    owner: 'GABCDEMDEMODEVRELOWNER000000000000000000000000008',
    is_active: true
  },
  {
    campaign_id: 9,
    title: 'Pharma Access Fund',
    description:
      'Subsidise life‑saving medicines and diagnostics for low‑income patients through trusted community pharmacies.',
    goal: 7000,
    raised: 3200,
    owner: 'GABCDEMDEMOPHARMA000000000000000000000000000009',
    is_active: true
  },
  {
    campaign_id: 10,
    title: 'Sustainable Agriculture Co‑op',
    description:
      'Provide seeds, soil testing, and training for smallholder farmers adopting climate‑smart agriculture.',
    goal: 6500,
    raised: 2750,
    owner: 'GABCDEMDEMOAGRIOWNER0000000000000000000000000010',
    is_active: true
  },
  {
    campaign_id: 11,
    title: 'Bright Futures Child Foundation',
    description:
      'Fund nutrition packs, after‑school programs, and safe transport for children in vulnerable communities.',
    goal: 5500,
    raised: 2600,
    owner: 'GABCDEMDEMOCHILDOWNER0000000000000000000000000011',
    is_active: true
  },
  {
    campaign_id: 12,
    title: 'Women Society Empowerment Fund',
    description:
      'Micro‑grants and mentorship for women‑led cooperatives, makers, and local social enterprises.',
    goal: 9000,
    raised: 4100,
    owner: 'GABCDEMDEMOWOMENOWNER0000000000000000000000000012',
    is_active: true
  }
];

const DEMO_EVENTS = [
  // Campaign creations
  {
    topic: ['CampaignCreated', DEMO_CAMPAIGNS[0].owner, DEMO_CAMPAIGNS[0].campaign_id],
    value: [DEMO_CAMPAIGNS[0].goal],
    ledger: 123450
  },
  {
    topic: ['CampaignCreated', DEMO_CAMPAIGNS[2].owner, DEMO_CAMPAIGNS[2].campaign_id],
    value: [DEMO_CAMPAIGNS[2].goal],
    ledger: 123451
  },
  {
    topic: ['CampaignCreated', DEMO_CAMPAIGNS[5].owner, DEMO_CAMPAIGNS[5].campaign_id],
    value: [DEMO_CAMPAIGNS[5].goal],
    ledger: 123452
  },
  // Donations
  {
    topic: ['DonationMade', 'GDEMODEMOBACKER00000000000000000000000000006', 1],
    value: [120, 840],
    ledger: 123457
  },
  {
    topic: ['DonationMade', 'GDEMODEMOBACKER00000000000000000000000000007', 2],
    value: [450, 1450],
    ledger: 123458
  },
  {
    topic: ['DonationMade', 'GDEMODEMOBACKER00000000000000000000000000008', 3],
    value: [300, 2100],
    ledger: 123459
  },
  {
    topic: ['DonationMade', 'GDEMODEMOBACKER00000000000000000000000000009', 6],
    value: [500, 2800],
    ledger: 123460
  },
  // Closed campaign
  {
    topic: ['CampaignClosed', 4],
    value: [true],
    ledger: 123461
  }
];

const DEMO_TRANSACTIONS = [
  {
    hash: 'DEMOHASHCREATE1',
    label: 'Create campaign – Clean Water for Village Aurora',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHDONATE1',
    label: 'Donate 120 XLM',
    method: 'donate',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCLOSE4',
    label: 'Close campaign – Community Internet Hub',
    method: 'close_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHDONATE3',
    label: 'Donate 300 XLM',
    method: 'donate',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCREATE6',
    label: 'Create campaign – Global Health Access Fund',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCREATE9',
    label: 'Create campaign – Pharma Access Fund',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCREATE10',
    label: 'Create campaign – Sustainable Agriculture Co‑op',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCREATE11',
    label: 'Create campaign – Bright Futures Child Foundation',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  },
  {
    hash: 'DEMOHASHCREATE12',
    label: 'Create campaign – Women Society Empowerment Fund',
    method: 'create_campaign',
    status: 'success',
    createdAt: new Date().toISOString(),
    explorerUrl: null
  }
];

function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contractId, setContractId] = useState(loadStoredContractId);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalRaised: 0,
    totalCampaigns: 0,
    totalDonations: 0
  });
  const [transactions, setTransactions] = useState(loadStoredTransactions);
  const [toasts, setToasts] = useState([]);
  const location = useLocation();
  const wallet = useWallet();
  const navigate = useNavigate();

  const addToast = useCallback((type, title, message) => {
    const id = ++toastIdCounter;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    saveStoredContractId(contractId);
  }, [contractId]);

  useEffect(() => {
    saveStoredTransactions(transactions);
  }, [transactions]);

  const recomputeStats = useCallback(
    (currentCampaigns, currentEvents) => {
      const totalCampaigns = currentCampaigns.length;
      const totalRaised = currentCampaigns.reduce(
        (sum, c) => sum + Number(c.raised || 0),
        0
      );
      const totalDonations = currentEvents.filter(
        (e) =>
          e.topic?.[0] === 'CampaignCreated' ||
          e.topic?.[0] === 'DonationMade'
      ).length;

      setStats({ totalRaised, totalCampaigns, totalDonations });
    },
    []
  );

  // Seed demo data so the UI feels alive even before on-chain campaigns exist.
  useEffect(() => {
    if (
      campaigns.length === 0 &&
      events.length === 0
    ) {
      setCampaigns(DEMO_CAMPAIGNS);
      setEvents(DEMO_EVENTS);
      setTransactions((prev) =>
        prev.length === 0 ? DEMO_TRANSACTIONS : prev
      );
      recomputeStats(DEMO_CAMPAIGNS, DEMO_EVENTS);
    }
  }, [contractId, campaigns.length, events.length, transactions.length, recomputeStats]);

  const refreshFromChain = useCallback(async () => {
    if (!contractId) return;

    try {
      const [cs, evts] = await Promise.all([
        fetchAllCampaigns(contractId),
        fetchRecentEvents(contractId)
      ]);
      if (cs.length === 0 && evts.length === 0) {
        // If no on-chain data yet, fall back to rich demo data so
        // Campaigns and Activity never feel empty.
        setCampaigns(DEMO_CAMPAIGNS);
        setEvents(DEMO_EVENTS);
        recomputeStats(DEMO_CAMPAIGNS, DEMO_EVENTS);
      } else {
        setCampaigns(cs);
        setEvents(evts);
        recomputeStats(cs, evts);
      }
    } catch (e) {
      console.error('Failed to refresh from chain', e);
    }
  }, [contractId, recomputeStats]);

  useEffect(() => {
    refreshFromChain();
    if (!contractId) return undefined;
    const id = setInterval(refreshFromChain, 4000);
    return () => clearInterval(id);
  }, [contractId, refreshFromChain]);

  const addTransaction = useCallback((tx) => {
    setTransactions((prev) => [tx, ...prev]);
  }, []);

  const updateTransactionStatus = useCallback((hash, partial) => {
    setTransactions((prev) =>
      prev.map((tx) => (tx.hash === hash ? { ...tx, ...partial } : tx))
    );
  }, []);

  const guardedInvoke = useCallback(
    async ({ label, method, args }) => {
      if (!wallet.address || !wallet.kit) {
        const err = new Error('Wallet not connected.');
        err.code = 'NO_WALLET';
        throw err;
      }
      if (!contractId) {
        const err = new Error('Contract ID is not configured.');
        err.code = 'NO_CONTRACT';
        throw err;
      }

      const createdAt = new Date().toISOString();
      const pendingTx = {
        hash: `pending-${Date.now()}`,
        label,
        method,
        status: 'pending',
        createdAt,
        explorerUrl: null
      };
      addTransaction(pendingTx);

      try {
        const resp = await invokeContractMethod({
          contractId,
          method,
          args,
          walletKit: wallet.kit,
          address: wallet.address
        });

        const explorerUrl = `https://stellar.expert/explorer/testnet/tx/${resp.hash}`;

        updateTransactionStatus(pendingTx.hash, {
          hash: resp.hash,
          status: resp.status,
          explorerUrl,
          completedAt: new Date().toISOString()
        });

        if (resp.status === 'success') {
          addToast(
            'success',
            'Transaction confirmed',
            `${label} was successfully confirmed on-chain.`
          );
        } else {
          addToast(
            'error',
            'Transaction failed',
            `Transaction failed. Hash: ${resp.hash}`
          );
        }

        await refreshFromChain();

        return resp;
      } catch (e) {
        console.error(e);
        updateTransactionStatus(pendingTx.hash, {
          status: 'failed',
          error: e.message,
          completedAt: new Date().toISOString()
        });
        addToast(
          'error',
          'Transaction failed',
          e.hash
            ? `Error: ${e.message}. Tx hash: ${e.hash}`
            : e.message || 'Unknown error'
        );
        throw e;
      }
    },
    [
      wallet.address,
      wallet.kit,
      contractId,
      addTransaction,
      updateTransactionStatus,
      addToast,
      refreshFromChain
    ]
  );

  const ctxValue = useMemo(
    () => ({
      contractId,
      setContractId,
      campaigns,
      setCampaigns,
      events,
      stats,
      transactions,
      addTransaction,
      updateTransactionStatus,
      guardedInvoke,
      addToast,
      NETWORK_PASSPHRASE,
      adminAddresses: ADMIN_ADDRESSES
    }),
    [
      contractId,
      campaigns,
      events,
      stats,
      transactions,
      addTransaction,
      updateTransactionStatus,
      guardedInvoke,
      addToast
    ]
  );

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <AppContext.Provider value={ctxValue}>
      <div className="flex h-screen bg-slate-950 text-slate-100">
        <Sidebar open={sidebarOpen} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Navbar onToggleSidebar={() => setSidebarOpen((o) => !o)} />
          <main className="flex-1 overflow-y-auto">
            <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-8">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/campaigns" element={<Campaigns />} />
                <Route path="/campaign/:id" element={<CampaignDetail />} />
                <Route path="/create" element={<CreateCampaign />} />
                <Route path="/activity" element={<Activity />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </div>
          </main>
        </div>
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </div>
    </AppContext.Provider>
  );
}

export default function App() {
  return (
    <WalletProvider>
      <AppShell />
    </WalletProvider>
  );
}

