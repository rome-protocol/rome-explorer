// pages/balance/[hashcode].tsx
import Layout from '@/components/Layout';
import { BalanceDetails } from '@/components/BalanceComponent';
import { useChainStore } from '@/store/chainStore';
import { useRouter } from 'next/router';

export default function BalanceHashPage() {
  const router = useRouter();
  const { address } = router.query;
  useChainStore();
  

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Balance Details</h1>
          <BalanceDetails address={(address as string) || ''} />
        </div>
      </div>
    </Layout>
  );
}
