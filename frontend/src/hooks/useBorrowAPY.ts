import { useMemo, useState, useEffect, useCallback } from "react";

type Token = "USDC" | "XLM" | "TBRG";

interface APY {
  token: Token;
  apy: number;
  utilizationRate: number;
}

interface APYHistory {
  token: Token;
  apy: number;
  timestamp: number;
}

export function useBorrowAPY(
  supplied: Record<Token, number>,
  borrowed: Record<Token, number>,
) {
  // State to store the calculated rates
  const [rates, setRates] = useState<APY[]>([]);

  // State to store APY history for sparklines (last 20 data points)
  const [apyHistory, setApyHistory] = useState<Record<Token, APYHistory[]>>({
    USDC: [],
    XLM: [],
    TBRG: [],
  });

  // Base rates per token (from RESERVE_CONFIGS in contracts.ts)
  const baseRates: Record<Token, number> = {
    USDC: 0.01, // 1% base rate
    XLM: 0.02, // 2% base rate
    TBRG: 0.03, // 3% base rate
  };

  // Multipliers for rate increase based on utilization
  const multipliers: Record<Token, number> = {
    USDC: 0.25, // Up to 25% at 100% utilization
    XLM: 0.3, // Up to 30% at 100% utilization
    TBRG: 0.35, // Up to 35% at 100% utilization
  };

  // Function to calculate APY rates
  const calculateRates = useMemo(() => {
    return () => {
      const result: APY[] = [];
      const now = Date.now();

      (["USDC", "XLM", "TBRG"] as Token[]).forEach((token) => {
        const suppliedAmount = supplied[token] || 0;
        const borrowedAmount = borrowed[token] || 0;

        // Calculate utilization rate
        const utilizationRate =
          suppliedAmount === 0 ? 0 : borrowedAmount / suppliedAmount;

        // Clamp utilization rate to 0-1 range
        const clampedUtilization = Math.min(Math.max(utilizationRate, 0), 1);

        // Calculate APY using base rate + utilization multiplier
        const baseRate = baseRates[token];
        const multiplier = multipliers[token];
        const apy = baseRate + clampedUtilization * multiplier;
        const apyPercentage = parseFloat((apy * 100).toFixed(2));

        result.push({
          token,
          apy: apyPercentage,
          utilizationRate: parseFloat((clampedUtilization * 100).toFixed(2)),
        });

        // Update APY history for sparkline
        setApyHistory((prev) => {
          const tokenHistory = prev[token] || [];
          const newEntry: APYHistory = {
            token,
            apy: apyPercentage,
            timestamp: now,
          };

          // Keep only last 20 entries
          const updatedHistory = [...tokenHistory, newEntry].slice(-20);

          return {
            ...prev,
            [token]: updatedHistory,
          };
        });
      });

      return result;
    };
  }, [
    supplied.USDC,
    supplied.XLM,
    supplied.TBRG,
    borrowed.USDC,
    borrowed.XLM,
    borrowed.TBRG,
  ]);

  // Manual refetch function that can be called to force immediate update
  const refetch = useCallback(() => {
    setRates(calculateRates());
  }, [calculateRates]);

  // Polling effect - update rates every 15 seconds
  useEffect(() => {
    // Initial calculation
    setRates(calculateRates());

    // Set up polling interval
    const interval = setInterval(() => {
      setRates(calculateRates());
    }, 15000); // 15 seconds

    // Cleanup function to clear interval when component unmounts
    return () => {
      clearInterval(interval);
    };
  }, [calculateRates]);

  return { rates, refetch, apyHistory };
}
