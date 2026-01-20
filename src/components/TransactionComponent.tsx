import React, { useCallback, useEffect, useState } from 'react';
import { Transaction } from '@/constants/transactions';
import { Tabs } from '@/components/Tabs';
import { useChainStore } from "@/store/chainStore";
import { TxQueryCriteria } from '@/hooks/TxnQueryCriteria';
import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";

const solscanBase = process.env.NEXT_PUBLIC_SOLSCAN_URL;
const solscanCluster = process.env.NEXT_PUBLIC_SOLSCAN_CLUSTER;

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
  const [activeTab, setActiveTab] = useState<'mined'>('mined');
  const [searchQuery, setSearchQuery] = useState('');
  const tabOptions = [
    { label: 'Mined', value: 'mined' as const },
  ];
  useEffect(() => { onTabChange?.(activeTab); }, [activeTab, onTabChange]);
  const handleTabChange = (newTab: 'mined') => { setActiveTab(newTab); onTabChange?.(newTab); };
  return (
    <div className="w-full flex flex-col gap-2" style={{ height: 650 }}>
      <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={handleTabChange} className="mb-4" />
      <TransactionListContent key={activeTab} activeTab={activeTab} onSelect={onSelect} searchQuery={searchQuery} />
    </div>
  );
}

function TransactionListContent({ activeTab, onSelect, searchQuery }: {
  activeTab: 'mined';
  onSelect: (transaction: Transaction) => void;
  searchQuery: string;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const activeConfig = {
    mined: { label: 'Mined', useHook: useMinedTransactions, emptyStateMessage: 'No transactions available for the selected chain' },
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
            <th className="p-2 border sticky top-0 bg-gray-100">Max Priority Fee</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Max Fee</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Solana Slot Number</th>
          </tr>
        </thead>
        <tbody>
          {apiTransactions.map((tx) => (
            <tr key={tx.transactionHash} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {tx.transactionHash ? (
                  <a href={`/transaction/${tx.transactionHash}`} className="text-blue-600 underline hover:text-blue-800">{tx.transactionHash}</a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.transactionNonce ?? ''}</td>
              <td className="p-2 border">{tx.blockNumber ?? ''}</td>
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
              <td className="p-2 border">{tx.maxPriorityFeePerGas ?? ''}</td>
              <td className="p-2 border">{tx.maxFeePerGas ?? ''}</td>
              <td className="p-2 border">{tx.solanaSlotNumber ?? ''}</td>
            
              
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Simplified transaction list for block page
export function BlockTransactionList({ blockNumber }: { blockNumber?: number }) {
  const { chainId } = useChainStore();
  const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactions();
  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  function fetchData() {
    if (fetchTransactionsfromAPIWithCriteria) {
      const criteria: TxQueryCriteria = {
        filter: { 
          chain_id: chainId,
          block_no: blockNumber,
        },
        parts: { all: true },
        identifier: { latest: false },
        limit: { limit: 50 },
        tx_type: { tx_type: 'all' },
      };
      console.log(criteria);
      setLoading(true);
      fetchTransactionsfromAPIWithCriteria(criteria)
        .then((txs) => { setApiTransactions(txs); })
        .finally(() => { setLoading(false); });
    }
  }

  useEffect(() => { fetchData(); }, [chainId, blockNumber]);

  if (loading) {
    return <div className="text-center py-4 text-gray-500">Loading transactions...</div>;
  }

  if (apiTransactions.length === 0) {
    return <div className="text-center py-4 text-gray-500">No transactions found for this block</div>;
  }

  return (
    <div className="max-h-[60vh] overflow-y-auto">
      <table className="w-full text-sm border rounded-lg shadow bg-white">
        <thead>
          <tr>
            <th className="p-2 border sticky top-0 bg-gray-100">Hash</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Nonce</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Type</th>
            <th className="p-2 border sticky top-0 bg-gray-100">From</th>
            <th className="p-2 border sticky top-0 bg-gray-100">To</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Value</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Gas</th>
          </tr>
        </thead>
        <tbody>
          {apiTransactions.map((tx) => (
            <tr key={tx.transactionHash} className="border-b hover:bg-gray-50">
               <td className="p-2 border">
                {tx.transactionHash ? (
                  <a href={`/transaction/${tx.transactionHash}`} className="text-blue-600 underline hover:text-blue-800">{tx.transactionHash}</a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.transactionNonce ?? ''}</td>
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
              <td className="p-2 border">{tx.value ?? ''}</td>
              <td className="p-2 border">{tx.gas ?? ''}</td>
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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        {Object.entries(transaction)
          .filter(([key]) => key !== 'solanaTxnMappings' && key !== 'input')
          .map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold">{key}</span>
              <span>{String(value)}</span>
            </div>
          ))}
      </div>
      
      {transaction.input && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg">Input Data</h3>
          <div className="border rounded p-3 bg-gray-50 max-w-full overflow-x-auto">
            <pre className="text-sm break-all whitespace-pre-wrap font-mono">{transaction.input}</pre>
          </div>
        </div>
      )}
      
      {transaction.solanaTxnMappings && transaction.solanaTxnMappings.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="font-semibold text-lg">Solana Transactions</h3>
          <div className="border rounded p-3 bg-gray-50">
            {transaction.solanaTxnMappings.map((mapping, index) => (
              <div key={index} className="flex flex-col gap-2 py-3 border-b last:border-b-0">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm text-gray-700">Signature #{index + 1}</span>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    Slot: {mapping.slot_number}
                  </span>
                </div>
                <a
                  href={`${solscanBase}/tx/${mapping.sol_signature}?cluster=${solscanCluster}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800 text-sm break-all font-mono"
                >
                  {mapping.sol_signature}
                </a>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
