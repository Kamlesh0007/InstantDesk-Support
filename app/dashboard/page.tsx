
"use client";

import DashboardOverView from "@/components/dashboard/DashboardOverview";
import InitialForm from "@/components/dashboard/initialform";
import React, { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

type PageStatus = "loading" | "ready" | "error";

const Page = () => {
  const [isMetaDataAvailable, setIsMetaDataAvailable] = useState(false);
  const [status, setStatus] = useState<PageStatus>("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchMetadata = async () => {
      try {
        const response = await fetch("/api/metadata/fetch", {
          method: "GET",
          cache: "no-store",
        });

        // User is not authenticated
        if (response.status === 401) {
          // Do not render InitialForm.
          // Start the Scalekit login flow.
          window.location.replace("/api/auth");
          return;
        }

        if (!response.ok) {
          throw new Error("Unable to fetch workspace metadata.");
        }

        const data = await response.json();

        if (!isMounted) return;

        setIsMetaDataAvailable(Boolean(data.exists));
        setStatus("ready");
      } catch (err) {
        console.error("Dashboard metadata error:", err);

        if (!isMounted) return;

        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong."
        );
        setStatus("error");
      }
    };

    fetchMetadata();

    return () => {
      isMounted = false;
    };
  }, []);

  // Loading or redirecting
  if (status === "loading") {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] w-full items-center justify-center bg-[#0A0A0E]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-violet-400" />
          <p className="text-sm text-zinc-500">
            Checking your workspace...
          </p>
        </div>
      </div>
    );
  }

  // API error
  if (status === "error") {
    return (
      <div className="flex min-h-[calc(100dvh-64px)] items-center justify-center p-4">
        <div className="max-w-md text-center">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-black"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Authenticated user: decide based on metadata
  return (
    <div className="w-full flex-1">
      {!isMetaDataAvailable ? (
        <div className="flex min-h-[calc(100dvh-64px)] w-full items-center justify-center p-4">
          <InitialForm />
        </div>
      ) : (
        <DashboardOverView />
      )}
    </div>
  );
};

export default Page;
