import Layout from '@/components/Layout';
import { BlockList } from '@/components/BlockList';
import React, { useEffect, useState } from 'react';
import { useChainStore } from '@/store/chainStore';
import { Block } from '@/constants/blocks';


type TabType = 'mined' ;


export default function BlocksPage() {

  const [currentBlk, setCurrentBlk] = useState<Block | null>(null);

  const { chainId } = useChainStore();


  useEffect(() => {
    if (currentBlk) {
      setCurrentBlk(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        {!currentBlk && (
          <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
            <h1 className="text-base mb-4">Blocks</h1>

            <BlockList onSelect={(blk) => setCurrentBlk(blk)} />
          </div>
        )}
      </div>
    </Layout>

  );
}
