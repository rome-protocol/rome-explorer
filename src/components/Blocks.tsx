import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";
import { useChainStore } from "@/store/chainStore";

export const useMinedBlocks = () => {
    const { chainId } = useChainStore();
    const {  fetchTransactionsfromAPIWithCriteria,fetchBlocksfromAPIWithCriteria } = useMinedTransactionAPI();
    return {
       
        fetchBlocksfromAPIWithCriteria,
    };
};