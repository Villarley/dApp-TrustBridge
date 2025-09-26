"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CredentialWithStatus } from "@/components/modules/credentials/hooks/useCredentials";
import { ActaClient } from "@/lib/acta/client";
import { useCredentials } from "@/components/modules/credentials/hooks/useCredentials";

/**
 * Props for CredentialSelector component
 */
interface CredentialSelectorProps {
  client: ActaClient;
  onCredentialSelect: (credential: CredentialWithStatus) => void;
  selectedCredential?: CredentialWithStatus;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Credential option component for selection
 */
function CredentialOption({
  credential,
  isSelected,
  onSelect,
}: {
  credential: CredentialWithStatus;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const { displayData, status, contractId } = credential;
  const currentStatus = status || "Active";

  const statusColors = {
    Active: "bg-green-900/20 text-green-300 border-green-700",
    Revoked: "bg-red-900/20 text-red-300 border-red-700",
    Suspended: "bg-yellow-900/20 text-yellow-300 border-yellow-700",
  };

  return (
    <Card
      className={`card cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-success bg-success/10"
          : "hover:bg-dark-tertiary"
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <i className="fas fa-certificate text-success"></i>
            <span className="font-medium text-white">
              Pool Participation Credential
            </span>
          </div>
          <Badge className={`${statusColors[currentStatus]} border text-xs`}>
            {currentStatus}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-400">Duration:</span>
            <span className="text-white ml-1">
              {displayData.participationDuration}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Risk:</span>
            <span className="text-white ml-1">{displayData.riskLevel}</span>
          </div>
          <div>
            <span className="text-gray-400">Performance:</span>
            <span className="text-white ml-1">
              {displayData.performanceTier}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Pools:</span>
            <span className="text-white ml-1">
              {displayData.poolTypeExperience.join(", ")}
            </span>
          </div>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          Contract: {contractId.substring(0, 8)}...
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Main CredentialSelector component
 */
export function CredentialSelector({
  client,
  onCredentialSelect,
  selectedCredential,
  disabled = false,
  placeholder = "Select a credential to verify your reputation",
}: CredentialSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const { credentials, isLoading, error, refreshCredentials } = useCredentials({
    client,
    autoRefresh: false,
  });

  // Filter for active credentials only
  const activeCredentials = credentials.filter(
    (c) => (c.status || "Active") === "Active",
  );

  const handleCredentialSelect = (credential: CredentialWithStatus) => {
    onCredentialSelect(credential);
    setIsOpen(false);
  };

  const handleRefresh = async () => {
    await refreshCredentials();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start btn-secondary"
          disabled={disabled}
        >
          <i className="fas fa-certificate mr-2"></i>
          {selectedCredential ? (
            <span className="truncate">
              {selectedCredential.displayData.participationDuration} •{" "}
              {selectedCredential.displayData.riskLevel} •{" "}
              {selectedCredential.displayData.performanceTier}
            </span>
          ) : (
            placeholder
          )}
          <i className="fas fa-chevron-down ml-auto"></i>
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-dark-secondary border-custom max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <i className="fas fa-certificate text-success"></i>
            Select Credential
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose a credential to verify your pool participation experience and
            reputation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Refresh Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleRefresh}
              variant="outline"
              size="sm"
              className="btn-secondary"
              disabled={isLoading}
            >
              <i
                className={`fas fa-sync-alt mr-2 ${isLoading ? "fa-spin" : ""}`}
              ></i>
              Refresh
            </Button>
          </div>

          {/* Error State */}
          {error && (
            <Card className="card border-red-700 bg-red-900/20">
              <CardContent className="p-4 text-center">
                <i className="fas fa-exclamation-triangle text-red-400 text-xl mb-2"></i>
                <p className="text-red-300">Failed to load credentials</p>
                <p className="text-red-200 text-sm">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Card key={i} className="card">
                  <CardContent className="p-4">
                    <div className="animate-pulse">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gray-700 rounded"></div>
                          <div className="w-32 h-4 bg-gray-700 rounded"></div>
                        </div>
                        <div className="w-16 h-6 bg-gray-700 rounded"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[1, 2, 3, 4].map((j) => (
                          <div key={j} className="space-y-1">
                            <div className="w-20 h-3 bg-gray-700 rounded"></div>
                            <div className="w-16 h-3 bg-gray-700 rounded"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && activeCredentials.length === 0 && (
            <Card className="card">
              <CardContent className="p-8 text-center">
                <i className="fas fa-certificate text-4xl text-gray-600 mb-4"></i>
                <h3 className="text-lg font-semibold text-white mb-2">
                  No Active Credentials
                </h3>
                <p className="text-gray-400 mb-4">
                  You don't have any active credentials yet. Create one to
                  verify your reputation.
                </p>
                <Button
                  onClick={() => setIsOpen(false)}
                  className="btn-primary"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Create Credential
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Credentials List */}
          {!isLoading && !error && activeCredentials.length > 0 && (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {activeCredentials.map((credential) => (
                <CredentialOption
                  key={credential.localId}
                  credential={credential}
                  isSelected={
                    selectedCredential?.localId === credential.localId
                  }
                  onSelect={() => handleCredentialSelect(credential)}
                />
              ))}
            </div>
          )}

          {/* Info */}
          {activeCredentials.length > 0 && (
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <i className="fas fa-info-circle text-blue-400 mt-0.5"></i>
                <div className="text-sm">
                  <p className="text-blue-300 font-medium">
                    Why select a credential?
                  </p>
                  <p className="text-blue-200">
                    Credentials help verify your experience and may unlock
                    better terms or features in pools.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
