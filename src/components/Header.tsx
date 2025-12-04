import Image from "next/image";
import { useState } from "react";
import { ChainModal } from "@/components/ChainModal";
import { useChainStore } from "@/store/chainStore";
import { L2_CHAINS } from "@/constants/chains";
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/20/solid";
import { MobileSidebar } from "@/components/MobileSidebar";
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { SearchWithResults } from "./SearchWithResults";
/*
import { WalletStatus } from "./WalletStatus";
import { useUniWallet } from "@/hooks/useUniWallet";
*/
export const Header = () => {
  const [isChainModalOpen, setIsChainModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { selectedChainId } = useChainStore();
  const [searchQuery, setSearchQuery] = useState('');

  // const wallet = useUniWallet();

  const selectedChainName =
    L2_CHAINS.find((chain) => chain.chainId === selectedChainId)?.name ||
    "Select Chain";

  return (
    <div className="absolute top-0 left-0 right-0 bg-white z-40">
      <div className="flex w-full items-center justify-between gap-8">
        <div className="flex items-center justify-start">
          <Image
            className="sm:w-32 w-24"
            src="/images/logo.svg"
            alt="ROME"
            width={180}
            height={38}
            priority
          />
        </div>

<SearchWithResults
  searchQuery={searchQuery}
  setSearchQuery={setSearchQuery}
  chainId={selectedChainId}
/>        {/* your results / logic using searchQuery */}

        <div className="flex items-center gap-4">

          <button
            onClick={() => setIsChainModalOpen(true)}
            className="shadow-btn bg-white rounded-full px-4 py-2 cursor-pointer hover:font-semibold text-black text-center flex items-center gap-2"
          >
            <span>{selectedChainName}</span>
            <ChevronDownIcon className="size-5" />
          </button>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 cursor-pointer hover:font-semibold text-black text-center"
          >
            <Bars3Icon className="size-5" />
          </button>
        </div>
      </div>

      <ChainModal
        isOpen={isChainModalOpen}
        onClose={() => setIsChainModalOpen(false)}
      />
      <MobileSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
};
