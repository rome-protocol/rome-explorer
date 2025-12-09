import React, { useCallback, useEffect, useState } from 'react';
import { useMinedTransactionAPI } from '@/hooks/useMinedTransactionAPI';
import { useChainStore } from '@/store/chainStore';
import { Balance } from '@/constants/balances';
import { BalanceQueryCriteria } from '@/hooks/BalanceQueryCriteria';

// Hook for fetching balances
export const useMinedBalances = () => {
  const { fetchBalancesfromAPIWithCriteria } = useMinedTransactionAPI();
  return {
    fetchBalancesfromAPIWithCriteria,
  };
};

// List component
export function BalanceList() {
  const { chainId } = useChainStore();
  const { fetchBalancesfromAPIWithCriteria } = useMinedBalances();
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!chainId) {
      setBalances([]);
      setLoading(false);
      setError('Missing chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: BalanceQueryCriteria = {
      filter: { chain_id: chainId },
      identifier: { latest: true },
      limit: { limit: 25 },
    };
    fetchBalancesfromAPIWithCriteria(criteria)
      .then((balances) => setBalances(balances))
      .catch(() => {
        setError('Failed to load balances');
        setBalances([]);
      })
      .finally(() => setLoading(false));
  }, [chainId ]);

  if (loading) return <div>Loading balances...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!balances.length) return <div>No balances found.</div>;

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <table className="w-full text-sm border rounded-lg shadow bg-white">
        <thead>
          <tr>
            <th className="p-2 border sticky top-0 bg-gray-100">Address</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Balance</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Chain ID</th>
          </tr>
        </thead>
        <tbody>
          {balances.map((bal) => (
            <tr key={bal.address} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {bal.address ? (
                  <a
                    href={`/balance/${bal.address}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {bal.address}
                  </a>
                ) : ''}
              </td>
              <td className="p-2 border">
                {bal.balance && bal.balance.startsWith('0x')
                  ? BigInt(bal.balance).toString()
                  : bal.balance}
              </td>
              <td className="p-2 border">{bal.chain_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Details component
export function BalanceDetails({ address }: { address: string }) {
  const { chainId } = useChainStore();
  const { fetchBalancesfromAPIWithCriteria } = useMinedBalances();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !chainId) {
      setBalance(null);
      setLoading(false);
      setError('Missing address or chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: BalanceQueryCriteria = {
      filter: { chain_id: chainId },
      identifier: { address },
      limit: { limit: 1 },
    };
    fetchBalancesfromAPIWithCriteria(criteria)
      .then((balances) => setBalance(balances.length > 0 ? balances[0] : null))
      .catch(() => {
        setError('Failed to load balance');
        setBalance(null);
      })
      .finally(() => setLoading(false));
  }, [address, chainId ]);

  if (loading) return <div>Loading balance...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!balance) return <div>No balance found.</div>;

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(balance).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="font-semibold">{key}</span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
