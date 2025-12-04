import React, { useCallback, useEffect, useState } from 'react';
import { Block } from '@/constants/blocks';
import { Tabs } from '@/components/Tabs';
import { useMinedBlocks } from '@/components/Blocks';
import { useChainStore } from "@/store/chainStore";
import { BlockQueryCriteria } from '@/hooks/BlockQueryCriteria';


const BOX_H = 600;

type BlockType = 'mined' 

interface BlockHook {
  fetchBlocksfromAPIWithCriteria: (criteria: BlockQueryCriteria) => Promise<Block[]>;

}

interface BlockTypeConfig {
  label: string;
  useHook: () => BlockHook;
  emptyStateMessage: string;
}


const BLOCK_TYPE_CONFIGS: Record<BlockType, BlockTypeConfig> = {
  mined: {
    label: 'Mined',
    useHook: useMinedBlocks,
    emptyStateMessage: 'No blocks available for the selected chain',
  }

};

interface BlockListProps {
  onSelect: (block: Block) => void;
  onTabChange?: (blockType: BlockType) => void;

}

// Internal component that gets remounted when activeTab changes
function BlockListContent({
  activeTab,
  onSelect,
  searchQuery,
}: {
  activeTab: BlockType;
  onSelect: (block: Block) => void;
  searchQuery: string;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const activeConfig = BLOCK_TYPE_CONFIGS[activeTab];
  const { chainId } = useChainStore();

  const {
    fetchBlocksfromAPIWithCriteria,

  } = activeConfig.useHook();

  const [apiBlocks, setApiBlocks] = useState<Block[]>([]);
  function fetchData() {
    //console.log('Fetching blocks for chainId:', chainId);
    if (fetchBlocksfromAPIWithCriteria) {
      const criteria: BlockQueryCriteria = {
        filter: {
          chain_id: chainId,
        },
        identifier: { latest: true },
        limit: {
          limit: 25,
        }
      };


      fetchBlocksfromAPIWithCriteria(criteria).then((txs) => {
        //console.log('Fetched blocks from API (raw):', txs);
        setApiBlocks(txs);
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

      // Load new blocks when user scrolled 80% of the list
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


  // Show empty state only if both loadedBlocks and apiBlocks are empty
  if (apiBlocks.length === 0) {
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
  <th className="p-2 border sticky top-0 bg-gray-100">Block Number</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Block Hash</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Parent Hash</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Ommers Hash</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Beneficiary</th>
  <th className="p-2 border sticky top-0 bg-gray-100">State Root</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Transactions Root</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Receipts Root</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Logs Bloom</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Difficulty</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Gas Limit</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Gas Used</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Timestamp</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Extra Data</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Mix Hash</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Nonce</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Base Fee Per Gas</th>
  <th className="p-2 border sticky top-0 bg-gray-100">Chain ID</th>
</tr>
        </thead>
        <tbody>
          {apiBlocks.length === 0 ? null : apiBlocks.map((blk) => (
            <tr key={blk.block_number} className="border-b hover:bg-gray-50 cursor-pointer">
              <td className="p-2 border">
                {blk.block_number ? (
                  <a
                    href={`/block/${blk.block_number}`}
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {blk.block_number}
                  </a>
                ) : ''}
              </td>
                <td className="p-2 border">
                {blk.block_hash ? (
                  <a
                  href={`/block/${blk.block_hash}`}
                  className="text-blue-600 underline hover:text-blue-800"
                  >
                  {blk.block_hash}
                  </a>
                ) : ''}
                </td>
              <td className="p-2 border">{blk.parent_hash}</td>
              <td className="p-2 border">{blk.ommers_hash}</td>
              <td className="p-2 border">{blk.beneficiary}</td>
              <td className="p-2 border">{blk.state_root}</td>
              <td className="p-2 border">{blk.transactions_root}</td>
              <td className="p-2 border">{blk.receipts_root}</td>
              <td className="p-2 border">{blk.logs_bloom}</td>
              <td className="p-2 border">{blk.difficulty}</td>
              <td className="p-2 border">{blk.gas_limit}</td>
              <td className="p-2 border">{blk.gas_used}</td>
              <td className="p-2 border">{blk.timestamp}</td>
              <td className="p-2 border">{blk.extra_data}</td>
              <td className="p-2 border">{blk.mix_hash}</td>
              <td className="p-2 border">{blk.nonce}</td>
              <td className="p-2 border">{blk.base_fee_per_gas}</td>
              <td className="p-2 border">{blk.chain_id}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* ...existing indicators... */}
    </div>
  );
}

export function BlockList({
  onSelect,
  onTabChange
}: BlockListProps) {
  const [activeTab, setActiveTab] = useState<BlockType>('mined');
  const [searchQuery, setSearchQuery] = useState('');

  const tabOptions: { label: string; value: BlockType }[] = Object.entries(
    BLOCK_TYPE_CONFIGS
  ).map(([key, config]) => ({ label: config.label, value: key as BlockType }));

  useEffect(() => {
    onTabChange?.(activeTab);
  }, [activeTab, onTabChange]);


  const handleTabChange = (newTab: BlockType) => {
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

      <BlockListContent
        key={activeTab}
        activeTab={activeTab}
        onSelect={onSelect}
        searchQuery={searchQuery}
      />
    </div>
  );
}