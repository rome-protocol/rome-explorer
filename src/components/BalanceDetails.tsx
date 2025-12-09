import { useCallback, useEffect, useState } from 'react';
import { Balance } from '@/constants/balances';
import { BalanceQueryCriteria } from '@/hooks/BalanceQueryCriteria';
import { useChainStore } from '@/store/chainStore';
import { useMinedBalances } from '@/components/Balances';

const BOX_H = 600;

export function BalanceDetails({ address }: { address: string }) {
  const { chainId } = useChainStore();
  const { fetchBalancesfromAPIWithCriteria } = useMinedBalances();

  const [balance, setBalance] = useState<Balance | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //console.log('BalanceDetails received hashcode:', hashcode);
  //console.log('ChainId received:', chainId);
  //console.log('Render balance =', balance);
  const [atBottom, setAtBottom] = useState(false);
  

  useEffect(() => {
    if (!address || !chainId) {
      setBalance(null);
      setLoading(false);
      setError('Missing address or chainId');
      return;
    }

    setLoading(true);
    setError(null);

    const criteria: BalanceQueryCriteria = {
      filter: {
        chain_id: chainId,
      },
     
      identifier: { address: address },
      limit: {
        limit: 25,
      },
    };

    fetchBalancesfromAPIWithCriteria(criteria)
      .then((txs) => {
        //console.log('Fetched balances from API (raw):', txs);
        const tx = txs.length > 0 ? txs[0] : null;
        //console.log('Selected balance:', tx);
        setBalance(tx);
      })
      .catch((e) => {
        console.error('Error fetching balance:', e);
        setError('Failed to load balance');
        setBalance(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [address, chainId]);

    const handleScroll = useCallback(
      (e: Event) => {
        const el = e.currentTarget as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = el;
  
        // Load new balances when user scrolled 80% of the list
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
      {loading && <div>Loading balance...</div>}

      {!loading && error && <div className="text-red-500">{error}</div>}

      {!loading && !error && !balance && (
        <div>No balance found for this hash.</div>
      )}

      {!loading && !error && balance && (

        <div ref={setBoxRef} className="max-h-[60vh] overflow-y-auto">
        
        <div className="flex flex-col gap-2">
          {Object.entries(balance).map(([key, value]) => (
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
