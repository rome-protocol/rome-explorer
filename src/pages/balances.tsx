import Layout from '@/components/Layout';
import { BalanceList } from '@/components/BalanceComponent';
import React, { useEffect, useState } from 'react';
import { useChainStore } from '@/store/chainStore';
import { Balance } from '@/constants/balances';


type TabType = 'mined' ;


export default function BalancesPage() {

  const [currentBlk, setCurrentBlk] = useState<Balance | null>(null);

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
            <h1 className="text-base">Balances</h1>

            <BalanceList />
          </div>
        )}
      </div>
    </Layout>

  );
}
