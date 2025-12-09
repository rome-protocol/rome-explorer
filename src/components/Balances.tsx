import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";
import { useChainStore } from "@/store/chainStore";

export const useMinedBalances = () => {
    const { chainId } = useChainStore();
    const {  fetchBalancesfromAPIWithCriteria } = useMinedTransactionAPI();
    return {
       
        fetchBalancesfromAPIWithCriteria,
    };
};
