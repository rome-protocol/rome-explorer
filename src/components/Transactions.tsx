import { useCallback, useEffect, useRef, useState } from "react";
import { useMinedTransactionAPI } from "@/hooks/useMinedTransactionAPI";
import { Transaction } from "@/constants/transactions";
import { useChainStore } from "@/store/chainStore";

export const useMinedTransactions = () => {
    const { chainId } = useChainStore();
    const { fetchTransactionsfromAPIWithCriteria } = useMinedTransactionAPI();
    return {
        fetchTransactionsfromAPIWithCriteria,
    };
};