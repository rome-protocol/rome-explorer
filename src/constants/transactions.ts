export interface SolanaTxnMapping {
  evm_tx_hash: string;
  sol_signature: string;
  slot_number: number;
}

export interface TransactionResponse {
  Transaction: {
    tx: {
      chain_id: number;
      transaction_hash: string;
      transaction_nonce: string;
      block_hash?: string | null;
      block_number?: number | null;
      transaction_index?: number | null;
      _from: string;
      _to?: string | null;
      value: string;
      gas: string;
      gas_price?: string;
      input: string;
      v: string;
      r: string;
      s: string;
      transaction_type: string;
      tx_type: string;
      impersonated: boolean;
      max_priority_fee_per_gas?: string;
      max_fee_per_gas?: string;
      solana_slot_number: number;
      tx_idx: number;
      exit_code: number;
    };
    solana_txn_mapping: SolanaTxnMapping[];
  };
}

export interface Transaction {
  chainId: number;

  transactionHash: string;
  transactionNonce: string;

  blockHash?: string | null;
  blockNumber?: number | null;
  transactionIndex?: number | null;

  from: string;
  to?: string | null;

  value: string;
  gas: string;
  gasPrice?: string;

  input: string;

  v: string;
  r: string;
  s: string;

  transactionType: string;
  txType: string;

  impersonated: boolean;

  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;

  solanaSlotNumber: number;
  txIndex: number;
  exitCode: number;

  solanaTxnMappings?: SolanaTxnMapping[];
}

export function mapTransactionResponse(response: TransactionResponse[]): Transaction[] {
  return response.map((item) => {
    const { tx, solana_txn_mapping } = item.Transaction;
    return {
      chainId: tx.chain_id,
      transactionHash: tx.transaction_hash,
      transactionNonce: tx.transaction_nonce,
      blockHash: tx.block_hash,
      blockNumber: tx.block_number,
      transactionIndex: tx.transaction_index,
      from: tx._from,
      to: tx._to,
      value: tx.value,
      gas: tx.gas,
      gasPrice: tx.gas_price,
      input: tx.input,
      v: tx.v,
      r: tx.r,
      s: tx.s,
      transactionType: tx.transaction_type,
      txType: tx.tx_type,
      impersonated: tx.impersonated,
      maxPriorityFeePerGas: tx.max_priority_fee_per_gas,
      maxFeePerGas: tx.max_fee_per_gas,
      solanaSlotNumber: tx.solana_slot_number,
      txIndex: tx.tx_idx,
      exitCode: tx.exit_code,
      solanaTxnMappings: solana_txn_mapping,
    };
  });
}

