import React, { useEffect, useState } from 'react';
import { useChainStore } from '@/store/chainStore';
import { useMinedBlocks } from '@/components/Blocks';
import { Block } from '@/constants/blocks';
import { BlockQueryCriteria } from '@/hooks/BlockQueryCriteria';

type BlockLike = Block & {
  [key: string]: any;
};

export function BlockDetails({ hashorHeight }: { hashorHeight: string }) {
  const { chainId } = useChainStore();
  const { fetchBlocksfromAPIWithCriteria } = useMinedBlocks();

  const [block, setBlock] = useState<BlockLike | null>(null);
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
      filter: {
        chain_id: chainId,
      },
      identifier: {},
      limit: {
        limit: 1,
      },
    };

    // hash vs height
    if (hashorHeight.startsWith('0x')) {
      (criteria.identifier as any).block_hash = hashorHeight;
    } else {
      (criteria.identifier as any).block_number = Number(hashorHeight);
    }

    fetchBlocksfromAPIWithCriteria(criteria)
      .then((blocks: BlockLike[]) => {
        const blk = blocks.length > 0 ? blocks[0] : null;
        setBlock(blk);
      })
      .catch((e) => {
        console.error(e);
        setError('Failed to load block');
        setBlock(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hashorHeight, chainId]);

  if (loading) {
    return <div>Loading block...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!block) {
    return <div>No block found.</div>;
  }

  // Optional: make keys look nicer (snake_case -> "Snake Case")
  const formatKey = (key: string) =>
    key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());

  // Optional: special formatting for some values
  const formatValue = (key: string, value: any) => {
    if (key === 'timestamp' && typeof value === 'number') {
      // assuming this is a unix timestamp (seconds)
      const date = new Date(value * 1000);
      return `${value} (${date.toLocaleString()})`;
    }
    return String(value);
  };

  return (
    <div className="flex flex-col gap-2">
      {Object.entries(block).map(([key, value]) => (
        <div
          key={key}
          className="flex justify-between gap-4 text-sm border-b border-gray-200 py-1"
        >
          <span className="font-semibold">
            {formatKey(key)}
          </span>
          <span className="font-mono break-all text-right">
            {formatValue(key, value)}
          </span>
        </div>
      ))}
    </div>
  );
}
