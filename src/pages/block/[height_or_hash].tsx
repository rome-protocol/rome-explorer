// pages/block/[height_or_hash].tsx
import Layout from '@/components/Layout';
import { BlockDetails } from '@/components/BlockDetails';
import { useChainStore } from '@/store/chainStore';
import { useRouter } from 'next/router';
import React from 'react';

export default function BlockHashPage() {
  const router = useRouter();
  const { height_or_hash } = router.query;
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

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Block Details</h1>
          <BlockDetails hashorHeight={hashOrHeight} />
        </div>
      </div>
    </Layout>
  );
}