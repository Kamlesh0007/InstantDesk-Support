
"use client";

import TeamSection from "@/components/setting/teamSection";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Trash2,
  Settings2,
  Building2,
  Globe,
  Languages,
  Clock3,
  LogOut,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";
import React, { useEffect, useState } from "react";

interface OrganizationData {
  id: string;
  business_name: string;
  website_url: string;
  created_at: string;
}

const FieldSkeleton = () => (
  <div className="h-11 w-full animate-pulse rounded-xl border border-white/[0.06] bg-white/[0.04]" />
);

interface SettingFieldProps {
  label: string;
  value?: string;
  icon: React.ElementType;
  isLoading?: boolean;
}

const SettingField = ({
  label,
  value,
  icon: Icon,
  isLoading,
}: SettingFieldProps) => (
  <div className="min-w-0 space-y-2">
    <Label className="text-xs font-medium text-zinc-500">
      {label}
    </Label>

    {isLoading ? (
      <FieldSkeleton />
    ) : (
      <div className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5">
        <Icon className="h-4 w-4 shrink-0 text-zinc-500" />
        <span className="truncate text-sm text-zinc-300">
          {value || "Not configured"}
        </span>
      </div>
    )}
  </div>
);

const SettingPage = () => {
  const [organizationData, setOrganizationData] =
    useState<OrganizationData>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizationData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/organization/fetch");

        if (!response.ok) {
          throw new Error("Failed to load workspace settings");
        }

        const data = await response.json();
        setOrganizationData(data.organization);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load workspace settings"
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizationData();
  }, []);

  return (
    <main className="mx-auto w-full min-w-0 max-w-5xl space-y-6 overflow-x-clip px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
      {/* Page Header */}
      <div className="flex items-start gap-3 sm:items-center">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
          <Settings2 className="h-5 w-5 text-violet-400" />
        </div>

        <div className="min-w-0">
          <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
            Settings
          </h1>
          <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
            Manage your workspace, team, and account preferences.
          </p>
        </div>
      </div>

      {/* Workspace Settings */}
      <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E]">
        <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-white/[0.06] p-4 sm:p-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10">
              <Building2 className="h-5 w-5 text-blue-400" />
            </div>

            <div className="min-w-0">
              <CardTitle className="text-base font-semibold text-white">
                Workspace Settings
              </CardTitle>
              <CardDescription className="mt-1 text-xs sm:text-sm">
                General information about your organization.
              </CardDescription>
            </div>
          </div>

          {isLoading && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-zinc-500" />
          )}
        </CardHeader>

        <CardContent className="space-y-6 p-4 sm:p-6">
          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <SettingField
                  label="Workspace Name"
                  value={organizationData?.business_name}
                  icon={Building2}
                  isLoading={isLoading}
                />

                <SettingField
                  label="Primary Website"
                  value={organizationData?.website_url}
                  icon={Globe}
                  isLoading={isLoading}
                />
              </div>

              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                <SettingField
                  label="Default Language"
                  value="English"
                  icon={Languages}
                />

                <SettingField
                  label="Timezone"
                  value="UTC (GMT+0)"
                  icon={Clock3}
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-3">
                <ShieldAlert className="h-4 w-4 shrink-0 text-zinc-500" />
                <p className="text-xs text-zinc-500">
                  Workspace information is currently read-only.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Members */}
      <section className="min-w-0">
        <TeamSection />
      </section>

      {/* Account */}
      <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E]">
        <CardHeader className="flex flex-row items-center gap-3 p-4 sm:p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10">
            <LogOut className="h-5 w-5 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <CardTitle className="text-base font-semibold text-white">
              Account
            </CardTitle>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              Manage your current session and workspace access.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 border-t border-white/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-300">
              Sign out
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              Sign out of your Scalekit session and this workspace.
            </p>
          </div>

          <Button
            variant="outline"
            asChild
            className="w-full gap-2 border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white sm:w-auto"
          >
            <a href="/api/auth/logout">
              <LogOut className="h-4 w-4" />
              Sign out
              <ChevronRight className="h-4 w-4" />
            </a>
          </Button>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="overflow-hidden rounded-2xl border border-red-500/20 bg-[#0A0A0E]">
        <CardHeader className="border-b border-red-500/10 p-4 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <ShieldAlert className="h-5 w-5 text-red-400" />
            </div>

            <div>
              <CardTitle className="text-base font-semibold text-red-400">
                Danger Zone
              </CardTitle>
              <CardDescription className="mt-1 text-xs text-zinc-500">
                Irreversible actions for this workspace.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200">
              Delete Workspace
            </p>
            <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-500">
              Permanently delete all knowledge, conversations, and settings.
              This action cannot be undone.
            </p>
          </div>

         
<AlertDialog>
  <AlertDialogTrigger
    className="inline-flex h-10 w-full shrink-0 items-center justify-center gap-2 rounded-md border border-red-500/20 bg-red-500/10 px-4 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300 sm:w-auto"
  >
    <Trash2 className="h-4 w-4" />
    Delete Workspace
  </AlertDialogTrigger>

  <AlertDialogContent className="w-[calc(100%-2rem)] rounded-2xl border-white/10 bg-[#0E0E12] text-white sm:max-w-md">
    <AlertDialogHeader>
      <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
        <Trash2 className="h-5 w-5 text-red-400" />
      </div>

      <AlertDialogTitle className="text-white">
        Are you absolutely sure?
      </AlertDialogTitle>

      <AlertDialogDescription className="text-sm leading-relaxed text-zinc-400">
        This action cannot be undone. This will permanently delete
        your workspace and remove all associated data from our servers.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter className="flex-col-reverse gap-2 sm:flex-row">
      <AlertDialogCancel className="mt-0 border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/10 hover:text-white">
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction className="bg-red-500 text-white hover:bg-red-600">
        Delete Workspace
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>

        </CardContent>
      </Card>
    </main>
  );
};

export default SettingPage;
