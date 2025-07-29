import { useState, useEffect, useCallback } from "react";
import { poolService, PoolData } from "@/lib/services/poolService";
import { toast } from "sonner";

export interface UsePoolDataReturn {
  // Core data
  totalDeposits: Map<string, bigint>;
  totalBorrows: Map<string, bigint>;
  reserves: Map<string, unknown>;
  poolMetadata: {
    name: string;
    oracle: string;
    backstopRate: number;
    maxPositions: number;
    reserves: string[];
  } | null;
  backstopStatus: {
    isActive: boolean;
    totalShares: bigint;
    totalTokens: bigint;
  } | null;

  // State management
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
  isInitializing: boolean;

  // Actions
  refetch: () => Promise<void>;
  clearError: () => void;
}

/**
 * Enhanced React hook for fetching and polling TrustBridge pool data
 * Connects to real blockchain data with proper loading states and error handling
 */
export function usePoolData(): UsePoolDataReturn {
  const [poolData, setPoolData] = useState<PoolData>({
    totalDeposits: new Map(),
    totalBorrows: new Map(),
    reserves: new Map(),
    poolMetadata: null,
    backstopStatus: null,
    lastUpdated: new Date(),
  });

  const [loading, setLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolData = useCallback(async (showToast = false) => {
    try {
      setLoading(true);
      setError(null);

      if (showToast) {
        toast.info("Refreshing pool data...");
      }

      const data = await poolService.fetchPoolData();

      setPoolData(data);

      if (showToast) {
        toast.success("Pool data updated successfully");
      }

      console.log("Pool data updated:", {
        totalDeposits: Array.from(data.totalDeposits.entries()),
        totalBorrows: Array.from(data.totalBorrows.entries()),
        lastUpdated: data.lastUpdated,
      });
    } catch (error) {
      console.error("Error fetching pool data:", error);

      const errorMessage =
        error instanceof Error ? error.message : "Failed to fetch pool data";

      setError(errorMessage);

      if (showToast) {
        toast.error(`Failed to update pool data: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
      setIsInitializing(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize and set up polling
  useEffect(() => {
    let mounted = true;

    const initializeAndFetch = async () => {
      try {
        setIsInitializing(true);

        // Initialize pool service
        await poolService.initialize();

        if (mounted) {
          await fetchPoolData();
        }
      } catch (error) {
        console.error("Failed to initialize pool service:", error);
        if (mounted) {
          setError("Failed to connect to pool contract");
          setLoading(false);
          setIsInitializing(false);
        }
      }
    };

    initializeAndFetch();

    // Set up polling every 30 seconds
    const pollInterval = setInterval(() => {
      if (mounted) {
        fetchPoolData();
      }
    }, 30000);

    return () => {
      mounted = false;
      clearInterval(pollInterval);
    };
  }, [fetchPoolData]);

  return {
    // Core data
    totalDeposits: poolData.totalDeposits,
    totalBorrows: poolData.totalBorrows,
    reserves: poolData.reserves,
    poolMetadata: poolData.poolMetadata,
    backstopStatus: poolData.backstopStatus,

    // State management
    loading,
    error,
    lastUpdated: poolData.lastUpdated,
    isInitializing,

    // Actions
    refetch: () => fetchPoolData(true),
    clearError,
  };
}

export default usePoolData;
