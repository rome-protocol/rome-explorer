import { INDEXER_FULL_URL } from '@/constants';
import { Transaction } from '@/constants/transactions';
import { TxQueryCriteria } from './TxnQueryCriteria';
import { buildTxURLParams } from './TxURLParamBuilder';

export const useMinedTransactionAPI = () => {


  async function fetchTransactionfromAPI(urlParams: string): Promise<Transaction[]> {
    try {
      let url = `${INDEXER_FULL_URL}transactions?`;
      if (urlParams && urlParams.trim()) {
        url += urlParams;
      } else {
        url += 'chain_id=121214&all=true&limit=25&latest=true';
      }
      console.log('Fetching transactions from API with URL:', url);
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      console.log('Fetched transactions from API:', data);
      const transactions: Transaction[] = Array.isArray(data)
        ? data.map((item) => item.Transaction ?? item)
        : [];
      console.log('Fetched transactions as txn array:', transactions);
      return transactions;
    } catch {
      return [];
    }
  }

  /**
   * Wrapped function to fetch transactions using TxQueryCriteria.
   * It builds URL params using TxURLParamBuilder and calls fetchTransactionfromAPI.
   */
  async function fetchTransactionsfromAPIWithCriteria(criteria: TxQueryCriteria): Promise<Transaction[]> {
    // Assume TxURLParamBuilder is imported and returns a string of URL params
    const urlParams = buildTxURLParams(criteria);
    return await fetchTransactionfromAPI(urlParams);
  }


  return {

    fetchTransactionsfromAPIWithCriteria,
  };
};
