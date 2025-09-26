"use client";

import { useEffect, useState } from "react";
import { useBorrow } from "../../hooks/useBorrow.hook";
import {
  monitorHealthFactor,
  getHealthFactorAlerts,
  calculateMaxBorrowable,
  calculateLiquidationPrice,
  type HealthFactorResult,
} from "@/helpers/health-factor.helper";
import { useWalletContext } from "@/providers/wallet.provider";
import { CredentialSelector } from "@/components/modules/credentials/ui/components/CredentialSelector";
import { CredentialWithStatus } from "@/components/modules/credentials/hooks/useCredentials";
import { ActaClient } from "@/lib/acta/client";

interface PoolReserve {
  symbol: string;
  supplied: string;
  borrowed: string;
  supplyAPY: string;
  borrowAPY: string;
}

interface PoolData {
  name: string;
  totalSupplied: string;
  totalBorrowed: string;
  utilizationRate: string;
  reserves: PoolReserve[];
}

interface BorrowModalProps {
  isOpen: boolean;
  onClose: () => void;
  poolData: PoolData | null;
  poolId?: string;
}

export function BorrowModal({ isOpen, onClose, poolId }: BorrowModalProps) {
  const { walletAddress } = useWalletContext();
  const [healthFactor, setHealthFactor] = useState<HealthFactorResult | null>(
    null,
  );
  const [alerts, setAlerts] = useState<string[]>([]);
  const [maxBorrowable, setMaxBorrowable] = useState<number>(0);
  const [liquidationPrice, setLiquidationPrice] = useState<number>(0);
  const [selectedCredential, setSelectedCredential] = useState<
    CredentialWithStatus | undefined
  >();

  // Initialize Acta client (in a real app, this would come from context/config)
  const actaClient = new ActaClient({
    baseUrl: process.env.NEXT_PUBLIC_ACTA_API_URL || "http://localhost:3001",
    apiKey: process.env.NEXT_PUBLIC_ACTA_API_KEY,
  });

  const {
    borrowAmount,
    loading,
    estimates,
    setBorrowAmount,
    handleBorrow,
    isHealthy,
    isAtRisk,
    isBorrowDisabled,
  } = useBorrow({ isOpen, onClose, poolId });

  // Monitor health factor in real-time
  useEffect(() => {
    if (!isOpen || !walletAddress) return;

    const stopMonitoring = monitorHealthFactor(walletAddress, (result) => {
      setHealthFactor(result);
      setAlerts(getHealthFactorAlerts(result));

      // Calculate max borrowable amount
      const maxBorrow = calculateMaxBorrowable(
        result.collateralValue,
        85, // USDC collateral factor
        result.borrowedValue,
      );
      setMaxBorrowable(maxBorrow);

      // Calculate liquidation price
      const liqPrice = calculateLiquidationPrice(
        result.borrowedValue,
        result.collateralValue,
        85, // USDC collateral factor
      );
      setLiquidationPrice(liqPrice);
    });

    return stopMonitoring;
  }, [isOpen, walletAddress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="card bg-dark-secondary p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <i className="fas fa-arrow-down text-warning text-xl"></i>
            <div>
              <h3 className="text-xl font-semibold text-white">Borrow USDC</h3>
              <p className="text-gray-400 text-sm">
                Borrow USDC against your collateral
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        {/* Real-time Health Factor Alerts */}
        {alerts.length > 0 && (
          <div className="mb-4 space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded border-l-4 ${
                  alert.includes("CRITICAL")
                    ? "bg-red-900 bg-opacity-20 border-red-500 text-red-300"
                    : alert.includes("WARNING")
                      ? "bg-yellow-900 bg-opacity-20 border-yellow-500 text-yellow-300"
                      : "bg-blue-900 bg-opacity-20 border-blue-500 text-blue-300"
                }`}
              >
                <div className="flex items-start gap-2">
                  <i
                    className={`fas ${
                      alert.includes("CRITICAL")
                        ? "fa-exclamation-triangle"
                        : "fa-info-circle"
                    } mt-0.5`}
                  ></i>
                  <div className="text-sm">{alert}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {/* Amount Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="form-label">Amount to Borrow</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400 bg-dark-tertiary px-2 py-1 rounded">
                  USDC
                </span>
                {maxBorrowable > 0 && (
                  <span className="text-xs text-success">
                    Max: ${maxBorrowable.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <input
              type="number"
              className="form-input text-lg h-12"
              placeholder="0.00"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              min="0"
              max={maxBorrowable}
              step="0.01"
              disabled={loading}
            />
            {/* Quick Amount Buttons */}
            <div className="flex gap-2 mt-2">
              {[100, 500, 1000, 2500].map((amount) => (
                <button
                  key={amount}
                  className={`btn-secondary text-xs flex-1 ${
                    amount > maxBorrowable
                      ? "opacity-50 cursor-not-allowed"
                      : ""
                  }`}
                  onClick={() =>
                    amount <= maxBorrowable &&
                    setBorrowAmount(amount.toString())
                  }
                  disabled={loading || amount > maxBorrowable}
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>

          {/* Credential Selection (Optional) */}
          <div>
            <label className="form-label mb-2">
              <i className="fas fa-certificate text-success mr-2"></i>
              Verify Reputation (Optional)
            </label>
            <CredentialSelector
              client={actaClient}
              onCredentialSelect={setSelectedCredential}
              selectedCredential={selectedCredential}
              placeholder="Select a credential to unlock better terms"
            />
            {selectedCredential && (
              <div className="mt-2 p-3 bg-green-900/20 border border-green-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <i className="fas fa-check-circle text-green-400"></i>
                  <span className="text-sm text-green-300">
                    Credential selected:{" "}
                    {selectedCredential.displayData.riskLevel} •{" "}
                    {selectedCredential.displayData.performanceTier}
                  </span>
                </div>
                {/* TODO: Implement dynamic interest rate calculation based on selectedCredential
                    - Conservative risk level: -0.5% interest rate discount
                    - No liquidations performance: -0.75% interest rate discount  
                    - 12+ months duration: -0.5% interest rate discount
                    - Calculate final rate and update UI dynamically
                    - Send credential data to smart contract for on-chain verification */}
                <p className="text-xs text-green-200 mt-1">
                  You may qualify for better interest rates
                </p>
              </div>
            )}
          </div>

          {/* Transaction Preview */}
          {borrowAmount && Number(borrowAmount) > 0 && (
            <div className="border-t border-custom pt-4">
              <h4 className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
                <i className="fas fa-arrow-right"></i>
                Borrow Overview
              </h4>

              {/* Enhanced Health Factor Card */}
              <div className="card p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-400">Health Factor</span>
                  <div className="flex items-center gap-1">
                    {healthFactor?.riskLevel === "safe" ? (
                      <i className="fas fa-check-circle text-success"></i>
                    ) : healthFactor?.riskLevel === "warning" ? (
                      <i className="fas fa-exclamation-triangle text-warning"></i>
                    ) : (
                      <i className="fas fa-exclamation-triangle text-danger"></i>
                    )}
                  </div>
                </div>
                <div
                  className={`text-xl font-bold ${
                    healthFactor?.riskLevel === "safe"
                      ? "text-success"
                      : healthFactor?.riskLevel === "warning"
                        ? "text-warning"
                        : "text-danger"
                  }`}
                >
                  {healthFactor?.healthFactor
                    ? healthFactor.healthFactor.toFixed(2)
                    : estimates.healthFactor.toFixed(2)}
                </div>
                <div className="mt-2">
                  <div className="w-full bg-dark-tertiary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${
                        healthFactor?.riskLevel === "safe"
                          ? "bg-success"
                          : healthFactor?.riskLevel === "warning"
                            ? "bg-warning"
                            : "bg-danger"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(0, ((healthFactor?.healthFactor || estimates.healthFactor) / 3) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>
                      {healthFactor?.riskLevel === "safe"
                        ? "Healthy position"
                        : healthFactor?.riskLevel === "warning"
                          ? "At risk"
                          : "Liquidation risk"}
                    </span>
                    <span>Liquidation: 1.0</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Borrow Stats */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="card p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <i className="fas fa-percentage text-warning text-xs"></i>
                    <span className="text-xs text-gray-400">Borrow APY</span>
                  </div>
                  <div className="text-sm font-semibold text-warning">
                    {estimates.borrowAPY}%
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <i className="fas fa-shield text-gray-400 text-xs"></i>
                    <span className="text-xs text-gray-400">
                      Liquidation Threshold
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-white">
                    {estimates.liquidationThreshold}%
                  </div>
                </div>
              </div>

              {/* Collateral Information */}
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div className="card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-dollar-sign text-gray-400 text-xs"></i>
                      <span className="text-xs text-gray-400">
                        Required Collateral
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      $
                      {estimates.requiredCollateral > 0
                        ? estimates.requiredCollateral.toLocaleString()
                        : "--"}
                    </div>
                  </div>
                </div>
                <div className="card p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <i className="fas fa-chart-line text-gray-400 text-xs"></i>
                      <span className="text-xs text-gray-400">
                        Liquidation Price
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      $
                      {liquidationPrice > 0
                        ? liquidationPrice.toFixed(2)
                        : "--"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Position Summary */}
              {healthFactor && (
                <div className="card p-3 mb-3">
                  <div className="text-xs text-gray-400 mb-2">
                    Current Position
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Collateral:</span>
                      <span className="text-white ml-1">
                        ${healthFactor.collateralValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Borrowed:</span>
                      <span className="text-white ml-1">
                        ${healthFactor.borrowedValue.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Ratio:</span>
                      <span className="text-white ml-1">
                        {healthFactor.collateralRatio.toFixed(1)}%
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Max Borrow:</span>
                      <span className="text-success ml-1">
                        ${maxBorrowable.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Health Factor Warning */}
          {(healthFactor || estimates.healthFactor > 0) && (
            <div
              className={`p-3 rounded border-l-4 ${
                (healthFactor?.riskLevel ||
                  (isHealthy ? "safe" : isAtRisk ? "warning" : "danger")) ===
                "safe"
                  ? "bg-green-900 bg-opacity-20 border-success text-success"
                  : (healthFactor?.riskLevel ||
                        (isHealthy
                          ? "safe"
                          : isAtRisk
                            ? "warning"
                            : "danger")) === "warning"
                    ? "bg-yellow-900 bg-opacity-20 border-warning text-warning"
                    : "bg-red-900 bg-opacity-20 border-danger text-danger"
              }`}
            >
              <div className="flex items-start gap-2">
                {(healthFactor?.riskLevel ||
                  (isHealthy ? "safe" : isAtRisk ? "warning" : "danger")) ===
                "safe" ? (
                  <i className="fas fa-check-circle mt-0.5"></i>
                ) : (
                  <i className="fas fa-exclamation-triangle mt-0.5"></i>
                )}
                <div className="text-sm">
                  {healthFactor?.recommendations?.[0] ||
                    (isHealthy ? (
                      <>
                        <strong>Healthy Position:</strong> You have sufficient
                        collateral buffer for this borrow amount.
                      </>
                    ) : isAtRisk ? (
                      <>
                        <strong>Position At Risk:</strong> Consider reducing
                        borrow amount or adding more collateral.
                      </>
                    ) : (
                      <>
                        <strong>Dangerous Position:</strong> This could lead to
                        immediate liquidation!
                      </>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Risk Disclaimer */}
          <div className="p-3 rounded bg-blue-900 bg-opacity-20 border border-blue-700 text-blue-300">
            <div className="flex items-start gap-2">
              <i className="fas fa-info-circle mt-0.5 text-blue-400"></i>
              <div className="text-sm">
                <strong>Risk Disclaimer:</strong> Borrowing involves liquidation
                risk. Monitor your health factor regularly and maintain adequate
                collateral ratios to avoid liquidation. Market volatility can
                affect your position&apos;s health factor.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              className="btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            {/* TODO: Modify handleBorrow to include selectedCredential data
                  - Pass credential contractId and hash to smart contract
                  - Include risk level and performance tier for rate calculation
                  - Verify credential on-chain before applying benefits */}
            <button
              className={`${
                healthFactor?.riskLevel === "liquidatable" ||
                healthFactor?.riskLevel === "danger"
                  ? "btn-danger"
                  : "btn-primary"
              }`}
              onClick={handleBorrow}
              disabled={
                isBorrowDisabled || healthFactor?.riskLevel === "liquidatable"
              }
            >
              {loading ? (
                <>
                  <div className="loader mr-2"></div>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-arrow-down mr-2"></i>
                  Borrow USDC
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
