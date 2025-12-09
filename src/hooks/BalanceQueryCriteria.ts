export interface BalanceFilter {
    chain_id?: string; // Option<u64> as string for compatibility
}

export interface BalanceIdentifier {
    address?: string;      // Option<String>
    latest?: boolean;      // Option<bool>
    page_idx?: number;     // Option<u64>
}

export interface BalanceLimit {
    limit?: number;
}

export interface BalanceQueryCriteria {
    filter: BalanceFilter;
    identifier: BalanceIdentifier;
    limit: BalanceLimit;
}
