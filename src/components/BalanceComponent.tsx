import React, { useCallback, useEffect, useState } from 'react';
import { useMinedTransactionAPI } from '@/hooks/useMinedTransactionAPI';
import { useChainStore } from '@/store/chainStore';
import { Balance } from '@/constants/balances';
import { BalanceQueryCriteria } from '@/hooks/BalanceQueryCriteria';

// Helper function to format balance
function formatBalance(balance: string): string {
  const balanceValue = balance.startsWith('0x') ? BigInt(balance) : BigInt(balance);
  // Convert from wei to RSOL (divide by 10^18)
  const divisor = BigInt('1000000000000000000'); // 10^18
  const rsolValue = balanceValue / divisor;
  const remainder = balanceValue % divisor;
  
  // If there's a remainder, show decimal places
  if (remainder === BigInt(0)) {
    return `${rsolValue} RSOL`;
  } else {
    // Calculate decimal part (up to 4 decimal places)
    const decimalPart = (Number(remainder) / Number(divisor)).toFixed(4).substring(2).replace(/0+$/, '');
    return `${rsolValue}.${decimalPart} RSOL`;
  }
}

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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

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
      identifier: { latest: true, page_idx: currentPage },
      limit: { limit: 25 },
    };
    fetchBalancesfromAPIWithCriteria(criteria)
      .then((balances) => {
        setBalances(balances);
        setHasMore(balances.length === 25);
      })
      .catch(() => {
        setError('Failed to load balances');
        setBalances([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [chainId, currentPage]);

  if (loading) return <div>Loading balances...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!balances.length) return <div>No balances found.</div>;

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
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
                  {bal.balance ? formatBalance(bal.balance) : '-'}
                </td>
                <td className="p-2 border">{bal.chain_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-start gap-4 border-t pt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg border ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Previous
        </button>

        <span className="text-sm text-gray-600 px-4">
          Page {currentPage + 1}
        </span>

        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className={`px-4 py-2 rounded-lg border ${
            !hasMore
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
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
      {/* Chain ID */}
      <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
        <span className="font-semibold">Chain ID</span>
        <span className="font-mono break-all text-right">{balance.chain_id}</span>
      </div>

      {/* Address */}
      <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
        <span className="font-semibold">Address</span>
        <span className="font-mono break-all text-right">
          <a
            href={`/balance/${balance.address}`}
            className="text-blue-600 hover:underline"
          >
            {balance.address}
          </a>
        </span>
      </div>

      {/* Balance */}
      <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
        <span className="font-semibold">Balance</span>
        <span className="font-mono break-all text-right">{balance.balance ? formatBalance(balance.balance) : '-'}</span>
      </div>
    </div>
  );
}
