export interface BlockFilter {
  chain_id?: string; // Option<u64> as string for compatibility
}

export interface BlockIdentifier {
  block_number?: number;   // Option<i64>
  block_hash?: string;     // Option<String>
  latest?: boolean;        // Option<bool>
  page_idx?: number;       // Option<u64>
}

export interface BlockLimit {
  limit?: number;          // u64
}

export interface BlockQueryCriteria {
  filter: BlockFilter;
  identifier: BlockIdentifier;
  limit: BlockLimit;
}