/**
 * ACTA (Accountable Credential Transparency and Authentication) API Client
 *
 * This client provides typed access to the ACTA API endpoints for credential
 * management and transparency operations.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Base API response structure
 */
interface ActaResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Credential creation request body
 */
interface CreateCredentialBody {
  credentialSubject: {
    id: string;
    [key: string]: unknown;
  };
  issuer: {
    id: string;
    [key: string]: unknown;
  };
  issuanceDate?: string;
  expirationDate?: string;
  credentialStatus?: {
    id: string;
    type: string;
  };
  evidence?: Array<{
    id: string;
    type: string;
    [key: string]: unknown;
  }>;
  [key: string]: unknown;
}

/**
 * Credential response data
 */
interface CredentialData {
  id: string;
  hash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  credential: CreateCredentialBody;
}

/**
 * Contract information
 */
interface ContractInfo {
  id: string;
  hash: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Client configuration options
 */
interface ActaClientConfig {
  baseUrl: string;
  apiKey?: string;
  timeout?: number;
}

/**
 * Request options for individual calls
 */
interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
}

// ============================================================================
// ACTA CLIENT CLASS
// ============================================================================

export class ActaClient {
  private baseUrl: string;
  private apiKey?: string;
  private defaultTimeout: number;

  constructor(config: ActaClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ""); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.defaultTimeout = config.timeout || 30000; // 30 seconds default
  }

  /**
   * Update the API key for future requests
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Get the current API key (masked for security)
   */
  getMaskedApiKey(): string {
    if (!this.apiKey) return "";

    const key = this.apiKey;
    if (key.length <= 8) {
      return "*".repeat(key.length);
    }

    // Show first 4 and last 4 characters, mask the middle
    const visibleStart = key.substring(0, 4);
    const visibleEnd = key.substring(key.length - 4);
    const maskedMiddle = "*".repeat(Math.max(4, key.length - 8));

    return `${visibleStart}${maskedMiddle}${visibleEnd}`;
  }

  // ============================================================================
  // HEALTH & STATUS ENDPOINTS
  // ============================================================================

  /**
   * Ping the ACTA service
   * GET /acta/ping
   */
  async ping(
    options?: RequestOptions,
  ): Promise<ActaResponse<{ message: string; timestamp: string }>> {
    return this.makeRequest("GET", "/acta/ping", undefined, options);
  }

  /**
   * Check ACTA service health
   * GET /acta/health
   */
  async health(
    options?: RequestOptions,
  ): Promise<
    ActaResponse<{ status: string; timestamp: string; version?: string }>
  > {
    return this.makeRequest("GET", "/acta/health", undefined, options);
  }

  // ============================================================================
  // CREDENTIAL OPERATIONS
  // ============================================================================

  /**
   * Create a new credential
   * POST /acta/credentials
   */
  async createCredential(
    body: CreateCredentialBody,
    options?: RequestOptions,
  ): Promise<ActaResponse<CredentialData>> {
    return this.makeRequest("POST", "/acta/credentials", body, options);
  }

  /**
   * Get credential by contract ID
   * GET /acta/credentials/contract/{id}
   */
  async getByContractId(
    id: string,
    options?: RequestOptions,
  ): Promise<ActaResponse<CredentialData>> {
    return this.makeRequest(
      "GET",
      `/acta/credentials/contract/${encodeURIComponent(id)}`,
      undefined,
      options,
    );
  }

  /**
   * Get credential by hash
   * GET /acta/credentials/hash/{hash}
   */
  async getByHash(
    hash: string,
    options?: RequestOptions,
  ): Promise<ActaResponse<CredentialData>> {
    return this.makeRequest(
      "GET",
      `/acta/credentials/hash/${encodeURIComponent(hash)}`,
      undefined,
      options,
    );
  }

  /**
   * Update credential status
   * PUT /acta/credentials/{id}/status
   */
  async updateStatus(
    id: string,
    status: string,
    options?: RequestOptions,
  ): Promise<ActaResponse<CredentialData>> {
    const body = { status };
    return this.makeRequest(
      "PUT",
      `/acta/credentials/${encodeURIComponent(id)}/status`,
      body,
      options,
    );
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Make HTTP request with proper error handling and response parsing
   */
  private async makeRequest<T>(
    method: string,
    endpoint: string,
    body?: Record<string, unknown>,
    options?: RequestOptions,
  ): Promise<ActaResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const timeout = options?.timeout || this.defaultTimeout;

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options?.headers,
    };

    // Add API key header if available
    if (this.apiKey) {
      headers["X-API-Key"] = this.apiKey;
    }

    // Prepare request configuration
    const requestConfig: RequestInit = {
      method,
      headers,
      ...(body && { body: JSON.stringify(body) }),
    };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestConfig,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response
      const responseText = await response.text();
      let responseData: unknown;

      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        // If JSON parsing fails, treat as error
        return {
          success: false,
          error: `Invalid JSON response: ${parseError instanceof Error ? parseError.message : "Unknown parse error"}`,
        };
      }

      // Check if request was successful
      if (response.ok) {
        return {
          success: true,
          data: responseData as T,
        };
      } else {
        // Handle HTTP error responses
        const errorData = responseData as Record<string, unknown>;
        const errorMessage =
          (errorData?.message as string) ||
          (errorData?.error as string) ||
          `HTTP ${response.status}: ${response.statusText}`;
        return {
          success: false,
          error: errorMessage,
        };
      }
    } catch (error) {
      // Handle network errors, timeouts, etc.
      if (error instanceof Error) {
        if (error.name === "AbortError") {
          return {
            success: false,
            error: `Request timeout after ${timeout}ms`,
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }

      return {
        success: false,
        error: "Unknown error occurred",
      };
    }
  }
}

// ============================================================================
// CONVENIENCE FACTORY FUNCTION
// ============================================================================

/**
 * Create a new ACTA client instance
 */
export function createActaClient(config: ActaClientConfig): ActaClient {
  return new ActaClient(config);
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type {
  ActaResponse,
  CreateCredentialBody,
  CredentialData,
  ContractInfo,
  ActaClientConfig,
  RequestOptions,
};
