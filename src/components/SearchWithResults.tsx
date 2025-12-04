import React, { useEffect, useState } from 'react';
import { SearchBar } from './SearchBar';

import { TxQueryCriteria } from '@/hooks/TxnQueryCriteria';
import { Block } from '@/constants/blocks';
import { BlockQueryCriteria } from '@/hooks/BlockQueryCriteria';
import { useMinedTransactionAPI } from '@/hooks/useMinedTransactionAPI';

type SearchResultType = 'tx' | 'block';

type SearchResult = {
  id: string;
  label: string;
  description?: string;
  type: SearchResultType;
  url: string;
};

type SearchWithResultsProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  chainId: string;
};

export const SearchWithResults: React.FC<SearchWithResultsProps> = ({
  searchQuery,
  setSearchQuery,
  chainId,
}) => {
  const {
    fetchTransactionsfromAPIWithCriteria,
    fetchBlocksfromAPIWithCriteria,
  } = useMinedTransactionAPI();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // ---- helpers ---- //

  const isPossibleTxHash = (q: string) =>
    q.startsWith('0x') && q.length === 66;

  const isPossibleBlock = (q: string) => {
    if (!q) return false;
    if (q.startsWith('0x')) return true;
    return /^\d+$/.test(q);
  };

  const short = (hash?: string) => {
    if (!hash) return '';
    return hash.length > 16
      ? `${hash.slice(0, 10)}…${hash.slice(-4)}`
      : hash;
  };

  const searchTransactions = async (
    hashcode: string,
    chainIdParam: string,
  ): Promise<SearchResult[]> => {
    const criteria: TxQueryCriteria = {
      filter: { chain_id: chainIdParam },
      parts: { all: true },
      identifier: { tx_hash: hashcode },
      limit: { limit: 25 },
    };

    try {
      const txs = await fetchTransactionsfromAPIWithCriteria(criteria);

      // 🔥 ADDED LOG
      //console.log('TX result sample:', txs?.[0]);

      return txs.map((tx: any): SearchResult => {
        const hash = tx.tx_hash ?? hashcode;

        return {
          id: `tx-${hash ?? ''}`,
          label: short(hash),
          description: tx.block_number
            ? `Tx · Block ${tx.block_number}`
            : 'Transaction',
          type: 'tx',
          url: hash ? `/transaction/${hash}` : '#',
        };
      });
    } catch (e) {
      console.error('Error fetching transaction:', e);
      return [];
    }
  };

  const searchBlocks = async (
    hashorHeight: string,
    chainIdParam: string,
  ): Promise<SearchResult[]> => {
    const criteria: BlockQueryCriteria = {
      filter: { chain_id: chainIdParam },
      identifier: {},
      limit: { limit: 25 },
    };

    if (hashorHeight.startsWith('0x')) {
      (criteria.identifier as any).block_hash = hashorHeight;
    } else {
      (criteria.identifier as any).block_number = Number(hashorHeight);
    }

    try {
      const blocks: Block[] = await fetchBlocksfromAPIWithCriteria(criteria);

      // 🔥 ADDED LOG
      //console.log('Block result sample:', blocks?.[0]);

      return blocks.map((blk: any): SearchResult => {
        const hash = blk.block_hash;

        return {
          id: `block-${hash ?? blk.block_number}`,
          label: hash ? short(hash) : `Block ${blk.block_number}`,
          description: blk.block_number
            ? `Block #${blk.block_number}`
            : 'Block',
          type: 'block',
          url: hash
            ? `/block/${hash}`
            : `/block/height/${blk.block_number}`,
        };
      });
    } catch (e) {
      console.error('Error fetching block:', e);
      return [];
    }
  };

  // ---- SEARCH EFFECT ---- //

  useEffect(() => {
    const q = searchQuery.trim();

    if (!q) {
      setResults([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    setOpen(true);

    const handle = setTimeout(async () => {
      try {
        const all: SearchResult[] = [];

        if (isPossibleTxHash(q)) {
          const txResults = await searchTransactions(q, chainId);
          all.push(...txResults);
        }

        if (isPossibleBlock(q)) {
          const blockResults = await searchBlocks(q, chainId);
          all.push(...blockResults);
        }

        setResults(all);
        setActiveIndex(all.length ? 0 : -1);
      } catch (e) {
        console.error('Search error', e);
        setResults([]);
        setActiveIndex(-1);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(handle);
  }, [searchQuery, chainId]);

  // ---- UI ---- //

  const handleSelect = (result: SearchResult) => {
    setOpen(false);
    setSearchQuery(result.label);
    window.location.href = result.url;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open || !results.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < results.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selected = results[activeIndex];
      if (selected) handleSelect(selected);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-lg">
      <SearchBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onKeyDown={handleKeyDown}
      />

      {open && (
        <div className="absolute left-0 right-0 z-50 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg max-h-80 overflow-y-auto">
          {loading && (
            <div className="px-4 py-2 text-xs text-gray-500">
              Searching…
            </div>
          )}

          {!loading && results.length === 0 && (
            <div className="px-4 py-2 text-xs text-gray-500">
              No results
            </div>
          )}

          {!loading &&
            results.map((r, idx) => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-primary/5 ${
                  idx === activeIndex ? 'bg-primary/10' : ''
                }`}
              >
                <div>
                  <div className="font-medium text-gray-900">
                    {r.label}
                  </div>
                  {r.description && (
                    <div className="text-xs text-gray-500">
                      {r.description}
                    </div>
                  )}
                </div>
                <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[10px] uppercase tracking-wide text-gray-600">
                  {r.type}
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
};
