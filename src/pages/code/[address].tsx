// pages/code/[address].tsx
import Layout from '@/components/Layout';
import { CodeDetails } from '@/components/CodeComponent';
import { useChainStore } from '@/store/chainStore';
import { useRouter } from 'next/router';

export default function CodeAddressPage() {
  const router = useRouter();
  const { address } = router.query;
  useChainStore();
  

  return (
    <Layout>
      <div className="flex flex-col gap-6 w-full">
        <div className="border border-gray p-8 rounded-2xl text-black bg-white flex flex-col gap-4 w-full">
          <h1 className="text-base mb-4">Code Details</h1>
          <CodeDetails address={(address as string) || ''} />
        </div>
      </div>
    </Layout>
  );
}
