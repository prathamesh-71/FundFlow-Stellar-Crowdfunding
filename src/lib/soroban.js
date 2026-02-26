import {
  BASE_FEE,
  Contract,
  Networks,
  SorobanRpc,
  TransactionBuilder,
  nativeToScVal,
  scValToNative
} from '@stellar/stellar-sdk';

export const NETWORK_PASSPHRASE = Networks.TESTNET;
export const RPC_URL = 'https://soroban-testnet.stellar.org';
export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

const CONTRACT_ID_STORAGE_KEY = 'fundflow_contract_id';
const TX_HISTORY_STORAGE_KEY = 'fundflow_tx_history';

export function loadStoredContractId() {
  return localStorage.getItem(CONTRACT_ID_STORAGE_KEY) || '';
}

export function saveStoredContractId(id) {
  localStorage.setItem(CONTRACT_ID_STORAGE_KEY, id || '');
}

export function loadStoredTransactions() {
  try {
    const raw = localStorage.getItem(TX_HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredTransactions(txs) {
  localStorage.setItem(TX_HISTORY_STORAGE_KEY, JSON.stringify(txs));
}

export function getSorobanServer() {
  return new SorobanRpc.Server(RPC_URL, { allowHttp: true });
}

export async function invokeContractMethod({
  contractId,
  method,
  args,
  walletKit,
  address
}) {
  if (!contractId) {
    throw new Error('Contract ID is not configured.');
  }

  const server = getSorobanServer();
  const source = await server.getAccount(address);
  const contract = new Contract(contractId);

  let tx = new TransactionBuilder(source, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  tx = await server.prepareTransaction(tx);

  const { signedTxXdr } = await walletKit.signTransaction(tx.toXDR(), {
    address,
    networkPassphrase: NETWORK_PASSPHRASE
  });

  const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);

  const sendResp = await server.sendTransaction(signedTx);

  if (sendResp.errorResultXdr) {
    const e = new Error('Transaction failed');
    e.hash = sendResp.hash;
    e.raw = sendResp;
    throw e;
  }

  const hash = sendResp.hash;

  let finalStatus = 'pending';
  let result = null;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const txResult = await server.getTransaction(hash);

    if (txResult.status === SorobanRpc.GetTransactionStatus.SUCCESS) {
      finalStatus = 'success';
      result = txResult;
      break;
    }

    if (txResult.status === SorobanRpc.GetTransactionStatus.FAILED) {
      finalStatus = 'failed';
      result = txResult;
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return { hash, status: finalStatus, result };
}

async function simulateView({
  contractId,
  method,
  args
}) {
  const server = getSorobanServer();
  const contract = new Contract(contractId);

  const dummy = new SorobanRpc.Account(
    'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF',
    '0'
  );

  const tx = new TransactionBuilder(dummy, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const sim = await server.simulateTransaction(tx);
  if (!sim.result) {
    throw new Error('No simulation result');
  }

  return scValToNative(sim.result.retval);
}

export async function listCampaignIds(contractId) {
  if (!contractId) return [];
  const ids = await simulateView({
    contractId,
    method: 'list_campaigns',
    args: []
  });
  return ids || [];
}

export async function fetchCampaign(contractId, id) {
  if (!contractId) return null;
  const campaign = await simulateView({
    contractId,
    method: 'get_campaign',
    args: [nativeToScVal(id, { type: 'u32' })]
  });
  return campaign;
}

export async function fetchAllCampaigns(contractId) {
  const ids = await listCampaignIds(contractId);
  const campaigns = [];

  for (const id of ids) {
    try {
      const c = await fetchCampaign(contractId, id);
      if (c) campaigns.push(c);
    } catch (e) {
      console.error('Failed to fetch campaign', id, e);
    }
  }

  return campaigns;
}

export async function fetchRecentEvents(contractId) {
  if (!contractId) return [];

  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'getEvents',
    params: {
      startLedger: '0',
      filters: [
        {
          type: 'contract',
          contractIds: [contractId],
          topics: []
        }
      ],
      limit: 50
    }
  };

  const res = await fetch(RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await res.json();
  if (!data.result || !data.result.events) return [];

  return data.result.events;
}

