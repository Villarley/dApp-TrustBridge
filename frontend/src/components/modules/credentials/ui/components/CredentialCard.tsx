"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { CredentialWithStatus } from "@/components/modules/credentials/hooks/useCredentials";
import {
  formatCredentialSummary,
  copyToClipboard,
} from "@/components/modules/credentials/hooks/useCredentials";

/**
 * Props for CredentialCard component
 */
interface CredentialCardProps {
  credential: CredentialWithStatus;
  onStatusUpdate: (
    contractId: string,
    status: "Active" | "Revoked" | "Suspended",
  ) => Promise<boolean>;
  onRemove?: (localId: string) => void;
  showActions?: boolean;
}

/**
 * Status color mapping
 */
const statusColors = {
  Active: "bg-green-900/20 text-green-300 border-green-700",
  Revoked: "bg-red-900/20 text-red-300 border-red-700",
  Suspended: "bg-yellow-900/20 text-yellow-300 border-yellow-700",
} as const;

/**
 * Status icons
 */
const statusIcons = {
  Active: "fas fa-check-circle",
  Revoked: "fas fa-times-circle",
  Suspended: "fas fa-pause-circle",
} as const;

/**
 * CredentialCard Component
 */
export function CredentialCard({
  credential,
  onStatusUpdate,
  onRemove,
  showActions = true,
}: CredentialCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const { displayData, contractId, hash, status, createdAt, isFetching } =
    credential;

  const handleStatusUpdate = async (
    newStatus: "Active" | "Revoked" | "Suspended",
  ) => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const success = await onStatusUpdate(contractId, newStatus);
      if (success) {
        toast.success(`Credential status updated to ${newStatus}`);
      } else {
        toast.error(`Failed to update credential status`);
      }
    } catch {
      toast.error(`Error updating credential status`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const summary = formatCredentialSummary(credential, showContractDetails);
      const success = await copyToClipboard(summary);

      if (success) {
        toast.success("Credential summary copied to clipboard");
      } else {
        toast.error("Failed to copy to clipboard");
      }
    } catch {
      toast.error("Error sharing credential");
    } finally {
      setIsSharing(false);
    }
  };

  const handleRemove = () => {
    if (
      onRemove &&
      window.confirm(
        "Are you sure you want to remove this credential from your local index?",
      )
    ) {
      onRemove(credential.localId);
      toast.success("Credential removed from local index");
    }
  };

  const currentStatus = status || "Active";
  const statusColor = statusColors[currentStatus];
  const statusIcon = statusIcons[currentStatus];

  return (
    <Card className="card hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            <i className="fas fa-certificate text-success text-xl"></i>
            <div>
              <h3 className="font-semibold text-white">{displayData.type}</h3>
              <p className="text-sm text-gray-400">
                Created {new Date(createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="ml-6 flex items-center justify-center gap-2">
            <Badge className={`${statusColor} border flex items-center`}>
              <i className={`${statusIcon} mr-1.5`}></i>
              <span className="text-xs font-medium">{currentStatus}</span>
              {isFetching && <i className="fas fa-spinner fa-spin ml-1.5"></i>}
            </Badge>

            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-white"
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-dark-secondary border-custom"
                >
                  <DropdownMenuItem onClick={handleShare} disabled={isSharing}>
                    <i className="fas fa-share mr-2"></i>
                    {isSharing ? "Copying..." : "Copy Summary"}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate("Active")}
                    disabled={isUpdating || currentStatus === "Active"}
                  >
                    <i className="fas fa-check-circle mr-2 text-green-400"></i>
                    Set Active
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate("Suspended")}
                    disabled={isUpdating || currentStatus === "Suspended"}
                  >
                    <i className="fas fa-pause-circle mr-2 text-yellow-400"></i>
                    Suspend
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleStatusUpdate("Revoked")}
                    disabled={isUpdating || currentStatus === "Revoked"}
                  >
                    <i className="fas fa-times-circle mr-2 text-red-400"></i>
                    Revoke
                  </DropdownMenuItem>

                  {onRemove && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleRemove}
                        className="text-red-400 hover:text-red-300"
                      >
                        <i className="fas fa-trash mr-2"></i>
                        Remove from Local Index
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Credential Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-clock text-success"></i>
            <div>
              <p className="text-xs text-gray-400">Duration</p>
              <p className="text-sm text-white font-medium">
                {displayData.participationDuration}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-warning"></i>
            <div>
              <p className="text-xs text-gray-400">Risk Level</p>
              <p className="text-sm text-white font-medium">
                {displayData.riskLevel}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-chart-line text-success"></i>
            <div>
              <p className="text-xs text-gray-400">Performance</p>
              <p className="text-sm text-white font-medium">
                {displayData.performanceTier}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <i className="fas fa-layer-group text-success"></i>
            <div>
              <p className="text-xs text-gray-400">Pool Types</p>
              <p className="text-sm text-white font-medium">
                {displayData.poolTypeExperience.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* Issuer */}
        {displayData.issuer && (
          <div className="flex items-center gap-2">
            <i className="fas fa-building text-success"></i>
            <div>
              <p className="text-xs text-gray-400">Issuer</p>
              <p className="text-sm text-white font-medium">
                {displayData.issuer}
              </p>
            </div>
          </div>
        )}

        {/* Contract Details (Collapsible) */}
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="w-full btn-secondary"
            >
              <i className="fas fa-info-circle mr-2"></i>
              View Contract Details
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-secondary border-custom max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">
                Contract Information
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Blockchain details for this credential
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label className="text-gray-400 text-xs">Contract ID</Label>
                <p className="text-white font-mono text-sm break-all">
                  {contractId}
                </p>
              </div>

              <div>
                <Label className="text-gray-400 text-xs">Hash</Label>
                <p className="text-white font-mono text-sm break-all">{hash}</p>
              </div>

              <div>
                <Label className="text-gray-400 text-xs">Status</Label>
                <Badge className={`${statusColor} border mt-1`}>
                  <i className={`${statusIcon} mr-1`}></i>
                  {currentStatus}
                </Badge>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Share Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="w-full btn-primary">
              <i className="fas fa-share mr-2"></i>
              Share Credential
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-dark-secondary border-custom max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Share Credential</DialogTitle>
              <DialogDescription className="text-gray-400">
                Copy a summary of this credential to share
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="show-contract-details"
                  checked={showContractDetails}
                  onCheckedChange={setShowContractDetails}
                />
                <Label htmlFor="show-contract-details" className="text-white">
                  Include contract details (hash, contract ID)
                </Label>
              </div>

              <div className="bg-dark-tertiary border border-custom rounded-lg p-3">
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {formatCredentialSummary(credential, showContractDetails)}
                </pre>
              </div>

              <Button
                onClick={handleShare}
                disabled={isSharing}
                className="w-full btn-primary"
              >
                {isSharing ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Copying...
                  </>
                ) : (
                  <>
                    <i className="fas fa-copy mr-2"></i>
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
