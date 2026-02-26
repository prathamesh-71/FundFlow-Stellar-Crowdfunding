# FundFlow-Stellar-Crowdfunding
FundFlow is a modern SaaS-style crowdfunding platform built on the Stellar Testnet using Soroban smart contracts. Inspired by platforms like Kickstarter and GoFundMe, FundFlow allows users to create fundraising campaigns, donate using multi-wallet support, and track contributions in real time.

# FundFlow – Stellar Testnet Crowdfunding (Yellow Belt)

FundFlow is a production-style SaaS crowdfunding dApp (Kickstarter / GoFundMe vibe) running on **Stellar Testnet** with a **Soroban** smart contract backend and a **React + Vite + Tailwind** frontend.

It is designed to look and feel like a real product, not a one-page demo.

---

## Feature Checklist (Yellow Belt Requirements)

- **Modern SaaS UI**
  - Sticky top navbar with brand, Testnet badge, wallet status, connect/disconnect
  - Collapsible left sidebar with active link highlighting
  - Main content area with max-width, responsive layout (mobile/tablet/desktop)
  - Cards, soft shadows, rounded-xl, subtle borders, hover states
  - Basic skeleton-style empty states and toast notifications for success/error

- **Routing (7+ pages)**
  - `/` **Home**: hero, CTAs, feature cards, stats section
  - `/campaigns` **Campaign Listing**: search, filter tabs (All / Trending / Active / Closed)
  - `/campaign/:id` **Campaign Detail**: full info, progress, donors, donate, owner close button
  - `/create` **Create Campaign**: validated form, tx status, redirect on success
  - `/activity` **Activity Feed**: live Soroban event stream (3–5s polling)
  - `/transactions` **Transactions**: local tx history with status badges and explorer links
  - `/settings` **Settings**: contract address, network, RPC, Horizon, connected wallet info
  - Owner/admin actions exposed where owner == connected wallet (close campaigns)

- **Wallet Integration (StellarWalletsKit)**
  - Uses `@creit.tech/stellar-wallets-kit`
  - Supports **Freighter** and **Albedo**
  - Wallet selection modal with wallet names/logos
  - Detects compatible wallets; handles missing / rejected connections
  - Connect / disconnect flow, short address in navbar

- **Soroban Smart Contract**
  - Rust contract `FundFlowCrowdfund` with:
    - `Campaign` struct: `campaign_id`, `title`, `description`, `goal`, `raised`, `owner`, `is_active`
    - Functions: `create_campaign`, `donate`, `get_campaign`, `list_campaigns`, `close_campaign`
  - Events:
    - `CampaignCreated(owner, campaignId, goal)`
    - `DonationMade(donor, campaignId, amount, newRaised)`
    - `CampaignClosed(campaignId)`

- **Frontend Contract Integration**
  - Uses `@stellar/stellar-sdk` Soroban RPC:
    - Writes via `invokeContractMethod(...)` helper (prepare, sign, submit, poll)
    - Reads via `simulateTransaction` for `list_campaigns` / `get_campaign`
    - Live event polling via RPC `getEvents` every ~4 seconds
  - UI updates:
    - Campaign listing, detail, home stats, and activity feed update from events
    - Transaction history with pending/success/fail and StellarExpert links

- **Error Handling**
  - **Wallet not detected**: friendly toast when no compatible wallets
  - **User rejected connection**: clear message and retry hint
  - **User rejected signing**: transaction failure toast
  - **Insufficient XLM balance**: checked via Horizon before create/donate
  - **Contract not configured / network issues**: settings + error toasts
  - **Generic transaction failures**: show reason + tx hash (when available)

---

## Tech Stack

- **Frontend**
  - React 18 (Vite)
  - `react-router-dom` for routing
  - Tailwind CSS for modern SaaS styling
  - Custom toast / notification system
  - LocalStorage for contract address and transaction history

- **Wallets & Blockchain**
  - `@creit.tech/stellar-wallets-kit` (Freighter + Albedo)
  - `@stellar/stellar-sdk` for Soroban RPC & contract calls
  - Stellar Testnet (Soroban RPC + Horizon Testnet)

- **Smart Contract**
  - Rust + `soroban-sdk` contract implementing crowdfunding logic

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Soroban Contract – Build & Deploy (Testnet)

From the Rust contract directory (the one with `Cargo.toml` and `src/lib.rs`):

### 1. Build optimized WASM

```bash
soroban contract build \
  --package fundflow-crowdfund \
  --target wasm32-unknown-unknown \
  --release
```

### 2. Configure Testnet network (once)

```bash
soroban config network add testnet \
  --rpc-url https://soroban-testnet.stellar.org \
  --network-passphrase "Test SDF Network ; September 2015"
```

### 3. Configure your identity (funded account)

Generate a new identity or add an existing one:

```bash
# Generate new
soroban config identity generate fundflow-owner

# OR add existing secret key
# soroban config identity add fundflow-owner --secret-key SCXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Fund the corresponding public key using the Testnet Friendbot.

### 4. Deploy the contract

```bash
soroban contract deploy \
  --wasm target/wasm32-unknown-unknown/release/fundflow_crowdfund.wasm \
  --source fundflow-owner \
  --network testnet
```

Note the **contract id** printed by the command:

```bash
Deployed contract: CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Set this in the FundFlow UI:

- Go to `/settings`
- Paste into **Contract address (ID)** and click **Save**

For reference in your docs:

```bash
CONTRACT_ID=CXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### 5. (Optional) Verify a contract call

Once deployed and configured, create a campaign from the UI and note the transaction hash from the **Transactions** page or the toast message.

You can then include a placeholder like:

```bash
TX_HASH=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

Use [`StellarExpert Testnet`](https://stellar.expert/explorer/testnet) to inspect the transaction.

---

## Frontend Usage Notes

### Wallets

- Install **Freighter** or **Albedo** in your browser
- Click **Connect Wallet** in the top navbar
- When the Stellar Wallets Kit modal appears, choose your wallet
- Approve the connection inside your wallet

Errors handled:

- No compatible wallets installed → user-friendly toast
- User rejects connection → toast with retry instructions
- Wallet locked / unreachable → toast with explanation

### Creating a Campaign

1. Connect a Testnet wallet with enough XLM.
2. Navigate to `/create`.
3. Fill in **Title**, **Description**, **Goal (XLM)**.
4. Submit — the app:
   - Checks your XLM balance via Horizon first
   - Prepares & sends a Soroban transaction
   - Tracks status as `pending` → `success` or `failed`
5. On success, it re-reads campaigns and redirects to `/campaign/:id`.

### Donating to a Campaign

1. Connect a wallet.
2. Go to `/campaigns` or a specific `/campaign/:id`.
3. Click **Donate** and enter an amount.
4. The app checks your balance, then calls the `donate` contract function.
5. The **Activity** feed and progress bars update live via event polling.

### Closing a Campaign (Owner Only)

- If the connected wallet is the `owner`, the **Close Campaign** button appears on the detail page.
- On success, the campaign status changes to **Closed** and donations are disabled.

---

## Screenshots

Add your own screenshots after running the app:

- Wallet modal: `![alt text](<Screenshots/Screenshot 2026-02-27 012048.png>)`
- Transactions : `![./screenshots/campaigns.png](<Screenshots/Screenshot 2026-02-27 012228.png>)`
- Contract address : `![./screenshots/activity.png](<Screenshots/Screenshot 2026-02-27 012332.png>)`

These paths are placeholders; create the `screenshots` folder and add images as needed.

---

## Optional Demo Link

If you deploy FundFlow (e.g., on Vercel or Netlify), document it here:

- Demo: `https://your-demo-url.example.com` (placeholder)

---

## Folder Structure

```text
fundflow-crowdfunding/
  package.json
  vite.config.js
  postcss.config.cjs
  tailwind.config.cjs
  index.html
  src/
    main.jsx
    App.jsx
    index.css
    lib/
      soroban.js
      wallet.js
    components/
      Navbar.jsx
      Sidebar.jsx
      CampaignCard.jsx
      DonationModal.jsx
      ProgressBar.jsx
      TxStatusBadge.jsx
      Toast.jsx
    pages/
      Home.jsx
      Campaigns.jsx
      CampaignDetail.jsx
      CreateCampaign.jsx
      Activity.jsx
      Transactions.jsx
      Settings.jsx
  contract/
    Cargo.toml
    src/
      lib.rs
```

---

## Suggested Commits

- `Add multi-wallet connection and SaaS layout`
- `Integrate Soroban crowdfunding contract and real-time events`

