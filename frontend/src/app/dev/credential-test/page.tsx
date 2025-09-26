"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateCredentialModal } from "@/components/modules/credentials/ui/components/CreateCredentialModal";
import { ActaClient } from "@/lib/acta/client";
import {
  getCredentialsFromLocalStorage,
  type LocalCredentialRecord,
} from "@/components/modules/credentials/hooks/useCredentialCreate";
import { toast } from "sonner";

/**
 * Test page for credential creation functionality
 */
export default function CredentialTestPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [credentials, setCredentials] = useState<LocalCredentialRecord[]>([]);

  // Initialize Acta client (in a real app, this would come from context/config)
  const client = new ActaClient({
    baseUrl: process.env.NEXT_PUBLIC_ACTA_API_URL || "http://localhost:3001",
    apiKey: process.env.NEXT_PUBLIC_ACTA_API_KEY,
  });

  // Load credentials from localStorage on component mount
  React.useEffect(() => {
    const loadedCredentials = getCredentialsFromLocalStorage();
    setCredentials(loadedCredentials);
  }, []);

  // This function is passed to the modal but not used directly here
  // const handleCredentialCreated = () => {
  //   // Refresh the credentials list
  //   const updatedCredentials = getCredentialsFromLocalStorage();
  //   setCredentials(updatedCredentials);
  //   setIsModalOpen(false);
  // };

  const handleClearCredentials = () => {
    localStorage.removeItem("tb_vc_index_v1");
    setCredentials([]);
    toast.success("Credentials cleared from local storage");
  };

  const handleTestApiConnection = async () => {
    try {
      const response = await client.ping();
      if (response.success) {
        toast.success("API Connection Successful", {
          description: `Response: ${JSON.stringify(response.data)}`,
        });
      } else {
        toast.error("API Connection Failed", {
          description: response.error,
        });
      }
    } catch (error) {
      toast.error("API Connection Error", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <i className="fas fa-certificate text-success text-3xl"></i>
            <h1 className="text-3xl font-bold text-white">
              Credential Creation Test
            </h1>
          </div>
          <p className="text-gray-400">
            Test the Phase 2 credential creation functionality
          </p>
        </div>

        {/* API Connection Test */}
        <Card className="card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <i className="fas fa-plug text-success"></i>
              <CardTitle className="text-white">API Connection Test</CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Test connection to the Acta API service
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-center">
              <Button onClick={handleTestApiConnection} className="btn-primary">
                <i className="fas fa-wifi mr-2"></i>
                Test API Connection
              </Button>
              <div className="text-sm text-gray-400">
                API URL:{" "}
                <span className="text-success font-mono">
                  {process.env.NEXT_PUBLIC_ACTA_API_URL ||
                    "http://localhost:3001"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credential Creation */}
        <Card className="card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <i className="fas fa-plus-circle text-success"></i>
              <CardTitle className="text-white">
                Create New Credential
              </CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Create a pool participation credential with reputation claims.
              Credentials are stored on the Stellar blockchain via Acta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="btn-primary"
            >
              <i className="fas fa-certificate mr-2"></i>
              Open Credential Creation Modal
            </Button>
          </CardContent>
        </Card>

        {/* Local Storage Management */}
        <Card className="card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <i className="fas fa-database text-success"></i>
              <CardTitle className="text-white">
                Local Storage Management
              </CardTitle>
            </div>
            <CardDescription className="text-gray-400">
              Credentials are stored on Stellar blockchain via Acta. This is
              just a local index for convenience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => {
                    const updatedCredentials = getCredentialsFromLocalStorage();
                    setCredentials(updatedCredentials);
                    toast.info(
                      `Loaded ${updatedCredentials.length} credentials from localStorage`,
                    );
                  }}
                  className="btn-secondary"
                >
                  <i className="fas fa-sync-alt mr-2"></i>
                  Refresh Credentials
                </Button>
                <Button onClick={handleClearCredentials} className="btn-danger">
                  <i className="fas fa-trash mr-2"></i>
                  Clear All Credentials
                </Button>
              </div>
              <div className="text-sm text-gray-400">
                Storage Key:{" "}
                <span className="text-success font-mono">tb_vc_index_v1</span> |
                Count:{" "}
                <span className="text-success font-bold">
                  {credentials.length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credentials List */}
        {credentials.length > 0 && (
          <Card className="card">
            <CardHeader>
              <div className="flex items-center gap-2">
                <i className="fas fa-list text-success"></i>
                <CardTitle className="text-white">
                  Stored Credentials ({credentials.length})
                </CardTitle>
              </div>
              <CardDescription className="text-gray-400">
                Local index of recently created credentials (real storage is on
                Stellar blockchain)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {credentials.map((credential) => (
                  <div
                    key={credential.localId}
                    className="bg-dark-tertiary border border-custom rounded-lg p-4 space-y-3"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <i className="fas fa-certificate text-success"></i>
                          <h4 className="font-medium text-white">
                            {credential.displayData.type}
                          </h4>
                        </div>
                        <p className="text-sm text-gray-400">
                          <i className="fas fa-calendar mr-1"></i>
                          Created:{" "}
                          {new Date(credential.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right text-xs text-gray-400">
                        <div className="flex items-center gap-1 mb-1">
                          <i className="fas fa-file-contract text-success"></i>
                          <span>
                            Contract:{" "}
                            {credential.contractId?.substring(0, 8) || "N/A"}...
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mb-1">
                          <i className="fas fa-hashtag text-success"></i>
                          <span>
                            Hash: {credential.hash?.substring(0, 8) || "N/A"}...
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <i className="fas fa-link text-success"></i>
                          <span>
                            TX: {credential.hash?.substring(0, 8) || "N/A"}...
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <i className="fas fa-clock text-success"></i>
                        <span className="font-medium text-white">
                          Duration:
                        </span>{" "}
                        <span className="text-gray-300">
                          {credential.displayData.participationDuration}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-shield-alt text-warning"></i>
                        <span className="font-medium text-white">
                          Risk:
                        </span>{" "}
                        <span className="text-gray-300">
                          {credential.displayData.riskLevel}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-chart-line text-success"></i>
                        <span className="font-medium text-white">
                          Performance:
                        </span>{" "}
                        <span className="text-gray-300">
                          {credential.displayData.performanceTier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <i className="fas fa-layer-group text-success"></i>
                        <span className="font-medium text-white">
                          Pool Types:
                        </span>{" "}
                        <span className="text-gray-300">
                          {credential.displayData.poolTypeExperience.join(", ")}
                        </span>
                      </div>
                    </div>

                    {credential.displayData.issuer && (
                      <div className="text-sm flex items-center gap-2">
                        <i className="fas fa-building text-success"></i>
                        <span className="font-medium text-white">
                          Issuer:
                        </span>{" "}
                        <span className="text-gray-300">
                          {credential.displayData.issuer}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <i className="fas fa-info-circle text-success"></i>
              <CardTitle className="text-white">Test Instructions</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  1
                </span>
                <p className="text-gray-300">
                  First, test the API connection to ensure the Acta service is
                  running
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  2
                </span>
                <p className="text-gray-300">
                  Click &quot;Open Credential Creation Modal&quot; to create a
                  new credential
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  3
                </span>
                <div className="text-gray-300">
                  <p>Fill out the form with reputation claims:</p>
                  <ul className="list-disc list-inside ml-4 space-y-1 mt-2">
                    <li>
                      Participation Duration: Select from 3+, 6+, or 12+ months
                    </li>
                    <li>Risk Level: Conservative, Moderate, or Aggressive</li>
                    <li>
                      Performance Tier: No liquidations, Stable participant, or
                      Recovered events
                    </li>
                    <li>Pool Type Experience: Select one or more pool types</li>
                  </ul>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  4
                </span>
                <p className="text-gray-300">
                  Optionally provide an issuer name and expiration date
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  5
                </span>
                <p className="text-gray-300">
                  Submit the form to create the credential
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="bg-success text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                  6
                </span>
                <p className="text-gray-300">
                  Check the &quot;Stored Credentials&quot; section to see your
                  created credentials
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Credential Creation Modal */}
      <CreateCredentialModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={client}
      />
    </div>
  );
}
