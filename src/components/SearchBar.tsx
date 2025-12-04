import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

type SearchBarProps = {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void; // 👈 new
};

export const SearchBar: React.FC<SearchBarProps> = ({
  searchQuery,
  setSearchQuery,
  placeholder = 'Search by tx hash, block number, address...',
  className = '',
  onKeyDown,
}) => {
  return (
    <div className={`relative mb-4 flex-1 max-w-lg ${className}`}>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder}
          className="w-full px-4 py-2.5 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:border-primary/30 bg-gradient-to-r from-gray-50 to-primary/5 focus:from-white focus:to-primary/8 transition-all duration-200 text-sm text-gray-900 placeholder-gray-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={onKeyDown} // 👈 use it
        />
        <MagnifyingGlassIcon className="w-4 h-4 text-primary absolute left-3 top-3" />
      </div>
    </div>
  );
};
