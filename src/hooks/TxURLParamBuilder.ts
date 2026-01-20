import { TxQueryCriteria } from './TxnQueryCriteria';

export function buildTxURLParams(criteria: TxQueryCriteria): string {
    const params: string[] = [];

    // Identifier
    if (criteria.identifier.tx_hash) params.push(`tx_hash=${criteria.identifier.tx_hash}`);
    if (criteria.identifier.latest) params.push(`latest=true`);
    if (typeof criteria.identifier.page_idx === 'number') params.push(`page_idx=${criteria.identifier.page_idx}`);

    // Filter
    if (criteria.filter.sender) params.push(`sender=${criteria.filter.sender}`);
    if (typeof criteria.filter.status === 'number') params.push(`status=${criteria.filter.status}`);
    if (criteria.filter.recipient) params.push(`recipient=${criteria.filter.recipient}`);
    if (typeof criteria.filter.chain_id) params.push(`chain_id=${criteria.filter.chain_id}`);
    if (criteria.filter.tx_type) params.push(`tx_type=${criteria.filter.tx_type}`);
    if (typeof criteria.filter.block_no === 'number') params.push(`block_no=${criteria.filter.block_no}`);
    if (criteria.filter.block_hash) params.push(`block_hash=${criteria.filter.block_hash}`);

    // Parts
    if (criteria.parts.all) params.push(`all=true`);
    if (criteria.parts.summary_only) params.push(`summary_only=true`);

    // Type
    if (criteria.tx_type && criteria.tx_type.tx_type) {
        params.push(`tx_type=${criteria.tx_type.tx_type}`);
    }

    // Limit
    if (typeof criteria.limit.limit === 'number') params.push(`limit=${criteria.limit.limit}`);

    // Join with &
    return params.join('&');
}