"use client";

import { useBorrowAPY } from "@/hooks/useBorrowAPY";
import { Sparkline } from "@/components/ui/sparkline";
import { LoadingState } from "@/components/ui/loading-states";
import { AlertCircle, TrendingUp, TrendingDown } from "lucide-react";

interface BorrowAPYDisplayProps {
  supplied: Record<"USDC" | "XLM" | "TBRG", number>;
  borrowed: Record<"USDC" | "XLM" | "TBRG", number>;
  loading?: boolean;
  error?: string | null;
  lastUpdated?: Date | null;
}

export function BorrowAPYDisplay({
  supplied,
  borrowed,
  loading = false,
  error = null,
  lastUpdated,
}: BorrowAPYDisplayProps) {
  const { rates: borrowAPYs, apyHistory } = useBorrowAPY(supplied, borrowed);

  // Show loading state if data is loading
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">
            Real-time Borrow APY
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
            <span>Updating...</span>
          </div>
        </div>
        <LoadingState type="loading" />
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-200">
            Real-time Borrow APY
          </h3>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-3 text-red-400">
            <AlertCircle className="w-5 h-5" />
            <div>
              <h4 className="font-medium">Connection Error</h4>
              <p className="text-sm text-gray-400 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate trend for each token
  const getTrend = (token: string) => {
    const history = apyHistory[token as keyof typeof apyHistory] || [];
    if (history.length < 2) return "neutral";

    const recent = history.slice(-3);
    const first = recent[0]?.apy || 0;
    const last = recent[recent.length - 1]?.apy || 0;

    if (last > first + 0.1) return "up";
    if (last < first - 0.1) return "down";
    return "neutral";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-200">
          Real-time Borrow APY
        </h3>
        {lastUpdated && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {borrowAPYs.map((rate) => {
          const history = apyHistory[rate.token] || [];
          const apyValues = history.map((h) => h.apy);
          const trend = getTrend(rate.token);

          return (
            <div
              key={rate.token}
              className="card p-4 relative group hover:bg-dark-tertiary transition-colors"
            >
              {/* Trend indicator */}
              <div className="absolute top-2 right-2">
                {trend === "up" && (
                  <TrendingUp className="w-4 h-4 text-green-500" />
                )}
                {trend === "down" && (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
                    {rate.token === "USDC" ? (
                      <img
                        src="/img/tokens/usdc.png"
                        alt="USDC"
                        className="w-8 h-8 object-contain"
                      />
                    ) : rate.token === "XLM" ? (
                      <img
                        src="/img/tokens/xlm.png"
                        alt="XLM"
                        className="w-8 h-8 object-contain"
                      />
                    ) : (
                      <img
                        src="/img/tokens/tbt.png"
                        alt="TBRG"
                        className="w-8 h-8 object-contain"
                      />
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{rate.token}</span>
                    <div className="text-xs text-gray-400">
                      {rate.token === "USDC"
                        ? "USD Coin"
                        : rate.token === "XLM"
                          ? "Stellar Lumens"
                          : "TrustBridge Token"}
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="flex items-center gap-2">
                  <Sparkline
                    data={apyValues}
                    color={
                      rate.token === "USDC"
                        ? "#3b82f6"
                        : rate.token === "XLM"
                          ? "#8b5cf6"
                          : "#10b981"
                    }
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-400">Borrow APY:</span>
                  <div className="flex items-center gap-1">
                    <span className="text-warning font-semibold text-lg">
                      {rate.apy}%
                    </span>
                    {trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {trend === "down" && (
                      <TrendingDown className="w-3 h-3 text-red-500" />
                    )}
                  </div>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Utilization:</span>
                  <span
                    className={`font-medium ${
                      rate.utilizationRate > 80
                        ? "text-red-400"
                        : rate.utilizationRate > 60
                          ? "text-yellow-400"
                          : "text-green-400"
                    }`}
                  >
                    {rate.utilizationRate}%
                  </span>
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-500">Supplied:</span>
                    <span className="text-gray-300">
                      {supplied[rate.token]?.toLocaleString() || 0}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Borrowed:</span>
                    <span className="text-gray-300">
                      {borrowed[rate.token]?.toLocaleString() || 0}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
