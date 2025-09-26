"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CreateCredentialModal } from "@/components/modules/credentials/ui/components/CreateCredentialModal";
import { CredentialCard } from "@/components/modules/credentials/ui/components/CredentialCard";
import {
  useCredentials,
  type StatusFilter,
} from "@/components/modules/credentials/hooks/useCredentials";
import { ActaClient } from "@/lib/acta/client";
import { toast } from "sonner";

/**
 * Props for CredentialsDashboardPage component
 */
interface CredentialsDashboardPageProps {
  client: ActaClient;
}

/**
 * Empty state component
 */
function EmptyState({
  onCreateCredential,
}: {
  onCreateCredential: () => void;
}) {
  return (
    <Card className="card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6">
          <i className="fas fa-certificate text-6xl text-gray-600 mb-4"></i>
          <h3 className="text-xl font-semibold text-white mb-2">
            No Credentials Yet
          </h3>
          <p className="text-gray-400 max-w-md">
            Create your first pool participation credential to establish your
            reputation in the ecosystem and unlock enhanced features.
          </p>
        </div>

        <Button onClick={onCreateCredential} className="btn-primary">
          <i className="fas fa-plus mr-2"></i>
          Create Your First Credential
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * No results for filter component
 */
function NoResultsForFilter({
  statusFilter,
  onCreateCredential,
  onClearFilter,
}: {
  statusFilter: StatusFilter;
  onCreateCredential: () => void;
  onClearFilter: () => void;
}) {
  const statusIcons = {
    Active: "fas fa-check-circle",
    Revoked: "fas fa-times-circle",
    Suspended: "fas fa-pause-circle",
  } as const;

  const statusColors = {
    Active: "text-green-400",
    Revoked: "text-red-400",
    Suspended: "text-yellow-400",
  } as const;

  return (
    <Card className="card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-6">
          <i
            className={`${statusIcons[statusFilter as keyof typeof statusIcons] || "fas fa-filter"} text-6xl ${statusColors[statusFilter as keyof typeof statusColors] || "text-gray-600"} mb-4`}
          ></i>
          <h3 className="text-xl font-semibold text-white mb-2">
            No {statusFilter} Credentials
          </h3>
          <p className="text-gray-400 max-w-md">
            {statusFilter === "All"
              ? "You don't have any credentials yet."
              : `You don't have any credentials with status "${statusFilter}".`}
          </p>
        </div>

        <div className="flex gap-3">
          {statusFilter !== "All" ? (
            <Button onClick={onClearFilter} className="btn-primary">
              <i className="fas fa-list mr-2"></i>
              Show All Credentials
            </Button>
          ) : (
            <Button onClick={onCreateCredential} className="btn-primary">
              <i className="fas fa-plus mr-2"></i>
              Create Credential
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-gray-700 rounded animate-pulse"></div>
                <div>
                  <div className="w-32 h-4 bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="w-24 h-3 bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
              <div className="w-20 h-6 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="space-y-1">
                    <div className="w-16 h-3 bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-20 h-4 bg-gray-700 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
              <div className="w-full h-9 bg-gray-700 rounded animate-pulse"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Stats component
 */
function StatsSection({
  credentialsByStatus,
}: {
  credentialsByStatus: Record<StatusFilter, number>;
}) {
  const stats = [
    {
      label: "Total Credentials",
      value: credentialsByStatus.All || 0,
      icon: "fas fa-certificate",
      color: "text-success",
    },
    {
      label: "Active",
      value: credentialsByStatus.Active || 0,
      icon: "fas fa-check-circle",
      color: "text-green-400",
    },
    {
      label: "Suspended",
      value: credentialsByStatus.Suspended || 0,
      icon: "fas fa-pause-circle",
      color: "text-yellow-400",
    },
    {
      label: "Revoked",
      value: credentialsByStatus.Revoked || 0,
      icon: "fas fa-times-circle",
      color: "text-red-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label} className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <i className={`${stat.icon} ${stat.color} text-xl`}></i>
              <div>
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-gray-400">{stat.label}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Main CredentialsDashboardPage component
 */
export function CredentialsDashboardPage({
  client,
}: CredentialsDashboardPageProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const {
    credentials,
    filteredCredentials,
    isLoading,
    error,
    statusFilter,
    setStatusFilter,
    refreshCredentials,
    updateCredentialStatus,
    removeCredential,
    credentialsByStatus,
  } = useCredentials({ client });

  const handleCreateCredential = () => {
    setIsCreateModalOpen(true);
  };

  const handleRefresh = async () => {
    await refreshCredentials();
    toast.success("Credentials refreshed");
  };

  if (error) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <Card className="card">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <i className="fas fa-exclamation-triangle text-6xl text-red-400 mb-4"></i>
            <h3 className="text-xl font-semibold text-white mb-2">
              Error Loading Credentials
            </h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <Button onClick={handleRefresh} className="btn-primary">
              <i className="fas fa-refresh mr-2"></i>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <i className="fas fa-certificate text-success"></i>
              Credentials Dashboard
            </h1>
            <p className="text-gray-400 mt-2">
              Manage your pool participation credentials and reputation
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleRefresh}
              variant="outline"
              className="btn-secondary"
            >
              <i className="fas fa-sync-alt mr-2"></i>
              Refresh
            </Button>
            <Button onClick={handleCreateCredential} className="btn-primary">
              <i className="fas fa-plus mr-2"></i>
              Create Credential
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsSection credentialsByStatus={credentialsByStatus} />
      </div>

      {/* Filters - Always visible */}
      <div className="mb-6">
        <Card className="card">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <Label className="text-white font-medium">
                Filter by Status:
              </Label>
              <Select
                value={statusFilter}
                onValueChange={(value: StatusFilter) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-48 bg-dark-tertiary border-custom text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-dark-secondary border-custom">
                  <SelectItem
                    value="All"
                    className="text-white hover:bg-dark-tertiary"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-certificate text-success"></i>
                      All ({credentialsByStatus.All || 0})
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Active"
                    className="text-white hover:bg-dark-tertiary"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-check-circle text-green-400"></i>
                      Active ({credentialsByStatus.Active || 0})
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Suspended"
                    className="text-white hover:bg-dark-tertiary"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-pause-circle text-yellow-400"></i>
                      Suspended ({credentialsByStatus.Suspended || 0})
                    </div>
                  </SelectItem>
                  <SelectItem
                    value="Revoked"
                    className="text-white hover:bg-dark-tertiary"
                  >
                    <div className="flex items-center gap-2">
                      <i className="fas fa-times-circle text-red-400"></i>
                      Revoked ({credentialsByStatus.Revoked || 0})
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState />
      ) : filteredCredentials.length === 0 ? (
        credentials.length === 0 ? (
          <EmptyState onCreateCredential={handleCreateCredential} />
        ) : (
          <NoResultsForFilter
            statusFilter={statusFilter}
            onCreateCredential={handleCreateCredential}
            onClearFilter={() => setStatusFilter("All")}
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCredentials.map((credential) => (
            <CredentialCard
              key={credential.localId}
              credential={credential}
              onStatusUpdate={updateCredentialStatus}
              onRemove={removeCredential}
            />
          ))}
        </div>
      )}

      {/* Create Credential Modal */}
      <CreateCredentialModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        client={client}
        onSuccess={() => {
          setIsCreateModalOpen(false);
          refreshCredentials();
          toast.success("Credential created successfully!");
        }}
      />
    </div>
  );
}

// Add missing import for Label
import { Label } from "@/components/ui/label";
