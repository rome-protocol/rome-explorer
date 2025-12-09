import React, { useCallback, useEffect, useState } from 'react';
import { Balance } from '@/constants/balances';
import { Tabs } from '@/components/Tabs';
import { useMinedBalances } from '@/components/Balances';
import { useChainStore } from "@/store/chainStore";
import { BalanceQueryCriteria } from '@/hooks/BalanceQueryCriteria';


const BOX_H = 600;

type BalanceType = 'mined' 

interface BalanceHook {
  fetchBalancesfromAPIWithCriteria: (criteria: BalanceQueryCriteria) => Promise<Balance[]>;

}

interface BalanceTypeConfig {
  label: string;
  useHook: () => BalanceHook;
  emptyStateMessage: string;
}


const BALANCE_TYPE_CONFIGS: Record<BalanceType, BalanceTypeConfig> = {
  mined: {
    label: 'Mined',
    useHook: useMinedBalances,
    emptyStateMessage: 'No balances available for the selected chain',
  }

};

interface BalanceListProps {
  onSelect: (balance: Balance) => void;
  onTabChange?: (balanceType: BalanceType) => void;

}

// Internal component that gets remounted when activeTab changes
function BalanceListContent({
  activeTab,
  onSelect,
  searchQuery,
}: {
  activeTab: BalanceType;
  onSelect: (balance: Balance) => void;
  searchQuery: string;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const activeConfig = BALANCE_TYPE_CONFIGS[activeTab];
  const { chainId } = useChainStore();

  const {
    fetchBalancesfromAPIWithCriteria,

  } = activeConfig.useHook();

  const [apiBalances, setApiBalances] = useState<Balance[]>([]);
  function fetchData() {
    //console.log('Fetching balances for chainId:', chainId);
    if (fetchBalancesfromAPIWithCriteria) {
      const criteria: BalanceQueryCriteria = {
        filter: {
          chain_id: chainId,
        },
        identifier: { latest: true },
        limit: {
          limit: 25,
        }
      };


      fetchBalancesfromAPIWithCriteria(criteria).then((txs) => {
        //console.log('Fetched balances from API (raw):', txs);
        setApiBalances(txs);
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

      // Load new balances when user scrolled 80% of the list
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


  // Show empty state only if both loadedBalances and apiBalances are empty
  if (apiBalances.length === 0) {
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
            <th className="p-2 border sticky top-0 bg-gray-100">Address</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Balance</th>
            <th className="p-2 border sticky top-0 bg-gray-100">Chain ID</th>
</tr>
        </thead>
        <tbody>
          {apiBalances.length === 0 ? null : apiBalances.map((blk) => (
            <tr key={blk.address} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {blk.address ? (
                  <a
                    href={`/balance/${blk.address}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {blk.address}
                  </a>
                ) : ''}
              </td>
               
                <td className="p-2 border">{blk.balance}</td>
              <td className="p-2 border">{blk.chain_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ...existing indicators... */}
    </div>
  );
}

export function BalanceList({
  onSelect,
  onTabChange
}: BalanceListProps) {
  const [activeTab, setActiveTab] = useState<BalanceType>('mined');
  const [searchQuery, setSearchQuery] = useState('');

  const tabOptions: { label: string; value: BalanceType }[] = Object.entries(
    BALANCE_TYPE_CONFIGS
  ).map(([key, config]) => ({ label: config.label, value: key as BalanceType }));

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);


  const handleTabChange = (newTab: BalanceType) => {
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

      <BalanceListContent
        key={activeTab}
        activeTab={activeTab}
        onSelect={onSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
}