"use client";

import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CredentialSelector } from "@/components/modules/credentials/ui/components/CredentialSelector";
import { ActaClient } from "@/lib/acta/client";
import { CredentialWithStatus } from "@/components/modules/credentials/hooks/useCredentials";
import { toast } from "sonner";

/**
 * Test page for the credential selector component
 */
export default function CredentialSelectorTestPage() {
  const [selectedCredential, setSelectedCredential] = useState<
    CredentialWithStatus | undefined
  >();

  // Initialize Acta client (in a real app, this would come from context/config)
  const client = new ActaClient({
    baseUrl: process.env.NEXT_PUBLIC_ACTA_API_URL || "http://localhost:3001",
    apiKey: process.env.NEXT_PUBLIC_ACTA_API_KEY,
  });

  const handleCredentialSelect = (credential: CredentialWithStatus) => {
    setSelectedCredential(credential);
    toast.success("Credential selected successfully!");
  };

  const handleClearSelection = () => {
    setSelectedCredential(undefined);
    toast.info("Credential selection cleared");
  };

  const handleProceedWithCredential = () => {
    if (selectedCredential) {
      toast.success(
        `Proceeding with credential: ${selectedCredential.displayData.participationDuration} - ${selectedCredential.displayData.riskLevel}`,
      );
    }
  };

  return (
    <div className="min-h-screen bg-primary-dark p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <i className="fas fa-certificate text-success"></i>
            Credential Selector Test
          </h1>
          <p className="text-gray-400">
            Test the credential selection component for pool entry flow
          </p>
        </div>

        {/* Main Test Card */}
        <Card className="card mb-6">
          <CardHeader>
            <CardTitle className="text-white">
              Pool Entry with Credential
            </CardTitle>
            <CardDescription className="text-gray-400">
              Select a credential to verify your reputation when entering a pool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credential Selector */}
            <div>
              <label className="text-white font-medium mb-2 block">
                Select Credential (Optional)
              </label>
              <CredentialSelector
                client={client}
                onCredentialSelect={handleCredentialSelect}
                selectedCredential={selectedCredential}
                placeholder="Choose a credential to verify your reputation"
              />
              <p className="text-xs text-gray-400 mt-1">
                Credentials help verify your experience and may unlock better
                terms
              </p>
            </div>

            {/* Selected Credential Display */}
            {selectedCredential && (
              <Card className="bg-success/10 border-success/30">
                <CardHeader>
                  <CardTitle className="text-success text-lg">
                    <i className="fas fa-check-circle mr-2"></i>
                    Selected Credential
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Duration:</span>
                      <span className="text-white ml-2">
                        {selectedCredential.displayData.participationDuration}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Risk Level:</span>
                      <span className="text-white ml-2">
                        {selectedCredential.displayData.riskLevel}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Performance:</span>
                      <span className="text-white ml-2">
                        {selectedCredential.displayData.performanceTier}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-400">Pool Types:</span>
                      <span className="text-white ml-2">
                        {selectedCredential.displayData.poolTypeExperience.join(
                          ", ",
                        )}
                      </span>
                    </div>
                  </div>

                  {selectedCredential.displayData.issuer && (
                    <div className="mt-3 text-sm">
                      <span className="text-gray-400">Issuer:</span>
                      <span className="text-white ml-2">
                        {selectedCredential.displayData.issuer}
                      </span>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-gray-400">
                    Contract: {selectedCredential.contractId.substring(0, 12)}
                    ...
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button
                onClick={handleProceedWithCredential}
                disabled={!selectedCredential}
                className="btn-primary"
              >
                <i className="fas fa-arrow-right mr-2"></i>
                Proceed with Pool Entry
              </Button>

              {selectedCredential && (
                <Button
                  onClick={handleClearSelection}
                  variant="outline"
                  className="btn-secondary"
                >
                  <i className="fas fa-times mr-2"></i>
                  Clear Selection
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-info-circle text-success"></i>
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">
                    Credential Verification
                  </p>
                  <p className="text-gray-400">
                    Your credentials are verified against the blockchain
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">Privacy-Preserving</p>
                  <p className="text-gray-400">
                    Only necessary reputation claims are shared
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-check-circle text-green-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">Optional Selection</p>
                  <p className="text-gray-400">
                    You can enter pools with or without credentials
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-lightbulb text-warning"></i>
                Benefits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <i className="fas fa-star text-yellow-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">Better Terms</p>
                  <p className="text-gray-400">
                    Verified users may get better interest rates
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-shield-alt text-green-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">Trust Building</p>
                  <p className="text-gray-400">
                    Establish reputation in the ecosystem
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <i className="fas fa-unlock text-blue-400 mt-0.5"></i>
                <div>
                  <p className="text-white font-medium">Access Features</p>
                  <p className="text-gray-400">Unlock advanced pool features</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
