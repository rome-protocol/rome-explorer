// pages/transaction/[hashcode].tsx
import { useRouter } from 'next/router';
import Layout from '@/components/Layout';
import { TransactionDetails } from '@/components/TransactionDetails';
import { useChainStore } from '@/store/chainStore';

export default function TransactionHashPage() {
  const router = useRouter();
  const { hashcode } = router.query;
  const { chainId } = useChainStore();
  

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Transaction Details</h1>
          <TransactionDetails hashcode={(hashcode as string) || ''} />
        </div>
      </div>
    </Layout>
  );
}
