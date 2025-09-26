/**
 * Hook for managing credential creation
 *
 * Provides functionality to create pool participation credentials using the Acta client,
 * with proper error handling, loading states, and local storage management.
 */

import { useState, useCallback } from "react";
import {
  ActaClient,
  CreateCredentialBody,
  CredentialData,
} from "@/lib/acta/client";
import {
  PoolParticipationCredentialData,
  ReputationClaims,
  LocalCredentialRecord,
} from "@/@types/acta.types";

// Re-export LocalCredentialRecord for convenience
export type { LocalCredentialRecord } from "@/@types/acta.types";

/**
 * Credential creation form data
 */
export interface CredentialCreateFormData {
  reputationClaims: ReputationClaims;
  issuer?: string;
  expirationDate?: string;
}

/**
 * Credential creation result (from Acta API)
 */
export interface CredentialCreateResult {
  contractId: string;
  hash: string;
  transactionHash: string;
  createdAt: string;
  ledgerSequence: number;
}

/**
 * Hook return type
 */
export interface UseCredentialCreateReturn {
  // State
  isLoading: boolean;
  error: string | null;

  // Actions
  createCredential: (
    formData: CredentialCreateFormData,
  ) => Promise<CredentialCreateResult | null>;
  clearError: () => void;
}

/**
 * Hook configuration
 */
export interface UseCredentialCreateConfig {
  client: ActaClient;
  onSuccess?: (result: CredentialCreateResult) => void;
  onError?: (error: string) => void;
}

/**
 * Local storage key for credential index
 */
const CREDENTIAL_INDEX_KEY = "tb_vc_index_v1";

/**
 * Generate a unique local ID
 */
function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Save credential record to localStorage
 */
function saveCredentialToLocalStorage(record: LocalCredentialRecord): void {
  try {
    const existingIndex = localStorage.getItem(CREDENTIAL_INDEX_KEY);
    const index: LocalCredentialRecord[] = existingIndex
      ? JSON.parse(existingIndex)
      : [];

    index.push(record);
    localStorage.setItem(CREDENTIAL_INDEX_KEY, JSON.stringify(index));
  } catch (error) {
    console.error("Failed to save credential to localStorage:", error);
    // Don't throw - this is not critical for credential creation
  }
}

/**
 * Hook for credential creation
 */
export function useCredentialCreate(
  config: UseCredentialCreateConfig,
): UseCredentialCreateReturn {
  const { client, onSuccess, onError } = config;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const createCredential = useCallback(
    async (
      formData: CredentialCreateFormData,
    ): Promise<CredentialCreateResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        // Prepare credential data
        const credentialData: PoolParticipationCredentialData = {
          type: "PoolParticipationCredential",
          credentialSubject: {
            reputationClaims: formData.reputationClaims,
          },
          issuer: formData.issuer,
          issuanceDate: new Date().toISOString(),
          expirationDate: formData.expirationDate,
        };

        // Prepare request body for Acta client
        const requestBody: CreateCredentialBody = {
          data: credentialData,
          metadata: {
            createdAt: new Date().toISOString(),
            source: "trustbridge-frontend",
          },
        };

        // Create credential via Acta client
        const response = await client.createCredential(requestBody);

        if (!response.success) {
          throw new Error(response.error || "Failed to create credential");
        }
        console.log("response", response);
        // The API response has nested data structure: response.data.data
        const responseData = response.data as unknown as {
          data: CredentialData;
        };
        const credentialResponse = responseData.data;

        const result: CredentialCreateResult = {
          contractId: credentialResponse.contractId,
          hash: credentialResponse.hash,
          transactionHash: credentialResponse.transactionHash,
          createdAt: credentialResponse.createdAt,
          ledgerSequence: credentialResponse.ledgerSequence,
        };

        // Save to localStorage for local indexing (optional convenience feature)
        try {
          const localId = generateLocalId();
          const localRecord: LocalCredentialRecord = {
            localId,
            contractId: credentialResponse.contractId,
            hash: credentialResponse.hash,
            displayData: {
              type: credentialData.type,
              participationDuration:
                formData.reputationClaims.participationDuration,
              riskLevel: formData.reputationClaims.riskLevel,
              performanceTier: formData.reputationClaims.performanceTier,
              poolTypeExperience: formData.reputationClaims.poolTypeExperience,
              issuer: formData.issuer,
            },
            createdAt: new Date().toISOString(),
          };
          saveCredentialToLocalStorage(localRecord);
          console.log("Saved to localStorage:", localRecord);
        } catch (localStorageError) {
          console.warn(
            "Failed to save credential to localStorage:",
            localStorageError,
          );
        }

        // Call success callback
        onSuccess?.(result);

        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        onError?.(errorMessage);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [client, onSuccess, onError],
  );

  return {
    isLoading,
    error,
    createCredential,
    clearError,
  };
}

/**
 * Utility function to get all credentials from localStorage
 */
export function getCredentialsFromLocalStorage(): LocalCredentialRecord[] {
  try {
    const data = localStorage.getItem(CREDENTIAL_INDEX_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Failed to read credentials from localStorage:", error);
    return [];
  }
}

/**
 * Utility function to remove a credential from localStorage
 */
export function removeCredentialFromLocalStorage(localId: string): boolean {
  try {
    const existingIndex = localStorage.getItem(CREDENTIAL_INDEX_KEY);
    const index: LocalCredentialRecord[] = existingIndex
      ? JSON.parse(existingIndex)
      : [];

    const filteredIndex = index.filter((record) => record.localId !== localId);
    localStorage.setItem(CREDENTIAL_INDEX_KEY, JSON.stringify(filteredIndex));

    return filteredIndex.length < index.length;
  } catch (error) {
    console.error("Failed to remove credential from localStorage:", error);
    return false;
  }
}
