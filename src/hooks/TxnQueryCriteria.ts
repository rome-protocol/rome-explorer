export interface TxIdentifier {
  tx_hash?: string;        // Transaction hash (hex string)
  latest?: boolean;        // If true, fetch latest transactions
  page_idx?: number;       // Page index for pagination
}

export interface TxFilter {
  sender?: string;         // Sender address (hex string)
  status?: number;         // Transaction status (i16 in Rust, use number)
  recipient?: string;      // Recipient address (hex string)
  chain_id?: string;       // Chain ID to filter by
  tx_type?: string;
  block_no?: number;
  block_hash?: string;       // Block hash to filter by
}

export interface Parts {
  all?: boolean;           // If true, return full transaction details
  summary_only?: boolean;  // If true, return only summary
}

export interface Type {
  tx_type?: 'native' | 'all'; // Transaction type, matches Rust enum Tx
}

export interface Limit {
  limit?: number;          // Maximum number of results to return
}

export interface TxQueryCriteria {
  identifier: TxIdentifier;
  filter: TxFilter;
  parts: Parts;
  tx_type?: Type;
  limit: Limit;
}