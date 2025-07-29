import { Loader2, AlertCircle, RefreshCw } from "lucide-react";

interface LoadingStateProps {
  type: "initializing" | "loading" | "error" | "refreshing";
  message?: string;
  onRetry?: () => void;
}

export function LoadingState({ type, message, onRetry }: LoadingStateProps) {
  const getContent = () => {
    switch (type) {
      case "initializing":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-blue-500" />,
          title: "Connecting to Pool Contract",
          description:
            "Establishing connection to the TrustBridge pool on Stellar network...",
          className: "text-blue-500",
        };

      case "loading":
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-green-500" />,
          title: "Loading Pool Data",
          description: "Fetching real-time data from the blockchain...",
          className: "text-green-500",
        };

      case "refreshing":
        return {
          icon: <RefreshCw className="w-8 h-8 animate-spin text-yellow-500" />,
          title: "Refreshing Data",
          description: "Updating pool information...",
          className: "text-yellow-500",
        };

      case "error":
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-500" />,
          title: "Connection Error",
          description:
            message || "Failed to connect to pool contract. Please try again.",
          className: "text-red-500",
        };
    }
  };

  const content = getContent();

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <div className="flex flex-col items-center space-y-3">
        {content.icon}
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${content.className}`}>
            {content.title}
          </h3>
          <p className="text-gray-400 text-sm mt-1 max-w-md">
            {content.description}
          </p>
        </div>
      </div>

      {type === "error" && onRetry && (
        <button
          onClick={onRetry}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Retry Connection
        </button>
      )}
    </div>
  );
}

interface PoolDataLoadingProps {
  isInitializing: boolean;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  children: React.ReactNode;
}

export function PoolDataLoading({
  isInitializing,
  loading,
  error,
  onRetry,
  children,
}: PoolDataLoadingProps) {
  if (isInitializing) {
    return <LoadingState type="initializing" />;
  }

  if (error) {
    return <LoadingState type="error" message={error} onRetry={onRetry} />;
  }

  if (loading) {
    return <LoadingState type="loading" />;
  }

  return <>{children}</>;
}

export function RefreshingOverlay({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null;

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10 rounded-lg">
      <LoadingState type="refreshing" />
    </div>
  );
}
