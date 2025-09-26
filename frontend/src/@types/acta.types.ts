/**
 * ACTA (Accountable Credential Transparency and Authentication) Types
 *
 * Minimal type definitions for ACTA API responses and data structures.
 */

// ============================================================================
// BASE RESPONSE TYPES
// ============================================================================

/**
 * Successful ACTA API response
 */
export interface ActaOk<T = unknown> {
  success: true;
  data: T;
}

/**
 * Error ACTA API response
 */
export interface ActaErr {
  success: false;
  error: string;
}

/**
 * Union type for all ACTA API responses
 */
export type ActaResponse<T = unknown> = ActaOk<T> | ActaErr;

// ============================================================================
// HEALTH & STATUS TYPES
// ============================================================================

/**
 * ACTA health check response data
 */
export interface ActaHealth {
  status: "healthy" | "unhealthy" | "degraded";
  timestamp: string;
  version?: string;
  uptime?: number;
  database?: {
    status: "connected" | "disconnected";
    latency?: number;
  };
  dependencies?: Record<
    string,
    {
      status: "up" | "down";
      latency?: number;
    }
  >;
}

// ============================================================================
// CREDENTIAL TYPES
// ============================================================================

/**
 * Credential subject information
 */
export interface CredentialSubject {
  id: string;
  [key: string]: unknown;
}

/**
 * Credential issuer information
 */
export interface CredentialIssuer {
  id: string;
  name?: string;
  [key: string]: unknown;
}

/**
 * Credential status information
 */
export interface CredentialStatus {
  id: string;
  type: string;
  status?: string;
}

/**
 * Credential evidence
 */
export interface CredentialEvidence {
  id: string;
  type: string;
  [key: string]: unknown;
}

/**
 * Create credential request body
 */
export interface CreateCredentialReq {
  credentialSubject: CredentialSubject;
  issuer: CredentialIssuer;
  issuanceDate?: string;
  expirationDate?: string;
  credentialStatus?: CredentialStatus;
  evidence?: CredentialEvidence[];
  [key: string]: unknown;
}

/**
 * Create credential response data
 */
export interface CreateCredentialRes {
  id: string;
  hash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  credential: CreateCredentialReq;
}

/**
 * Get credential response data
 */
export interface GetCredentialRes {
  id: string;
  hash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  credential: CreateCredentialReq;
  metadata?: {
    verified: boolean;
    verificationDate?: string;
    issuerSignature?: string;
  };
}

/**
 * Update credential status request
 */
export interface UpdateCredentialStatusReq {
  status: string;
}

/**
 * Update credential status response data
 */
export interface UpdateCredentialStatusRes {
  id: string;
  hash: string;
  status: string;
  updatedAt: string;
}

// ============================================================================
// POOL PARTICIPATION TYPES
// ============================================================================

/**
 * Pool participation duration options
 */
export type PoolDuration = "30d" | "90d" | "180d" | "365d" | "perpetual";

/**
 * Risk level for pool participation
 */
export type PoolRiskLevel = "low" | "medium" | "high" | "very-high";

/**
 * Pool participation duration for credentials (Phase 2)
 */
export type ParticipationDuration = "3+ months" | "6+ months" | "12+ months";

/**
 * Risk level for credentials (Phase 2)
 */
export type CredentialRiskLevel = "Conservative" | "Moderate" | "Aggressive";

/**
 * Performance tier for credentials (Phase 2)
 */
export type PerformanceTier =
  | "No liquidations"
  | "Stable participant"
  | "Recovered events";

/**
 * Pool type experience for credentials (Phase 2)
 */
export type PoolTypeExperience =
  | "Multi-asset"
  | "Stablecoin"
  | "LSD"
  | "LP-Perp";

/**
 * Pool participation reputation claims for credential creation
 */
export interface ReputationClaims {
  participationDuration: ParticipationDuration;
  riskLevel: CredentialRiskLevel;
  performanceTier: PerformanceTier;
  poolTypeExperience: PoolTypeExperience[];
}

/**
 * Pool participation credential data structure (Phase 2)
 */
export interface PoolParticipationCredentialData {
  type: "PoolParticipationCredential";
  credentialSubject: {
    reputationClaims: ReputationClaims;
  };
  issuer?: string;
  issuanceDate: string;
  expirationDate?: string;
}

/**
 * Local credential record for localStorage management
 */
export interface LocalCredentialRecord {
  localId: string;
  contractId: string;
  hash: string;
  displayData: {
    type: string;
    participationDuration: ParticipationDuration;
    riskLevel: CredentialRiskLevel;
    performanceTier: PerformanceTier;
    poolTypeExperience: PoolTypeExperience[];
    issuer?: string;
  };
  createdAt: string;
}

/**
 * Pool performance metrics
 */
export interface PoolPerformance {
  apy: number; // Annual Percentage Yield
  totalValueLocked: number;
  utilizationRate: number;
  defaultRate?: number;
  historicalReturns?: Array<{
    period: string;
    return: number;
  }>;
}

/**
 * Pool type classification
 */
export type PoolType =
  | "lending"
  | "borrowing"
  | "liquidity"
  | "staking"
  | "yield-farming"
  | "derivatives"
  | "insurance";

/**
 * Pool participation claims for credential generation
 */
export interface PoolParticipationClaims {
  // Duration information
  duration: PoolDuration;
  startDate: string;
  endDate?: string; // Optional for perpetual pools

  // Risk assessment
  risk: PoolRiskLevel;
  riskScore?: number; // 0-100 risk score
  riskFactors?: string[]; // Array of risk factor descriptions

  // Performance metrics
  performance: PoolPerformance;
  expectedReturns?: {
    min: number;
    max: number;
    avg: number;
  };

  // Pool classification
  poolType: PoolType;
  poolId: string;
  poolName?: string;
  poolDescription?: string;

  // Participation details
  amount: number;
  currency: string;
  participationDate: string;

  // Additional metadata
  terms?: {
    minLockPeriod?: string;
    penaltyForEarlyWithdrawal?: number;
    autoRenewal?: boolean;
  };

  // Verification data
  verification?: {
    verifiedBy: string;
    verificationDate: string;
    verificationMethod: string;
    [key: string]: unknown;
  };
}

/**
 * Pool participation credential request
 */
export interface CreatePoolParticipationCredentialReq
  extends CreateCredentialReq {
  credentialSubject: CredentialSubject & {
    poolParticipation: PoolParticipationClaims;
  };
}

/**
 * Pool participation credential response
 */
export interface CreatePoolParticipationCredentialRes
  extends CreateCredentialRes {
  credential: CreatePoolParticipationCredentialReq;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Check if a response is successful
 */
export function isActaOk<T>(response: ActaResponse<T>): response is ActaOk<T> {
  return response.success === true;
}

/**
 * Check if a response is an error
 */
export function isActaErr(response: ActaResponse): response is ActaErr {
  return response.success === false;
}

/**
 * Extract data from successful response or throw error
 */
export function extractActaData<T>(response: ActaResponse<T>): T {
  if (isActaOk(response)) {
    return response.data;
  }
  throw new Error(response.error);
}

/**
 * Pool duration in days
 */
export const POOL_DURATION_DAYS: Record<PoolDuration, number> = {
  "30d": 30,
  "90d": 90,
  "180d": 180,
  "365d": 365,
  perpetual: Infinity,
} as const;

/**
 * Risk level weights for calculations
 */
export const RISK_LEVEL_WEIGHTS: Record<PoolRiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  "very-high": 4,
} as const;
