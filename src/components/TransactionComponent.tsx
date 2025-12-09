import React, { useCallback, useEffect, useState } from 'react';
import { Transaction } from '@/constants/transactions';
import { Tabs } from '@/components/Tabs';
import { useChainStore } from "@/store/chainStore";
import { TxQueryCriteria } from '@/hooks/TxnQueryCriteria';
import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";

// Hook for fetching transactions
export const useMinedTransactions = () => {
  const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactionAPI();
  return {
    fetchTransactionsfromAPIWithCriteria,
  };
};

// List component
export function TransactionList({ onSelect, onTabChange }: {
  onSelect: (transaction: Transaction) => void;
  onTabChange?: (transactionType: 'mined' | 'pending') => void;
}) {
  const [activeTab, setActiveTab] = useState<'mined' | 'pending'>('mined');
  const [searchQuery, setSearchQuery] = useState('');
  const tabOptions = [
    { label: 'Mined', value: 'mined' as const },
    { label: 'Pending', value: 'pending' as const },
  ];
  useEffect(() => { onTabChange?.(activeTab); }, [activeTab, onTabChange]);
  const handleTabChange = (newTab: 'mined' | 'pending') => { setActiveTab(newTab); onTabChange?.(newTab); };
  return (
    <div className="w-full flex flex-col gap-2" style={{ height: 650 }}>
      <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={handleTabChange} className="mb-4" />
      <TransactionListContent key={activeTab} activeTab={activeTab} onSelect={onSelect} searchQuery={searchQuery} />
    </div>
  );
}

function TransactionListContent({ activeTab, onSelect, searchQuery }: {
  activeTab: 'mined' | 'pending';
  onSelect: (transaction: Transaction) => void;
  searchQuery: string;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const activeConfig = {
    mined: { label: 'Mined', useHook: useMinedTransactions, emptyStateMessage: 'No transactions available for the selected chain' },
    pending: { label: 'Pending', useHook: useMinedTransactions, emptyStateMessage: 'No pending transactions available' },
  }[activeTab];
  const { chainId } = useChainStore();
  const { fetchTransactionsfromAPIWithCriteria } = activeConfig.useHook();
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  function fetchData() {
    if (fetchTransactionsfromAPIWithCriteria) {
      const criteria: TxQueryCriteria = {
        filter: { chain_id: chainId },
        parts: { all: true },
        identifier: { latest: true },
        limit: { limit: 25 },
        tx_type: { tx_type: 'all' },
      };
      fetchTransactionsfromAPIWithCriteria(criteria).then((txs) => { setApiTransactions(txs); });
    }
  }
  useEffect(() => { fetchData(); }, [chainId]);
  const handleScroll = useCallback((e: Event) => {
    const el = e.currentTarget as HTMLElement;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    const shouldLoadMore = scrollPercentage >= 0.8;
    if (shouldLoadMore && !atBottom) { setAtBottom(true); } else if (!shouldLoadMore && atBottom) { setAtBottom(false); }
  }, [atBottom]);
  const setBoxRef = useCallback((node: HTMLDivElement | null) => { if (node) { node.addEventListener('scroll', handleScroll, { passive: true }); } }, [handleScroll]);
  if (apiTransactions.length === 0) {
    return (<div className="text-center py-4 text-gray-500">{activeConfig.emptyStateMessage}</div>);
  }
  return (
    <div ref={setBoxRef} className="max-h-[60vh] overflow-y-auto">
      <table className="w-full text-sm border rounded-lg shadow bg-white">
        <thead>
          <tr>
            <th className="p-2 border sticky top-0 bg-gray-100">Hash</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Nonce</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Block Number</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Type</th>
            <th className="p-2 border sticky top-0 bg-gray-100">From</th>
            <th className="p-2 border sticky top-0 bg-gray-100">To</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Block Hash</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Value</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Gas</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Gas Price</th>
          </tr>
        </thead>
        <tbody>
          {apiTransactions.map((tx) => (
            <tr key={tx.hash} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {tx.hash ? (
                  <a href={`/transaction/${tx.hash}`} className="text-blue-600 underline hover:text-blue-800">{tx.hash}</a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.nonce ?? ''}</td>
              <td className="p-2 border">{tx.blockNumber ? parseInt(tx.blockNumber, 16) : ''}</td>
              <td className="p-2 border">{tx.transactionType ?? ''}</td>
              <td className="p-2 border">
                {tx.from ? (
                  <a href={`/balance/${tx.from}`} className="text-blue-600 underline hover:text-blue-800">{tx.from}</a>
                ) : ''}
              </td>
              <td className="p-2 border">
                {tx.to ? (
                  <a href={`/balance/${tx.to}`} className="text-blue-600 underline hover:text-blue-800">{tx.to}</a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.blockHash ?? ''}</td>
              <td className="p-2 border">{tx.value ?? ''}</td>
              <td className="p-2 border">{tx.gas ?? ''}</td>
              <td className="p-2 border">{tx.gasPrice ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Details component
export function TransactionDetails({ hashcode }: { hashcode: string }) {
  const { chainId } = useChainStore();
  const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactions();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!hashcode || !chainId) {
      setTransaction(null);
      setLoading(false);
      setError('Missing hashcode or chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: TxQueryCriteria = {
      filter: { chain_id: chainId },
      parts: { all: true },
      identifier: { tx_hash: hashcode },
      limit: { limit: 25 },
    };
    fetchTransactionsfromAPIWithCriteria(criteria)
      .then((txs) => { setTransaction(txs.length > 0 ? txs[0] : null); })
      .catch(() => { setError('Failed to load transaction'); setTransaction(null); })
      .finally(() => { setLoading(false); });
  }, [hashcode, chainId]);
  if (loading) return <div>Loading transaction...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!transaction) return <div>No transaction found for this hash.</div>;
  return (
    <div className="flex flex-col gap-2">
      {Object.entries(transaction).map(([key, value]) => (
        <div key={key} className="flex justify-between">
          <span className="font-semibold">{key}</span>
          <span>{String(value)}</span>
        </div>
      ))}
    </div>
  );
}
