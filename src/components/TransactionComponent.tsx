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
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
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
        identifier: { latest: true, page_idx: currentPage },
        limit: { limit: 25 },
        tx_type: { tx_type: 'all' },
      };
      fetchTransactionsfromAPIWithCriteria(criteria).then((txs) => {
        setApiTransactions(txs);
        setHasMore(txs.length === 25);
      });
    }
  }
  useEffect(() => { fetchData(); }, [chainId, currentPage]);
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
      <div ref={setBoxRef} className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm border rounded-lg shadow bg-white">
          <thead>
            <tr>
              <th className="p-2 border sticky top-0 bg-gray-100">Hash</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Block Number</th>
              <th className="p-2 border sticky top-0 bg-gray-100">From</th>
              <th className="p-2 border sticky top-0 bg-gray-100">To</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Value</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Type</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Gas</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Exit Code</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Solana Slot</th>
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
                <td className="p-2 border">
                  {tx.blockNumber ? (
                    <a href={`/block/${tx.blockNumber}`} className="text-blue-600 underline hover:text-blue-800">{tx.blockNumber}</a>
                  ) : ''}
                </td>
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
                <td className="p-2 border">{tx.value}</td>
                <td className="p-2 border">{tx.transactionType}</td>
                <td className="p-2 border">{tx.gas}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    tx.exitCode === 0 ? 'bg-green-200' : 'bg-red-200'
                  }`}>
                    {tx.exitCode}
                  </span>
                </td>
                <td className="p-2 border">
                  {tx.solanaSlotNumber ? (
                    <a
                      href={`${solscanBase}/block/${tx.solanaSlotNumber}?cluster=${solscanCluster}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {tx.solanaSlotNumber}
                    </a>
                  ) : ''}
                </td>
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

// Simplified transaction list for block page
export function BlockTransactionList({ blockNumber, blockHash }: { blockNumber?: number; blockHash?: string }) {
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
          block_hash: blockHash,
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

  useEffect(() => { fetchData(); }, [chainId, blockNumber, blockHash]);

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
        {/* Chain ID */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Chain ID</span>
          <span className="font-mono break-all text-right">{transaction.chainId}</span>
        </div>

        {/* Transaction Hash */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Transaction Hash</span>
          <span className="font-mono break-all text-right">
            <a href={`/transaction/${transaction.transactionHash}`} className="text-blue-600 hover:underline">
              {transaction.transactionHash}
            </a>
          </span>
        </div>

        {/* Block Number */}
        {transaction.blockNumber && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Block Number</span>
            <span className="font-mono break-all text-right">
              <a href={`/block/${transaction.blockNumber}`} className="text-blue-600 hover:underline">
                {transaction.blockNumber}
              </a>
            </span>
          </div>
        )}

        {/* Block Hash */}
        {transaction.blockHash && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Block Hash</span>
            <span className="font-mono break-all text-right">
              <a href={`/block/${transaction.blockHash}`} className="text-blue-600 hover:underline">
                {transaction.blockHash}
              </a>
            </span>
          </div>
        )}

        {/* Transaction Index */}
        {transaction.transactionIndex !== null && transaction.transactionIndex !== undefined && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Transaction Index</span>
            <span className="font-mono break-all text-right">{transaction.transactionIndex}</span>
          </div>
        )}

        {/* From */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">From</span>
          <span className="font-mono break-all text-right">
            <a href={`/balance/${transaction.from}`} className="text-blue-600 hover:underline">
              {transaction.from}
            </a>
          </span>
        </div>

        {/* To */}
        {transaction.to && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">To</span>
            <span className="font-mono break-all text-right">
              <a href={`/balance/${transaction.to}`} className="text-blue-600 hover:underline">
                {transaction.to}
              </a>
            </span>
          </div>
        )}

        {/* Value */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Value</span>
          <span className="font-mono break-all text-right">{transaction.value}</span>
        </div>

        {/* Gas */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Gas</span>
          <span className="font-mono break-all text-right">{transaction.gas}</span>
        </div>

        {/* Gas Price */}
        {transaction.gasPrice && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Gas Price</span>
            <span className="font-mono break-all text-right">{transaction.gasPrice}</span>
          </div>
        )}

        {/* Max Priority Fee Per Gas */}
        {transaction.maxPriorityFeePerGas && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Max Priority Fee Per Gas</span>
            <span className="font-mono break-all text-right">{transaction.maxPriorityFeePerGas}</span>
          </div>
        )}

        {/* Max Fee Per Gas */}
        {transaction.maxFeePerGas && (
          <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
            <span className="font-semibold">Max Fee Per Gas</span>
            <span className="font-mono break-all text-right">{transaction.maxFeePerGas}</span>
          </div>
        )}

        {/* Transaction Type */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Transaction Type</span>
          <span className="font-mono break-all text-right">{transaction.transactionType}</span>
        </div>

        {/* Tx Type */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Tx Type</span>
          <span className="font-mono break-all text-right">{transaction.txType}</span>
        </div>

        {/* Nonce */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Nonce</span>
          <span className="font-mono break-all text-right">{transaction.transactionNonce}</span>
        </div>

        {/* Exit Code */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Exit Code</span>
          <span className="font-mono break-all text-right">
            <span className={`px-2 py-1 rounded text-xs ${
              transaction.exitCode === 0 ? 'bg-green-200' : 'bg-red-200'
            }`}>
              {transaction.exitCode}
            </span>
          </span>
        </div>

        {/* Solana Slot Number */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Solana Slot Number</span>
          <span className="font-mono break-all text-right">
            <a
              href={`${solscanBase}/block/${transaction.solanaSlotNumber}?cluster=${solscanCluster}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {transaction.solanaSlotNumber}
            </a>
          </span>
        </div>

        {/* Tx Index */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Tx Index</span>
          <span className="font-mono break-all text-right">{transaction.txIndex}</span>
        </div>

        {/* Impersonated */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">Impersonated</span>
          <span className="font-mono break-all text-right">{transaction.impersonated ? 'Yes' : 'No'}</span>
        </div>

        {/* V, R, S (signature components) */}
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">V</span>
          <span className="font-mono break-all text-right">{transaction.v}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">R</span>
          <span className="font-mono break-all text-right">{transaction.r}</span>
        </div>
        <div className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1">
          <span className="font-semibold">S</span>
          <span className="font-mono break-all text-right">{transaction.s}</span>
        </div>
      </div>
      
      {/* Input Data */}
      {transaction.input && (
        <div className="flex flex-col gap-2">
          <h3 className="font-semibold text-lg">Input Data</h3>
          <div className="border rounded p-3 bg-gray-50 max-w-full overflow-x-auto">
            <pre className="text-sm break-all whitespace-pre-wrap font-mono">{transaction.input}</pre>
          </div>
        </div>
      )}
      
      {/* Solana Transaction Mappings */}
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
