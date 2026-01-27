export interface CodeFilter {
    chain_id?: string; // Option<u64> as string for compatibility
}

export interface CodeIdentifier {
    address?: string;      // Option<String>
    latest?: boolean;      // Option<bool>
    page_idx?: number;     // Option<u64>
}

export interface CodeLimit {
    limit?: number;
}

export interface CodeQueryCriteria {
    filter: CodeFilter;
    identifier: CodeIdentifier;
    limit: CodeLimit;
}
