import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react';
import {
  AlbedoModule,
  FreighterModule,
  StellarWalletsKit,
  WalletNetwork
} from '@creit.tech/stellar-wallets-kit';
import { HORIZON_URL } from './soroban.js';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [kit] = useState(
    () =>
      new StellarWalletsKit({
        network: WalletNetwork.TESTNET,
        selectedWalletId: null,
        modules: [new FreighterModule(), new AlbedoModule()]
      })
  );

  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  const shortAddress = useMemo(() => {
    if (!address) return '';
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  }, [address]);

  const resetError = useCallback(() => setError(null), []);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      // Open the built-in modal so the user can pick between
      // Freighter, Albedo (and any other configured wallets).
      await kit.openModal({
        onWalletSelected: async (option) => {
          await kit.setWallet(option.id);
          try {
            const { address: addr } = await kit.getAddress();
            setAddress(addr);
          } catch (e) {
            console.error(e);
            setError(
              new Error(
                'User rejected connection or wallet is locked. Please try again.'
              )
            );
          }
        }
      });
    } catch (e) {
      console.error(e);
      if (e?.message?.toLowerCase().includes('rejected')) {
        setError(new Error('Connection was rejected by the user.'));
      } else {
        setError(e);
      }
    } finally {
      setConnecting(false);
    }
  }, [kit]);

  const disconnect = useCallback(() => {
    setAddress(null);
    kit.setWallet(null);
  }, [kit]);

  const checkBalance = useCallback(
    async (minXlm) => {
      if (!address) throw new Error('Wallet not connected');

      const res = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!res.ok) {
        throw new Error('Failed to fetch account balance from Horizon.');
      }
      const data = await res.json();
      const balanceObj =
        data.balances.find((b) => b.asset_type === 'native') || {};
      const balance = parseFloat(balanceObj.balance || '0');
      if (Number.isNaN(balance) || balance < minXlm) {
        const err = new Error(
          `Insufficient XLM balance. Required at least ${minXlm} XLM.`
        );
        err.code = 'INSUFFICIENT_BALANCE';
        throw err;
      }
      return balance;
    },
    [address]
  );

  const value = useMemo(
    () => ({
      kit,
      address,
      shortAddress,
      connecting,
      error,
      resetError,
      connect,
      disconnect,
      checkBalance
    }),
    [
      kit,
      address,
      shortAddress,
      connecting,
      error,
      resetError,
      connect,
      disconnect,
      checkBalance
    ]
  );

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return ctx;
}

