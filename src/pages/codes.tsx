import Layout from '@/components/Layout';
import { CodeList } from '@/components/CodeComponent';
import React, { useEffect, useState } from 'react';
import { useChainStore } from '@/store/chainStore';
import { Code } from '@/constants/codes';


type TabType = 'mined';


export default function CodesPage() {

  const [currentCode, setCurrentCode] = useState<Code | null>(null);

  const { chainId } = useChainStore();


  useEffect(() => {
    if (currentCode) {
      setCurrentCode(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainId]);

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        {!currentCode && (
          <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
            <h1 className="text-base">Codes</h1>

            <CodeList />
          </div>
        )}
      </div>
    </Layout>

  );
}
