export interface Block {
  chain_id: number;
  block_number: number;
  block_hash: string;
  parent_hash: string;
  ommers_hash: string;
  beneficiary: string;
  state_root: string;
  transactions_root: string;
  receipts_root: string;
  logs_bloom: string;
  difficulty: string;
  gas_limit: string;
  gas_used: string;
  timestamp: number;
  extra_data: string;
  mix_hash: string;
  nonce: string;
  base_fee_per_gas?: string; // Optional field
}

