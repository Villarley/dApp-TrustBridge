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
import { BorrowModal } from "@/components/modules/marketplace/ui/components/BorrowModal";
import { SupplyUSDCModal } from "@/components/modules/marketplace/ui/components/SupplyUSDCModal";

/**
 * Test page demonstrating credential integration in existing modals
 */
export default function ModalsWithCredentialsPage() {
  const [isBorrowModalOpen, setIsBorrowModalOpen] = useState(false);
  const [isSupplyModalOpen, setIsSupplyModalOpen] = useState(false);

  // Mock pool data for demonstration
  const mockPoolData = {
    name: "USDC Pool",
    totalSupplied: "2,400,000",
    totalBorrowed: "1,800,000",
    utilizationRate: "75%",
    reserves: [
      {
        symbol: "USDC",
        supplied: "2,400,000",
        borrowed: "1,800,000",
        supplyAPY: "12.5",
        borrowAPY: "15.2",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-primary-dark p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white flex items-center gap-3 mb-2">
            <i className="fas fa-certificate text-success"></i>
            Credential Integration in Pool Modals
          </h1>
          <p className="text-gray-400">
            Demonstration of credential selection integrated into existing
            borrow and supply modals
          </p>
        </div>

        {/* Integration Overview */}
        <Card className="card mb-8">
          <CardHeader>
            <CardTitle className="text-white">Integration Overview</CardTitle>
            <CardDescription className="text-gray-400">
              Credential selection has been integrated into the existing pool
              modals without disrupting the core flows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <i className="fas fa-arrow-down text-red-400"></i>
                  BorrowModal Integration
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Optional credential selection
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Better interest rate hints
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Non-blocking integration
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <i className="fas fa-arrow-up text-green-400"></i>
                  SupplyUSDCModal Integration
                </h4>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Optional credential selection
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Higher APY and fee reduction hints
                  </li>
                  <li className="flex items-center gap-2">
                    <i className="fas fa-check text-green-400"></i>
                    Seamless user experience
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Modals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Borrow Modal Test */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-arrow-down text-red-400"></i>
                Borrow Modal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test the borrow modal with credential selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-info-circle text-red-400"></i>
                  <span className="text-red-300 font-medium">
                    Pool Information
                  </span>
                </div>
                <div className="text-sm text-red-200 space-y-1">
                  <div>Pool: {mockPoolData.name}</div>
                  <div>Total Supplied: ${mockPoolData.totalSupplied}</div>
                  <div>Utilization: {mockPoolData.utilizationRate}</div>
                </div>
              </div>

              <Button
                onClick={() => setIsBorrowModalOpen(true)}
                className="btn-primary w-full"
              >
                <i className="fas fa-arrow-down mr-2"></i>
                Open Borrow Modal
              </Button>

              <div className="text-xs text-gray-400">
                <i className="fas fa-lightbulb mr-1"></i>
                Try selecting a credential to see the benefits hint
              </div>
            </CardContent>
          </Card>

          {/* Supply Modal Test */}
          <Card className="card">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <i className="fas fa-arrow-up text-green-400"></i>
                Supply Modal
              </CardTitle>
              <CardDescription className="text-gray-400">
                Test the supply modal with credential selection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <i className="fas fa-info-circle text-green-400"></i>
                  <span className="text-green-300 font-medium">
                    Pool Information
                  </span>
                </div>
                <div className="text-sm text-green-200 space-y-1">
                  <div>Asset: USDC</div>
                  <div>Current APY: 12.5%</div>
                  <div>Pool Health: Excellent</div>
                </div>
              </div>

              <Button
                onClick={() => setIsSupplyModalOpen(true)}
                className="btn-primary w-full"
              >
                <i className="fas fa-arrow-up mr-2"></i>
                Open Supply Modal
              </Button>

              <div className="text-xs text-gray-400">
                <i className="fas fa-lightbulb mr-1"></i>
                Try selecting a credential to see the APY bonus hint
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Implementation Details */}
        <Card className="card mt-8">
          <CardHeader>
            <CardTitle className="text-white">Implementation Details</CardTitle>
            <CardDescription className="text-gray-400">
              How the credential integration works in the existing modals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-dark-tertiary border border-custom rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">Key Features:</h5>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>
                    • <strong>Non-intrusive:</strong> Credential selection is
                    optional and doesn&apos;t block core flows
                  </li>
                  <li>
                    • <strong>Contextual hints:</strong> Different benefits
                    shown for borrow vs supply
                  </li>
                  <li>
                    • <strong>Visual feedback:</strong> Green success state when
                    credential is selected
                  </li>
                  <li>
                    • <strong>Seamless integration:</strong> Uses existing modal
                    styling and patterns
                  </li>
                </ul>
              </div>

              <div className="bg-dark-tertiary border border-custom rounded-lg p-4">
                <h5 className="text-white font-medium mb-2">
                  Benefits Displayed:
                </h5>
                <ul className="space-y-1 text-sm text-gray-400">
                  <li>
                    • <strong>Borrow Modal:</strong> &quot;You may qualify for
                    better interest rates&quot;
                  </li>
                  <li>
                    • <strong>Supply Modal:</strong> &quot;You may qualify for
                    higher APY and reduced fees&quot;
                  </li>
                  <li>
                    • <strong>Both:</strong> Show selected credential details
                    (risk level, performance tier)
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <BorrowModal
          isOpen={isBorrowModalOpen}
          onClose={() => setIsBorrowModalOpen(false)}
          poolData={mockPoolData}
          poolId="test-pool"
        />

        <SupplyUSDCModal
          isOpen={isSupplyModalOpen}
          onClose={() => setIsSupplyModalOpen(false)}
          onSuccess={() => {
            setIsSupplyModalOpen(false);
            console.log("Supply transaction successful");
          }}
        />
      </div>
    </div>
  );
}
