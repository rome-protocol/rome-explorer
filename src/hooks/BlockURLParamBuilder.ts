import { BlockQueryCriteria } from './BlockQueryCriteria';

export function buildBlockURLParams(criteria: BlockQueryCriteria): string {
    const params: string[] = [];

    // Identifier
    if (typeof criteria.identifier.block_number === 'number') params.push(`block_number=${criteria.identifier.block_number}`);
    if (criteria.identifier.block_hash) params.push(`block_hash=${criteria.identifier.block_hash}`);
    if (criteria.identifier.latest) params.push(`latest=true`);
    if (typeof criteria.identifier.page_idx === 'number') params.push(`page_idx=${criteria.identifier.page_idx}`);

    // Filter
    if (criteria.filter.chain_id) params.push(`chain_id=${criteria.filter.chain_id}`);

    // Limit
    if (typeof criteria.limit.limit === 'number') params.push(`limit=${criteria.limit.limit}`);

    return params.join('&');
}