// pages/block/[height_or_hash].tsx
import Layout from '@/components/Layout';
import { BlockDetails } from '@/components/BlockComponent';
import { BlockTransactionList } from '@/components/TransactionComponent';
import { Tabs } from '@/components/Tabs';
import { useChainStore } from '@/store/chainStore';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

export default function BlockHashPage() {
  const router = useRouter();
  const { height_or_hash } = router.query;
  const [activeTab, setActiveTab] = useState<'details' | 'transactions'>('details');
  useChainStore();

  // Ensure the param is available before rendering details
  const hashOrHeight =
    typeof height_or_hash === 'string' && height_or_hash.length > 0
      ? height_or_hash
      : null;

  if (!hashOrHeight) {
    // Show loading until router is hydrated
    return (
      <Layout>
        <div className="flex flex-col gap-6 w-full">
          <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
            <h1 className="text-base mb-4">Block Details</h1>
            <div>Loading block details...</div>
          </div>
        </div>
      </Layout>
    );
  }

  const tabOptions = [
    { label: 'Details', value: 'details' as const },
    { label: 'Transactions', value: 'transactions' as const },
  ];

  // Determine if it's a block number or hash
  const isBlockNumber = /^\d+$/.test(hashOrHeight);
  const blockNumber = isBlockNumber ? parseInt(hashOrHeight) : undefined;
  const blockHash = !isBlockNumber ? hashOrHeight : undefined;

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Block {hashOrHeight}</h1>
          <Tabs tabs={tabOptions} activeTab={activeTab} onTabChange={setActiveTab} className="mb-4" />
          
          {activeTab === 'details' && <BlockDetails hashorHeight={hashOrHeight} />}
          {activeTab === 'transactions' && (
            <BlockTransactionList blockNumber={blockNumber}  />
          )}
        </div>
      </div>
    </Layout>
  );
}