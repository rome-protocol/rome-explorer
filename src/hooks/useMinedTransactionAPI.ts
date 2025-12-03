import { INDEXER_FULL_URL } from '@/constants';
import { Transaction } from '@/constants/transactions';
import { TxQueryCriteria } from './TxnQueryCriteria';
import { buildTxURLParams } from './TxURLParamBuilder';
import { BlockQueryCriteria } from './BlockQueryCriteria';
import { Block } from '@/constants/blocks';
import { buildBlockURLParams } from './BlockURLParamBuilder';

export const useMinedTransactionAPI = () => {


  async function fetchTransactionfromAPI(urlParams: string): Promise<Transaction[]> {
    try {
      console.log('Inside Transaction API Fetching transactions with URL params:', urlParams);

      let url = `${INDEXER_FULL_URL}/transactions?`;
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

  async function fetchBlocksfromAPI(urlParams: string): Promise<any[]> {
    try {
      console.log('Inside Block API Fetching blocks with URL params:', urlParams);
      let url = `${INDEXER_FULL_URL}/blocks?`;
      if (urlParams && urlParams.trim()) {
        url += urlParams;
      } else {
        url += 'chain_id=121214&all=true&limit=25&latest=true';
      }
      console.log('Fetching blocks from API with URL:', url);
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      console.log('Fetched blocks from API:', data);
      const blocks: any[] = Array.isArray(data)
        ? data.map((item) => item.Block ?? item)
        : [];
      console.log('Fetched blocks as block array:', blocks);
      return blocks;
    } catch {
      return [];
    }
  }

  /**
   * Wrapped function to fetch blocks using BlockQueryCriteria.
   * It builds URL params using BlockURLParamBuilder and calls fetchBlocksfromAPI.
   */
  async function fetchBlocksfromAPIWithCriteria(criteria: BlockQueryCriteria): Promise<Block[]> {
    // Assume BlockURLParamBuilder is imported and returns a string of URL params
    const urlParams = buildBlockURLParams(criteria);
    return await fetchBlocksfromAPI(urlParams);
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
    fetchBlocksfromAPIWithCriteria
  };
};
