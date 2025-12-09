import { INDEXER_FULL_URL } from '@/constants';
import { Transaction } from '@/constants/transactions';
import { TxQueryCriteria } from './TxnQueryCriteria';
import { buildTxURLParams } from './TxURLParamBuilder';
import { BlockQueryCriteria } from './BlockQueryCriteria';
import { Block } from '@/constants/blocks';
import { buildBlockURLParams } from './BlockURLParamBuilder';
import { BalanceQueryCriteria } from './BalanceQueryCriteria';
import { Balance } from '@/constants/balances';
import { buildBalanceURLParams } from './BalanceURLParamBuilder';


export const useMinedTransactionAPI = () => {

  const fetchFromAPI = async <T>(type: string, urlParams: string, key: string): Promise<T[]> => {
    try {
      let url = `${INDEXER_FULL_URL}/${type}?`;
      if (urlParams && urlParams.trim()) {
        url += urlParams;
      } else {
        url += 'chain_id=121214&all=true&limit=25&latest=true';
      }
      // console.log(`Fetching ${type} from API with URL:`, url);
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      // console.log(`Fetched ${type} from API:`, data);
      const result: T[] = Array.isArray(data)
        ? data.map((item) => item[key] ?? item)
        : [];
      // console.log(`Fetched ${type} as array:`, result);
      return result;
    } catch {
      return [];
    }
  };

  const fetchTransactionsfromAPI = (urlParams: string) =>
    fetchFromAPI<Transaction>('transactions', urlParams, 'Transaction');

  const fetchBlocksfromAPI = (urlParams: string) =>
    fetchFromAPI<Block>('blocks', urlParams, 'Block');

  const fetchBalancesfromAPI = (urlParams: string) =>
    fetchFromAPI<Balance>('balances', urlParams, 'Balance');


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
   * Wrapped function to fetch blocks using BlockQueryCriteria.
   * It builds URL params using BlockURLParamBuilder and calls fetchBlocksfromAPI.
   */
  async function fetchBalancesfromAPIWithCriteria(criteria: BalanceQueryCriteria): Promise<Balance[]> {
    // Assume BlockURLParamBuilder is imported and returns a string of URL params
    const urlParams = buildBalanceURLParams(criteria);
    return await fetchBalancesfromAPI(urlParams);
  }

  /**
   * Wrapped function to fetch transactions using TxQueryCriteria.
   * It builds URL params using TxURLParamBuilder and calls fetchTransactionfromAPI.
   */
  async function fetchTransactionsfromAPIWithCriteria(criteria: TxQueryCriteria): Promise<Transaction[]> {
    // Assume TxURLParamBuilder is imported and returns a string of URL params
    const urlParams = buildTxURLParams(criteria);
    return await fetchTransactionsfromAPI(urlParams);
  }


  return {

    fetchTransactionsfromAPIWithCriteria,
    fetchBlocksfromAPIWithCriteria,
    fetchBalancesfromAPIWithCriteria
  };
};
