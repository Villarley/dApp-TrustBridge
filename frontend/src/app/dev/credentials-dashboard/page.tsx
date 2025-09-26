"use client";

import React from "react";
import { CredentialsDashboardPage } from "@/components/modules/credentials/ui/pages/CredentialsDashboardPage";
import { ActaClient } from "@/lib/acta/client";

/**
 * Test page for the credentials dashboard
 */
export default function CredentialsDashboardTestPage() {
  // Initialize Acta client (in a real app, this would come from context/config)
  const client = new ActaClient({
    baseUrl: process.env.NEXT_PUBLIC_ACTA_API_URL || "http://localhost:3001",
    apiKey: process.env.NEXT_PUBLIC_ACTA_API_KEY,
  });

  return (
    <div className="min-h-screen bg-primary-dark">
      <CredentialsDashboardPage client={client} />
    </div>
  );
}
