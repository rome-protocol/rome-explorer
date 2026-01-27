import { INDEXER_FULL_URL } from '@/constants';
import { Transaction, TransactionResponse, mapTransactionResponse } from '@/constants/transactions';
import { TxQueryCriteria } from './TxnQueryCriteria';
import { buildTxURLParams } from './TxURLParamBuilder';
import { BlockQueryCriteria } from './BlockQueryCriteria';
import { Block } from '@/constants/blocks';
import { buildBlockURLParams } from './BlockURLParamBuilder';
import { BalanceQueryCriteria } from './BalanceQueryCriteria';
import { Balance } from '@/constants/balances';
import { buildBalanceURLParams } from './BalanceURLParamBuilder';
import { CodeQueryCriteria } from './CodeQueryCriteria';
import { Code } from '@/constants/codes';
import { buildCodeURLParams } from './CodeURLParamBuilder';

const extractArray = (data: any): any[] => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};


export const useMinedTransactionAPI = () => {
  /** Safely extract an array from multiple possible API shapes */

  /** Utility: force any value into a string (or empty string if nullish) */
  const toStringSafe = (v: any, fallback = ''): string =>
    v === null || v === undefined ? fallback : String(v);

  /** Utility: force any value into a number (or fallback if invalid) */
  const toNumberSafe = (v: any, fallback = 0): number => {
    const n = typeof v === 'number' ? v : Number(v);
    return Number.isFinite(n) ? n : fallback;
  };

  const fetchFromAPI = async <T>(
    type: string,
    urlParams: string,
    key?: string,
    normalize?: (item: any) => T
  ): Promise<T[]> => {
    try {
      let url = `${INDEXER_FULL_URL}/${type}?`;
      if (urlParams && urlParams.trim()) {
        url += urlParams;
      } else {
        url += 'chain_id=121214&all=true&limit=25&latest=true';
      }

      const res = await fetch(url);
      if (!res.ok) return [];

      const data = await res.json();
      console.log(`Fetched ${type} from API:`, data);

      const arr = extractArray(data);

      console.log(`Extracted ${type} array:`, arr);

      // unwrap if needed: [{ Transaction: {...}}, ...]
      const unwrapped = key ? arr.map((item) => item?.[key] ?? item) : arr;

      // normalize if needed
      const finalArr = normalize ? unwrapped.map((item) => normalize(item)) : (unwrapped as T[]);

      console.log(`Fetched ${type} as array:`, finalArr);
      return finalArr;
    } catch {
      return [];
    }
  };



  const fetchBlocksfromAPI = (urlParams: string) => fetchFromAPI<Block>('blocks', urlParams, 'Block');

  const fetchBalancesfromAPI = (urlParams: string) =>
    fetchFromAPI<Balance>('balances', urlParams, 'Balance');

  const fetchCodesfromAPI = (urlParams: string) =>
    fetchFromAPI<Code>('codes', urlParams, 'Code');

  async function fetchBlocksfromAPIWithCriteria(criteria: BlockQueryCriteria): Promise<Block[]> {
    const urlParams = buildBlockURLParams(criteria);
    return await fetchBlocksfromAPI(urlParams);
  }

  async function fetchBalancesfromAPIWithCriteria(criteria: BalanceQueryCriteria): Promise<Balance[]> {
    const urlParams = buildBalanceURLParams(criteria);
    return await fetchBalancesfromAPI(urlParams);
  }

  async function fetchTransactionsfromAPIWithCriteria(criteria: TxQueryCriteria): Promise<Transaction[]> {
    const urlParams = buildTxURLParams(criteria);
    return await fetchTransactionsfromAPI(urlParams);
  }

  async function fetchCodesfromAPIWithCriteria(criteria: CodeQueryCriteria): Promise<Code[]> {
    const urlParams = buildCodeURLParams(criteria);
    return await fetchCodesfromAPI(urlParams);
  }

  return {
    fetchTransactionsfromAPIWithCriteria,
    fetchBlocksfromAPIWithCriteria,
    fetchBalancesfromAPIWithCriteria,
    fetchCodesfromAPIWithCriteria,
  };
};
const fetchTransactionsfromAPI = async (urlParams: string): Promise<Transaction[]> => {
  try {
    let url = `${INDEXER_FULL_URL}/transactions?`;
    if (urlParams && urlParams.trim()) {
      url += urlParams;
    } else {
      url += 'chain_id=121214&all=true&limit=25&latest=true';
    }

    const res = await fetch(url);
    if (!res.ok) return [];

    const data = await res.json();
    console.log('Fetched transactions from API:', data);

    const arr = extractArray(data) as TransactionResponse[];
    console.log('Extracted transactions array:', arr);

    // Use the mapping function from transactions.ts
    const transactions = mapTransactionResponse(arr);
    console.log('Mapped transactions:', transactions);

    return transactions;
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }
}