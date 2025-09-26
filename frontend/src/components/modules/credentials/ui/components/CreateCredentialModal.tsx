"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useCredentialCreate,
  type CredentialCreateFormData,
} from "@/components/modules/credentials/hooks/useCredentialCreate";
import { ActaClient } from "@/lib/acta/client";
import {
  ParticipationDuration,
  CredentialRiskLevel,
  PerformanceTier,
  PoolTypeExperience,
} from "@/@types/acta.types";

/**
 * Form validation schema
 */
const credentialFormSchema = z.object({
  reputationClaims: z.object({
    participationDuration: z.enum(
      ["3+ months", "6+ months", "12+ months"] as const,
      {
        required_error: "Please select a participation duration.",
      },
    ),
    riskLevel: z.enum(["Conservative", "Moderate", "Aggressive"] as const, {
      required_error: "Please select a risk level.",
    }),
    performanceTier: z.enum(
      ["No liquidations", "Stable participant", "Recovered events"] as const,
      {
        required_error: "Please select a performance tier.",
      },
    ),
    poolTypeExperience: z
      .array(z.enum(["Multi-asset", "Stablecoin", "LSD", "LP-Perp"] as const))
      .min(1, "Please select at least one pool type experience."),
  }),
  issuer: z.string().optional(),
  expirationDate: z.string().optional(),
});

type CredentialFormValues = z.infer<typeof credentialFormSchema>;

/**
 * Modal props
 */
interface CreateCredentialModalProps {
  isOpen: boolean;
  onClose: () => void;
  client: ActaClient;
}

/**
 * Available options for form fields
 */
const PARTICIPATION_DURATION_OPTIONS: {
  value: ParticipationDuration;
  label: string;
}[] = [
  { value: "3+ months", label: "3+ months" },
  { value: "6+ months", label: "6+ months" },
  { value: "12+ months", label: "12+ months" },
];

const RISK_LEVEL_OPTIONS: {
  value: CredentialRiskLevel;
  label: string;
  description: string;
}[] = [
  {
    value: "Conservative",
    label: "Conservative",
    description: "Low risk, stable returns",
  },
  {
    value: "Moderate",
    label: "Moderate",
    description: "Balanced risk and reward",
  },
  {
    value: "Aggressive",
    label: "Aggressive",
    description: "High risk, high potential returns",
  },
];

const PERFORMANCE_TIER_OPTIONS: {
  value: PerformanceTier;
  label: string;
  description: string;
}[] = [
  {
    value: "No liquidations",
    label: "No liquidations",
    description: "Clean track record",
  },
  {
    value: "Stable participant",
    label: "Stable participant",
    description: "Consistent performance",
  },
  {
    value: "Recovered events",
    label: "Recovered events",
    description: "Bounced back from issues",
  },
];

const POOL_TYPE_OPTIONS: {
  value: PoolTypeExperience;
  label: string;
  description: string;
}[] = [
  {
    value: "Multi-asset",
    label: "Multi-asset",
    description: "Diversified portfolio pools",
  },
  {
    value: "Stablecoin",
    label: "Stablecoin",
    description: "Stable value pools",
  },
  { value: "LSD", label: "LSD", description: "Liquid staking derivatives" },
  {
    value: "LP-Perp",
    label: "LP-Perp",
    description: "Liquidity provision perpetuals",
  },
];

/**
 * Create Credential Modal Component
 */
export function CreateCredentialModal({
  isOpen,
  onClose,
  client,
}: CreateCredentialModalProps) {
  const form = useForm<CredentialFormValues>({
    resolver: zodResolver(credentialFormSchema),
    defaultValues: {
      reputationClaims: {
        participationDuration: undefined,
        riskLevel: undefined,
        performanceTier: undefined,
        poolTypeExperience: [],
      },
      issuer: "",
      expirationDate: "",
    },
  });

  const { createCredential, isLoading, error, clearError } =
    useCredentialCreate({
      client,
      onSuccess: (result) => {
        const contractId = result.contractId || "Unknown";
        const contractDisplay =
          contractId.length > 8
            ? contractId.substring(0, 8) + "..."
            : contractId;

        toast.success("Credential Created Successfully", {
          description: `Stored on Stellar blockchain. Contract: ${contractDisplay}`,
        });
        form.reset();
        onClose();
      },
      onError: (errorMessage) => {
        toast.error("Failed to Create Credential", {
          description: errorMessage,
        });
      },
    });

  const onSubmit = async (values: CredentialFormValues) => {
    clearError();

    const formData: CredentialCreateFormData = {
      reputationClaims: values.reputationClaims,
      issuer: values.issuer || undefined,
      expirationDate: values.expirationDate || undefined,
    };

    await createCredential(formData);
  };

  const handleClose = () => {
    if (!isLoading) {
      form.reset();
      clearError();
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[700px] bg-dark-secondary border-custom">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <i className="fas fa-certificate text-success text-xl"></i>
            <DialogTitle className="text-xl font-semibold text-white">
              Create Pool Participation Credential
            </DialogTitle>
          </div>
          <DialogDescription className="text-gray-400">
            Create a privacy-preserving credential that demonstrates your pool
            participation experience. This information will be used to establish
            your reputation in the ecosystem.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Participation Duration */}
            <FormField
              control={form.control}
              name="reputationClaims.participationDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-medium">
                    <i className="fas fa-clock mr-2 text-success"></i>
                    Participation Duration
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-tertiary border-custom text-white focus:border-success">
                        <SelectValue placeholder="Select duration..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-secondary border-custom">
                      {PARTICIPATION_DURATION_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-dark-tertiary focus:bg-dark-tertiary"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Risk Level */}
            <FormField
              control={form.control}
              name="reputationClaims.riskLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-medium">
                    <i className="fas fa-shield-alt mr-2 text-warning"></i>
                    Risk Level
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-tertiary border-custom text-white focus:border-success">
                        <SelectValue placeholder="Select risk level..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-secondary border-custom">
                      {RISK_LEVEL_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-dark-tertiary focus:bg-dark-tertiary"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-400">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Performance Tier */}
            <FormField
              control={form.control}
              name="reputationClaims.performanceTier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white font-medium">
                    <i className="fas fa-chart-line mr-2 text-success"></i>
                    Performance Tier
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-dark-tertiary border-custom text-white focus:border-success">
                        <SelectValue placeholder="Select performance tier..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-dark-secondary border-custom">
                      {PERFORMANCE_TIER_OPTIONS.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="text-white hover:bg-dark-tertiary focus:bg-dark-tertiary"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{option.label}</span>
                            <span className="text-xs text-gray-400">
                              {option.description}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Pool Type Experience */}
            <FormField
              control={form.control}
              name="reputationClaims.poolTypeExperience"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-white font-medium text-base">
                      <i className="fas fa-layer-group mr-2 text-success"></i>
                      Pool Type Experience
                    </FormLabel>
                    <FormDescription className="text-gray-400">
                      Select all pool types you have experience with.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {POOL_TYPE_OPTIONS.map((option) => (
                      <FormField
                        key={option.value}
                        control={form.control}
                        name="reputationClaims.poolTypeExperience"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={option.value}
                              className="flex flex-row items-start space-x-3 space-y-0 bg-dark-tertiary p-3 rounded-lg border border-custom"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(option.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          option.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== option.value,
                                          ),
                                        );
                                  }}
                                  className="data-[state=checked]:bg-success data-[state=checked]:border-success"
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium text-white cursor-pointer">
                                  {option.label}
                                </FormLabel>
                                <FormDescription className="text-xs text-gray-400">
                                  {option.description}
                                </FormDescription>
                              </div>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Optional Fields */}
            <div className="grid grid-cols-2 gap-4">
              {/* Issuer */}
              <FormField
                control={form.control}
                name="issuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">
                      <i className="fas fa-building mr-2 text-success"></i>
                      Issuer (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., TrustBridge Protocol"
                        className="bg-dark-tertiary border-custom text-white placeholder:text-gray-400 focus:border-success"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      Organization or entity issuing this credential
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expiration Date */}
              <FormField
                control={form.control}
                name="expirationDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">
                      <i className="fas fa-calendar-alt mr-2 text-success"></i>
                      Expiration Date (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="bg-dark-tertiary border-custom text-white focus:border-success"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription className="text-gray-400">
                      When this credential expires (leave blank for no
                      expiration)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Error Display */}
            {error && (
              <div className="rounded-lg bg-red-900/20 border border-red-700 p-4">
                <div className="flex items-center gap-2">
                  <i className="fas fa-exclamation-triangle text-red-400"></i>
                  <p className="text-sm text-red-300 font-medium">Error</p>
                </div>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            )}

            <DialogFooter className="gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="btn-secondary"
              >
                <i className="fas fa-times mr-2"></i>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                    Creating...
                  </>
                ) : (
                  <>
                    <i className="fas fa-plus mr-2"></i>
                    Create Credential
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
