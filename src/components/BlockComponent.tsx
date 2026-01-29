import React, { useCallback, useEffect, useState } from 'react';
import { Block } from '@/constants/blocks';
import { Tabs } from '@/components/Tabs';
import { useChainStore } from "@/store/chainStore";
import { BlockQueryCriteria } from '@/hooks/BlockQueryCriteria';
import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";

const solscanBase = process.env.NEXT_PUBLIC_SOLSCAN_URL;
const solscanCluster = process.env.NEXT_PUBLIC_SOLSCAN_CLUSTER;

// Hook for fetching blocks
export const useMinedBlocks = () => {
  const { fetchBlocksfromAPIWithCriteria } = useMinedTransactionAPI();
  return {
    fetchBlocksfromAPIWithCriteria,
  };
};

// List component
export function BlockList({ onSelect, onTabChange }: {
  onSelect: (block: Block) => void;
  onTabChange?: (blockType: 'mined') => void;
}) {
  const [activeTab, setActiveTab] = useState<'mined'>('mined');
  const tabOptions = [{ label: 'All', value: 'mined' as const }];
  useEffect(() => { onTabChange?.(activeTab); }, [activeTab, onTabChange]);
  const handleTabChange = (newTab: 'mined') => { setActiveTab(newTab); onTabChange?.(newTab); };
  return (
    <div className="w-full flex flex-col gap-2" style={{ height: 650 }}>
      <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={handleTabChange} className="mb-4" />
      <BlockListContent key={activeTab} activeTab={activeTab} onSelect={onSelect} />
    </div>
  );
}

function BlockListContent({ activeTab, onSelect }: {
  activeTab: 'mined';
  onSelect: (block: Block) => void;
}) {
  const [atBottom, setAtBottom] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const activeConfig = { label: 'All', useHook: useMinedBlocks, emptyStateMessage: 'No blocks available for the selected chain' };
  const { chainId } = useChainStore();
  const { fetchBlocksfromAPIWithCriteria } = activeConfig.useHook();
  const [apiBlocks, setApiBlocks] = useState<Block[]>([]);
  function fetchData() {
    if (fetchBlocksfromAPIWithCriteria) {
      const criteria: BlockQueryCriteria = {
        filter: { chain_id: chainId },
        identifier: { latest: true, page_idx: currentPage },
        limit: { limit: 25 },
      };
      fetchBlocksfromAPIWithCriteria(criteria).then((txs) => {
        setApiBlocks(txs);
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
  if (apiBlocks.length === 0) {
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
              <th className="p-2 border sticky top-0 bg-gray-100">Solana Slot</th>
            </tr>
          </thead>
          <tbody>
            {apiBlocks.map((blk) => (
              <tr key={blk.block_number} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="p-2 border">
                  {blk.block_number ? (
                    <a href={`/block/${blk.block_number}`} className="text-blue-600 underline hover:text-blue-800">{blk.block_number}</a>
                  ) : ''}
                </td>
              <td className="p-2 border">
                {blk.block_hash ? (
                  <a href={`/block/${blk.block_hash}`} className="text-blue-600 underline hover:text-blue-800">{blk.block_hash}</a>
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
              <td className="p-2 border">
                {blk.solana_slot ? (
                  <a
                  href={`${solscanBase}/block/${blk.solana_slot}?cluster=${solscanCluster}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline hover:text-blue-800"
                  >
                  {blk.solana_slot}
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

// Details component
export function BlockDetails({ hashorHeight }: { hashorHeight: string }) {
  const { chainId } = useChainStore();
  const { fetchBlocksfromAPIWithCriteria } = useMinedBlocks();
  const [block, setBlock] = useState<Block | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!hashorHeight || !chainId) {
      setBlock(null);
      setLoading(false);
      setError('Missing hashorHeight or chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: BlockQueryCriteria = {
      filter: { chain_id: chainId },
      identifier: {},
      limit: { limit: 1 },
    };
    if (hashorHeight.startsWith('0x')) {
      (criteria.identifier as any).block_hash = hashorHeight;
    } else {
      (criteria.identifier as any).block_number = Number(hashorHeight);
    }
    fetchBlocksfromAPIWithCriteria(criteria)
      .then((blocks) => { setBlock(blocks.length > 0 ? blocks[0] : null); })
      .catch(() => { setError('Failed to load block'); setBlock(null); })
      .finally(() => { setLoading(false); });
  }, [hashorHeight, chainId]);
  if (loading) return <div>Loading block...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!block) return <div>No block found.</div>;
  const formatKey = (key: string) => key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const formatValue = (key: string, value: any) => {
    if (key === 'timestamp' && typeof value === 'number') {
      const date = new Date(value * 1000);
      return `${value} (${date.toLocaleString()})`;
    }
    return String(value);
  };
  return (
    <div className="flex flex-col gap-2">
  {Object.entries(block).map(([key, value]) => {
    const isSolanaSlot = key === "solana_slot";

    console.log("Key:", key, "Value:", value, "isSolanaSlot:", isSolanaSlot);

 
    const solscanHref =
      isSolanaSlot && value
        ? `${solscanBase}/block/${value}?cluster=${solscanCluster}`
        : null;

        console.log("Solscan Href:", solscanHref);
    return (
      <div
        key={key}
        className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1"
      >
        <span className="font-semibold">{formatKey(key)}</span>

        <span className="font-mono break-all text-right">
          {isSolanaSlot && solscanHref ? (
            <a
              href={solscanHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {formatValue(key, value)}
            </a>
          ) : (
            formatValue(key, value)
          )}
        </span>
      </div>
    );
  })}
</div>
  );
}
