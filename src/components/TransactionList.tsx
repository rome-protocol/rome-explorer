import React, { useCallback, useEffect, useState } from 'react';
import { Transaction } from '@/constants/transactions';
import { Tabs } from '@/components/Tabs';
import { useMinedTransactions } from '@/components/Transactions';
import { useChainStore } from "@/store/chainStore";
import { TxQueryCriteria } from '@/hooks/TxnQueryCriteria';


const BOX_H = 600;

type TransactionType = 'mined' | 'pending'

interface TransactionHook {
  fetchTransactionsfromAPIWithCriteria: (criteria: TxQueryCriteria) => Promise<Transaction[]>;

}

interface TransactionTypeConfig {
  label: string;
  useHook: () => TransactionHook;
  emptyStateMessage: string;
}


const TRANSACTION_TYPE_CONFIGS: Record<TransactionType, TransactionTypeConfig> = {
  mined: {
    label: 'Mined',
    useHook: useMinedTransactions,
    emptyStateMessage: 'No transactions available for the selected chain',
  },
  pending: {
    label: 'Pending',
    useHook: useMinedTransactions,// Placeholder hook
    emptyStateMessage: 'No pending transactions available',
  }

};

interface TransactionListProps {
  onSelect: (transaction: Transaction) => void;
  onTabChange?: (transactionType: TransactionType) => void;

}

// Internal component that gets remounted when activeTab changes
function TransactionListContent({
  activeTab,
  onSelect,
  searchQuery,
}: {
  activeTab: TransactionType;
  onSelect: (transaction: Transaction) => void;
  searchQuery: string;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const activeConfig = TRANSACTION_TYPE_CONFIGS[activeTab];
  const { chainId } = useChainStore();

  const {
    fetchTransactionsfromAPIWithCriteria,

  } = activeConfig.useHook();

  const [apiTransactions, setApiTransactions] = useState<Transaction[]>([]);
  function fetchData() {
    //console.log('Fetching transactions for chainId:', chainId);
    if (fetchTransactionsfromAPIWithCriteria) {
      const criteria: TxQueryCriteria = {
        filter: {
          chain_id: chainId,
        },
        parts: {
          all: true,
        },
        identifier: { latest: true },
        limit: {
          limit: 25,
        },
        tx_type: { tx_type: 'all' },
      };


      fetchTransactionsfromAPIWithCriteria(criteria).then((txs) => {
       // console.log('Fetched transactions from API (raw):', txs);
        setApiTransactions(txs);
      });
    }
  }


  // Call backend search when searchQuery changes
  useEffect(() => {

    fetchData();
  }, [chainId]);



  const handleScroll = useCallback(
    (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const { scrollTop, scrollHeight, clientHeight } = el;

      // Load new transactions when user scrolled 80% of the list
      // This is more natural behavior for web applications
      const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
      const shouldLoadMore = scrollPercentage >= 0.8;

      // Set state only if it changed
      if (shouldLoadMore && !atBottom) {
        setAtBottom(true);
      } else if (!shouldLoadMore && atBottom) {
        setAtBottom(false);
      }
    },
    [atBottom]
  );

  const setBoxRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (node) {
        node.addEventListener('scroll', handleScroll, { passive: true });
      }
    },
    [handleScroll]
  );


  // Show empty state only if both loadedTransactions and apiTransactions are empty
  if (apiTransactions.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">
        {activeConfig.emptyStateMessage}
      </div>
    );
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

            {/* Add more columns as needed */}
          </tr>
        </thead>
        <tbody>
          {apiTransactions.length === 0 ? null : apiTransactions.map((tx) => (
            <tr key={tx.hash} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {tx.hash ? (
                  <a
                    href={`/transaction/${tx.hash}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {tx.hash}
                  </a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.nonce ?? ''}</td>
              <td className="p-2 border">{tx.blockNumber ? parseInt(tx.blockNumber, 16) : ''}</td>
              <td className="p-2 border">{tx.transactionType ?? ''}</td>
              <td className="p-2 border">
                {tx.from ? (
                  <a
                    href={`/balance/${tx.from}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {tx.from}
                  </a>
                ) : ''}
              </td>
              <td className="p-2 border">
                {tx.to ? (
                  <a
                    href={`/balance/${tx.to}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {tx.to}
                  </a>
                ) : ''}
              </td>
              <td className="p-2 border">{tx.blockHash ?? ''}</td>
              <td className="p-2 border">{tx.value ?? ''}</td>
              <td className="p-2 border">{tx.gas ?? ''}</td>
              <td className="p-2 border">{tx.gasPrice ?? ''}</td>
              {/* Add more cells for other fields */}
            </tr>
          ))}
        </tbody>
      </table>
      {/* ...existing indicators... */}
    </div>
  );
}

export function TransactionList({
  onSelect,
  onTabChange
}: TransactionListProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('mined');
  const [searchQuery, setSearchQuery] = useState('');

  const tabOptions: { label: string; value: TransactionType }[] = Object.entries(
    TRANSACTION_TYPE_CONFIGS
  ).map(([key, config]) => ({ label: config.label, value: key as TransactionType }));

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);


  const handleTabChange = (newTab: TransactionType) => {
    setActiveTab(newTab);
    onTabChange?.(newTab);
  };

  return (
    <div className="w-full flex flex-col gap-2" style={{ height: BOX_H + 50 }}>
      <Tabs
        tabs={tabOptions}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className="mb-4"
      />

      <TransactionListContent
        key={activeTab}
        activeTab={activeTab}
        onSelect={onSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
}