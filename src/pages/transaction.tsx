import Layout from '@/components/Layout';
import { TransactionList } from '@/components/TransactionList';
import React, { useEffect, useState } from 'react';
import { useChainStore } from '@/store/chainStore';
import { Transaction } from '@/constants/transactions';


export default function TransactionPage() {

  const { chainId } = useChainStore();

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">

        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Transaction Details</h1>


        </div>

      </div>
    </Layout>

  );
}
