import React, { useCallback, useEffect, useState } from 'react';
import { useMinedTransactionAPI } from '@/hooks/useMinedTransactionAPI';
import { useChainStore } from '@/store/chainStore';
import { Code } from '@/constants/codes';
import { CodeQueryCriteria } from '@/hooks/CodeQueryCriteria';

// Hook for fetching codes
export const useMinedCodes = () => {
  const { fetchCodesfromAPIWithCriteria } = useMinedTransactionAPI();
  return {
    fetchCodesfromAPIWithCriteria,
  };
};

// List component
export function CodeList() {
  const { chainId } = useChainStore();
  const { fetchCodesfromAPIWithCriteria } = useMinedCodes();
  const [codes, setCodes] = useState<Code[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    if (!chainId) {
      setCodes([]);
      setLoading(false);
      setError('Missing chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: CodeQueryCriteria = {
      filter: { chain_id: chainId },
      identifier: { latest: true, page_idx: currentPage },
      limit: { limit: 25 },
    };
    fetchCodesfromAPIWithCriteria(criteria)
      .then((codes) => {
        setCodes(codes);
        setHasMore(codes.length === 25);
      })
      .catch(() => {
        setError('Failed to load codes');
        setCodes([]);
        setHasMore(false);
      })
      .finally(() => setLoading(false));
  }, [chainId, currentPage]);

  if (loading) return <div>Loading codes...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!codes.length) return <div>No codes found.</div>;

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasMore) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="max-h-[60vh] overflow-y-auto">
        <table className="w-full text-sm border rounded-lg shadow bg-white">
          <thead>
            <tr>
              <th className="p-2 border sticky top-0 bg-gray-100">Address</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Kind</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Name</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Symbol</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Is Contract</th>
              <th className="p-2 border sticky top-0 bg-gray-100">Block Number</th>
            </tr>
          </thead>
          <tbody>
            {codes.map((code) => (
              <tr key={code.address} className="border-b hover:bg-gray-50 cursor-pointer">
                <td className="p-2 border">
                  {code.address ? (
                    <a
                      href={`/code/${code.address}`}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      {code.address}
                    </a>
                  ) : ''}
                </td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    code.kind === 'EOA' ? 'bg-gray-200' :
                    code.kind === 'ERC20' ? 'bg-blue-200' :
                    code.kind === 'ERC721' ? 'bg-purple-200' :
                    code.kind === 'ERC1155' ? 'bg-green-200' :
                    'bg-yellow-200'
                  }`}>
                    {code.kind}
                  </span>
                </td>
                <td className="p-2 border">{code.name || '-'}</td>
                <td className="p-2 border">{code.symbol || '-'}</td>
                <td className="p-2 border">
                  <span className={`px-2 py-1 rounded text-xs ${
                    code.is_contract ? 'bg-green-200' : 'bg-gray-200'
                  }`}>
                    {code.is_contract ? 'Yes' : 'No'}
                  </span>
                </td>
                <td className="p-2 border">{code.block_number}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-start gap-4 border-t pt-4">
        <button
          onClick={handlePreviousPage}
          disabled={currentPage === 0}
          className={`px-4 py-2 rounded-lg border ${
            currentPage === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Previous
        </button>

        <span className="text-sm text-gray-600 px-4">
          Page {currentPage + 1}
        </span>

        <button
          onClick={handleNextPage}
          disabled={!hasMore}
          className={`px-4 py-2 rounded-lg border ${
            !hasMore
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-white text-gray-700 hover:bg-gray-50 cursor-pointer'
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
}

// Details component
export function CodeDetails({ address }: { address: string }) {
  const { chainId } = useChainStore();
  const { fetchCodesfromAPIWithCriteria } = useMinedCodes();
  const [code, setCode] = useState<Code | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!address || !chainId) {
      setCode(null);
      setLoading(false);
      setError('Missing address or chainId');
      return;
    }
    setLoading(true);
    setError(null);
    const criteria: CodeQueryCriteria = {
      filter: { chain_id: chainId },
      identifier: { address },
      limit: { limit: 1 },
    };
    fetchCodesfromAPIWithCriteria(criteria)
      .then((codes) => setCode(codes.length > 0 ? codes[0] : null))
      .catch(() => {
        setError('Failed to load code');
        setCode(null);
      })
      .finally(() => setLoading(false));
  }, [address, chainId]);

  if (loading) return <div>Loading code...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!code) return <div>No code found.</div>;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-semibold">Address:</span>
            <span className="text-sm break-all">{code.address}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Chain ID:</span>
            <span>{code.chain_id}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Kind:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              code.kind === 'EOA' ? 'bg-gray-200' :
              code.kind === 'ERC20' ? 'bg-blue-200' :
              code.kind === 'ERC721' ? 'bg-purple-200' :
              code.kind === 'ERC1155' ? 'bg-green-200' :
              'bg-yellow-200'
            }`}>
              {code.kind}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Is Contract:</span>
            <span className={`px-2 py-1 rounded text-xs ${
              code.is_contract ? 'bg-green-200' : 'bg-gray-200'
            }`}>
              {code.is_contract ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="font-semibold">Name:</span>
            <span>{code.name || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Symbol:</span>
            <span>{code.symbol || '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Decimals:</span>
            <span>{code.decimals !== undefined ? code.decimals : '-'}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Block Number:</span>
            <span>{code.block_number}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold">Updated At:</span>
            <span>{new Date(code.updated_at_unix * 1000).toLocaleString()}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-4">
        <div className="font-semibold mb-2">Contract Code:</div>
        <div className="bg-gray-100 p-4 rounded overflow-x-auto">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {code.code || 'No code available'}
          </pre>
        </div>
      </div>
    </div>
  );
}
