import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";
import { useChainStore } from "@/store/chainStore";

export const useMinedTransactions = () => {
    const { chainId } = useChainStore();
    const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactionAPI();
    return {
        fetchTransactionsfromAPIWithCriteria,
    };
};