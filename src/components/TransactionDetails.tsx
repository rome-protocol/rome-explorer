import { useCallback, useEffect, useState } from 'react';
import { Transaction } from '@/constants/transactions';
import { TxQueryCriteria } from '@/hooks/TxnQueryCriteria';
import { useChainStore } from '@/store/chainStore';
import { useMinedTransactions } from '@/components/Transactions';

const BOX_H = 600;

export function TransactionDetails({ hashcode }: { hashcode: string }) {
  const { chainId } = useChainStore();
  const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactions();

  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  console.log('TransactionDetails received hashcode:', hashcode);
  console.log('ChainId received:', chainId);
  console.log('Render transaction =', transaction);
  const [atBottom, setAtBottom] = useState(false);
  

  useEffect(() => {
    if (!hashcode || !chainId) {
      setTransaction(null);
      setLoading(false);
      setError('Missing hashcode or chainId');
      return;
    }

    setLoading(true);
    setError(null);

    const criteria: TxQueryCriteria = {
      filter: {
        chain_id: chainId,
      },
      parts: {
        all: true,
      },
      identifier: { tx_hash: hashcode },
      limit: {
        limit: 25,
      },
    };

    fetchTransactionsfromAPIWithCriteria(criteria)
      .then((txs) => {
        console.log('Fetched transactions from API (raw):', txs);
        const tx = txs.length > 0 ? txs[0] : null;
        console.log('Selected transaction:', tx);
        setTransaction(tx);
      })
      .catch((e) => {
        console.error('Error fetching transaction:', e);
        setError('Failed to load transaction');
        setTransaction(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [hashcode, chainId]);

    const handleScroll = useCallback(
      (e: Event) => {
        const el = e.currentTarget as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = el;
  
        // Load new transactions when user scrolled 80% of the list
        // This is more natural behavior for web applications
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        const shouldLoadMore = scrollPercentage >= 0.8;
  
        // Set state only if it changed
        if (shouldLoadMore && !atBottom) {
          setAtBottom(true);
        } else if (!shouldLoadMore && atBottom) {
          setAtBottom(false);
        }
      },
      [atBottom]
    );

    const setBoxRef = useCallback(
      (node: HTMLDivElement | null) => {
        if (node) {
          node.addEventListener('scroll', handleScroll, { passive: true });
        }
      },
      [handleScroll]
    );

  return (
    <div className="w-full flex flex-col gap-2" style={{ height: BOX_H + 50 }}>
      {loading && <div>Loading transaction...</div>}

      {!loading && error && <div className="text-red-500">{error}</div>}

      {!loading && !error && !transaction && (
        <div>No transaction found for this hash.</div>
      )}

      {!loading && !error && transaction && (

        <div ref={setBoxRef} className="max-h-[60vh] overflow-y-auto">
        
        <div className="flex flex-col gap-2">
          {Object.entries(transaction).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="font-semibold">{key}</span>
              <span>{String(value)}</span>
            </div>
          ))}
        </div>
</div>


      )}
    </div>
  );
}
