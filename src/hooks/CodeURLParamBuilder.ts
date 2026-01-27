import { CodeQueryCriteria } from './CodeQueryCriteria';

export function buildCodeURLParams(criteria: CodeQueryCriteria): string {
    const params: string[] = [];

    // Identifier
    if (criteria.identifier.address) params.push(`address=${criteria.identifier.address}`);
    if (criteria.identifier.latest) params.push(`latest=true`);
    if (typeof criteria.identifier.page_idx === 'number') params.push(`page_idx=${criteria.identifier.page_idx}`);

    // Filter
    if (criteria.filter.chain_id) params.push(`chain_id=${criteria.filter.chain_id}`);

    // Limit
    if (typeof criteria.limit.limit === 'number') params.push(`limit=${criteria.limit.limit}`);

    return params.join('&');
}
