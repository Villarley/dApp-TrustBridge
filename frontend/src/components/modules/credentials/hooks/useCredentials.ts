/**
 * Hook for managing credentials - fetching, filtering, and status updates
 *
 * Provides functionality to load credentials from localStorage and fetch
 * their current status from the Acta API, with optimistic updates for status changes.
 */

import { useState, useEffect, useCallback } from "react";
import { ActaClient } from "@/lib/acta/client";
import {
  LocalCredentialRecord,
  getCredentialsFromLocalStorage,
  removeCredentialFromLocalStorage,
} from "./useCredentialCreate";

/**
 * Extended credential record with status information
 */
export interface CredentialWithStatus extends LocalCredentialRecord {
  status?: "Active" | "Revoked" | "Suspended";
  lastChecked?: string;
  isFetching?: boolean;
}

/**
 * Status filter options
 */
export type StatusFilter = "All" | "Active" | "Revoked" | "Suspended";

/**
 * Hook configuration
 */
export interface UseCredentialsConfig {
  client: ActaClient;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
}

/**
 * Hook return type
 */
export interface UseCredentialsReturn {
  // State
  credentials: CredentialWithStatus[];
  isLoading: boolean;
  error: string | null;

  // Filters
  statusFilter: StatusFilter;
  setStatusFilter: (filter: StatusFilter) => void;

  // Actions
  refreshCredentials: () => Promise<void>;
  updateCredentialStatus: (
    contractId: string,
    status: "Active" | "Revoked" | "Suspended",
  ) => Promise<boolean>;
  removeCredential: (localId: string) => boolean;

  // Computed
  filteredCredentials: CredentialWithStatus[];
  credentialsByStatus: Record<StatusFilter, number>;
}

/**
 * Fetch credential status from Acta API
 */
async function fetchCredentialStatus(
  client: ActaClient,
  contractId: string,
): Promise<"Active" | "Revoked" | "Suspended"> {
  try {
    const response = await client.getByContractId(contractId);

    if (!response.success) {
      console.warn(`Failed to fetch status for ${contractId}:`, response.error);
      return "Active"; // Default to Active if we can't fetch
    }

    // Assuming the API returns a status field
    const credentialData = response.data as {
      status?: string;
      credential?: { status?: string };
    };
    const status =
      credentialData?.status || credentialData?.credential?.status || "Active";

    // Normalize status values
    switch (status.toLowerCase()) {
      case "active":
      case "issued":
        return "Active";
      case "revoked":
        return "Revoked";
      case "suspended":
        return "Suspended";
      default:
        return "Active";
    }
  } catch (error) {
    console.warn(`Error fetching status for ${contractId}:`, error);
    return "Active"; // Default to Active on error
  }
}

/**
 * Update credential status via Acta API
 */
async function updateCredentialStatusOnServer(
  client: ActaClient,
  contractId: string,
  status: "Active" | "Revoked" | "Suspended",
): Promise<boolean> {
  try {
    const response = await client.updateStatus(contractId, status);
    return response.success;
  } catch (updateError) {
    console.error(`Error updating status for ${contractId}:`, updateError);
    return false;
  }
}

/**
 * Hook for managing credentials
 */
export function useCredentials(
  config: UseCredentialsConfig,
): UseCredentialsReturn {
  const { client, autoRefresh = true, refreshInterval = 30000 } = config;

  const [credentials, setCredentials] = useState<CredentialWithStatus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");

  /**
   * Load credentials from localStorage and fetch their status
   */
  const refreshCredentials = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load from localStorage
      const localCredentials = getCredentialsFromLocalStorage();

      // Convert to CredentialWithStatus and fetch status for each
      const credentialsWithStatus: CredentialWithStatus[] = await Promise.all(
        localCredentials.map(async (credential) => {
          const credentialWithStatus: CredentialWithStatus = {
            ...credential,
            isFetching: true,
          };

          try {
            const status = await fetchCredentialStatus(
              client,
              credential.contractId,
            );
            return {
              ...credentialWithStatus,
              status,
              lastChecked: new Date().toISOString(),
              isFetching: false,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch status for ${credential.contractId}:`,
              error,
            );
            return {
              ...credentialWithStatus,
              status: "Active" as const,
              lastChecked: new Date().toISOString(),
              isFetching: false,
            };
          }
        }),
      );

      setCredentials(credentialsWithStatus);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load credentials";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  /**
   * Update credential status with optimistic updates
   */
  const updateCredentialStatus = useCallback(
    async (
      contractId: string,
      newStatus: "Active" | "Revoked" | "Suspended",
    ): Promise<boolean> => {
      // Optimistic update
      setCredentials((prevCredentials) =>
        prevCredentials.map((credential) =>
          credential.contractId === contractId
            ? { ...credential, status: newStatus }
            : credential,
        ),
      );

      try {
        // Update on server
        const success = await updateCredentialStatusOnServer(
          client,
          contractId,
          newStatus,
        );

        if (!success) {
          // Rollback optimistic update on error
          setCredentials((prevCredentials) =>
            prevCredentials.map((credential) =>
              credential.contractId === contractId
                ? { ...credential, status: "Active" } // Rollback to default
                : credential,
            ),
          );
          return false;
        }

        return true;
      } catch {
        // Rollback optimistic update on error
        setCredentials((prevCredentials) =>
          prevCredentials.map((credential) =>
            credential.contractId === contractId
              ? { ...credential, status: "Active" } // Rollback to default
              : credential,
          ),
        );
        return false;
      }
    },
    [client],
  );

  /**
   * Remove credential from localStorage
   */
  const removeCredential = useCallback((localId: string): boolean => {
    const success = removeCredentialFromLocalStorage(localId);
    if (success) {
      setCredentials((prevCredentials) =>
        prevCredentials.filter((credential) => credential.localId !== localId),
      );
    }
    return success;
  }, []);

  // Load credentials on mount
  useEffect(() => {
    refreshCredentials();
  }, [refreshCredentials]);

  // Auto-refresh if enabled
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refreshCredentials();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, refreshCredentials]);

  // Computed values
  const filteredCredentials = credentials.filter((credential) => {
    if (statusFilter === "All") return true;
    return credential.status === statusFilter;
  });

  const credentialsByStatus = credentials.reduce(
    (acc, credential) => {
      const status = credential.status || "Active";
      acc[status] = (acc[status] || 0) + 1;
      acc["All"] = (acc["All"] || 0) + 1;
      return acc;
    },
    {} as Record<StatusFilter, number>,
  );

  return {
    credentials,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    refreshCredentials,
    updateCredentialStatus,
    removeCredential,
    filteredCredentials,
    credentialsByStatus,
  };
}

/**
 * Utility function to format credential summary for sharing
 */
export function formatCredentialSummary(
  credential: CredentialWithStatus,
  showContractDetails: boolean = false,
): string {
  const { displayData, contractId, hash } = credential;

  let summary = `TrustBridge — Pool Participation Credential\n`;
  summary += `• Duration: ${displayData.participationDuration}\n`;
  summary += `• Risk: ${displayData.riskLevel}\n`;
  summary += `• Performance: ${displayData.performanceTier}\n`;
  summary += `• Pools: ${displayData.poolTypeExperience.join(", ")}\n`;

  if (displayData.issuer) {
    summary += `• Issuer: ${displayData.issuer}\n`;
  }

  if (showContractDetails && contractId && hash) {
    summary += `\nContract ID: ${contractId.substring(0, 8)}...\n`;
    summary += `Hash: ${hash.substring(0, 8)}...`;
  }

  return summary;
}

/**
 * Utility function to copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (clipboardError) {
    console.error("Failed to copy to clipboard:", clipboardError);
    return false;
  }
}
