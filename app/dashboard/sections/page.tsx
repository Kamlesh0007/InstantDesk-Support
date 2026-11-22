
"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import SectionFormFields from "@/components/dashboard/sections/sectionFormFields";
import SectionsTable from "@/components/dashboard/sections/sectionTable";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  AlertCircle,
  Plus,
  Layers3,
  Sparkles,
  Trash2,
} from "lucide-react";

// Shape of a knowledge source as returned by the API
interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  status: string;
}

// Default form data
const INITIAL_FORM_DATA: SectionFormData = {
  name: "",
  description: "",
  tone: "neutral",
  allowedTopics: "",
  blockedTopics: "",
  fallbackBehavior: "escalate",
};

const Page = () => {
  const searchParams = useSearchParams();

  // Sheet and dialog states
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Selected section
  const [selectedSection, setSelectedSection] =
    useState<Section | null>(null);

  // Knowledge sources
  const [knowledgeSources, setKnowledgeSources] = useState<
    KnowledgeSource[]
  >([]);

  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [isLoadingSources, setIsLoadingSources] = useState(true);

  // Sections
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  // Form
  const [formData, setFormData] =
    useState<SectionFormData>(INITIAL_FORM_DATA);

  // Other states
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  // Create a new section
  const handleCreateSection = () => {
    setError("");

    setSelectedSection({
      id: "new",
      name: "",
      description: "",
      sourceCount: 0,
      tone: "neutral",
      scopeLabel: "",
      status: "draft",
    });

    setSelectedSources([]);
    setFormData(INITIAL_FORM_DATA);
    setIsSheetOpen(true);
  };

  // Automatically open create section from URL parameter
  useEffect(() => {
    if (searchParams.get("createSection") === "true") {
      handleCreateSection();
    }
  }, [searchParams]);

  // Fetch sections
  const fetchSections = async () => {
    try {
      setIsLoadingSections(true);

      const response = await fetch("/api/section/fetch");

      if (!response.ok) {
        throw new Error("Failed to fetch sections");
      }

      const data = await response.json();

      const transformedSections: Section[] = data.map(
        (section: any) => ({
          id: section.id,
          name: section.name,
          description: section.description,
          sourceCount: section.source_ids?.length || 0,
          source_ids: section.source_ids || [],
          tone: section.tone as Tone,
          scopeLabel: section.allowed_topics || "General",
          allowed_topics: section.allowed_topics,
          blocked_topics: section.blocked_topics,
          status: section.status as SectionStatus,
        })
      );

      setSections(transformedSections);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchSections();
  }, []);

  // Fetch knowledge sources
  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const response = await fetch("/api/knowledge/fetch");

        if (!response.ok) {
          throw new Error("Failed to fetch knowledge sources");
        }

        const data = await response.json();

        setKnowledgeSources(data.sources || []);
      } catch (error) {
        console.error("Failed to fetch knowledge sources:", error);
      } finally {
        setIsLoadingSources(false);
      }
    };

    fetchKnowledgeSources();
  }, []);

  // Save section
  const handleSaveSection = async () => {
    if (!formData.name.trim()) {
      setError("Please enter a section name.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please enter a description.");
      return;
    }

    if (selectedSources.length === 0) {
      setError("Please select at least one knowledge source.");
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const sectionData = {
        ...formData,
        sourceIds: selectedSources,
        status: "active",
      };

      const response = await fetch("/api/section/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sectionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create section");
      }

      await fetchSections();

      setIsSheetOpen(false);
      setSelectedSection(null);
    } catch (error) {
      console.error("Failed to save section:", error);
      setError("Failed to create section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete section
  const handleDeleteSection = async () => {
    setError("");

    if (!selectedSection || selectedSection.id === "new") return;

    try {
      setIsSaving(true);

      const response = await fetch("/api/section/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: selectedSection.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      await fetchSections();

      setIsDeleteDialogOpen(false);
      setIsSheetOpen(false);
      setSelectedSection(null);
    } catch (error) {
      console.error("Failed to delete section:", error);
      setError("Failed to delete section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Preview existing section
  const handlePreviewSection = (section: Section) => {
    setError("");
    setSelectedSection(section);

    setFormData({
      name: section.name,
      description: section.description,
      tone: section.tone,
      allowedTopics: section.allowed_topics || "",
      blockedTopics: section.blocked_topics || "",
      fallbackBehavior: "escalate",
    });

    setSelectedSources(section.source_ids || []);
    setIsSheetOpen(true);
  };

  // Existing sections are read-only
  const isPreviewMode = selectedSection?.id !== "new";

  return (
    <div className="min-h-full w-full min-w-0 space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-7 lg:px-8">

      {/* Page Header */}
     
<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

  {/* Title and Description */}
  <div className="flex min-w-0 items-start gap-3">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 sm:h-11 sm:w-11">
      <Layers3 className="h-5 w-5 text-violet-400" />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-xl font-semibold tracking-tight text-white sm:text-3xl">
          Sections
        </h1>

        <Badge
          variant="outline"
          className="rounded-md border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-300 sm:text-xs"
        >
          AI Configuration
        </Badge>
      </div>

      <p className="mt-1 max-w-md text-xs leading-relaxed text-zinc-400 sm:text-sm">
        Define how your AI assistant behaves and handles different topics.
      </p>
    </div>
  </div>

  {/* Create Button */}
  <Button
    onClick={handleCreateSection}
    className="h-10 w-full shrink-0 rounded-xl bg-white px-4 text-sm font-medium text-black shadow-lg shadow-white/5 transition-all hover:bg-zinc-200 sm:h-11 sm:w-auto sm:px-5"
  >
    <Plus className="mr-2 h-4 w-4" />
    Create Section
  </Button>

</div>

      {/* Section Content */}
      <div className="space-y-4">

        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-white">
              Your Sections
            </h2>
            <p className="mt-1 text-xs text-zinc-500">
              Manage your AI assistant&apos;s topic-specific behavior.
            </p>
          </div>

          <div className="hidden items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 sm:flex">
            <Sparkles className="h-3.5 w-3.5 text-violet-400" />
            <span className="text-xs text-zinc-400">
              AI-powered responses
            </span>
          </div>
        </div>

        <Card className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E]/80 shadow-xl shadow-black/10">
          <CardContent className="p-0">
            <SectionsTable
              sections={sections}
              isLoading={isLoadingSections}
              onPreview={handlePreviewSection}
              onCreateSection={handleCreateSection}
            />
          </CardContent>
        </Card>
      </div>

      {/* Create / Preview Sheet */}
      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!isSaving) {
            setIsSheetOpen(open);
          }
        }}
      >
        <SheetContent
          side="right"
          className="flex h-dvh w-full flex-col gap-0 overflow-hidden border-l border-white/10 bg-[#0A0A0E] p-0 shadow-2xl sm:max-w-lg"
        >
          {selectedSection && (
            <>
              {/* Sheet Header */}
              <SheetHeader className="shrink-0 border-b border-white/[0.08] px-5 py-5 pr-14 text-left sm:px-6 sm:py-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10">
                  <Sparkles className="h-5 w-5 text-violet-400" />
                </div>

                <SheetTitle className="text-xl font-semibold text-white">
                  {selectedSection.id === "new"
                    ? "Create Section"
                    : "View Section"}
                </SheetTitle>

                <SheetDescription className="text-sm leading-relaxed text-zinc-500">
                  {selectedSection.id === "new"
                    ? "Configure how your AI assistant behaves for this specific topic."
                    : "Review your section configuration and connected knowledge sources."}
                </SheetDescription>
              </SheetHeader>

              {/* Error Message */}
              {error && (
                <div className="shrink-0 px-5 pt-4 sm:px-6">
                  <Badge
                    variant="destructive"
                    className="flex w-full items-start justify-start gap-2 whitespace-normal rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5 text-left text-sm leading-relaxed text-red-400"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {error}
                  </Badge>
                </div>
              )}

              {/* Scrollable Form */}
              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">
                <SectionFormFields
                  formData={formData}
                  setFormData={setFormData}
                  selectedSources={selectedSources}
                  setSelectedSources={setSelectedSources}
                  knowledgeSources={knowledgeSources}
                  isLoadingSources={isLoadingSources}
                  isDisabled={isPreviewMode}
                />
              </div>

              {/* Create Action */}
              {selectedSection.id === "new" && (
                <div className="shrink-0 border-t border-white/[0.08] bg-[#0A0A0E] p-4 sm:p-6">
                  <Button
                    className="h-11 w-full rounded-xl bg-white font-medium text-black shadow-lg shadow-white/5 transition hover:bg-zinc-200"
                    onClick={handleSaveSection}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Section
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Delete Action */}
              {selectedSection.id !== "new" && (
                <div className="shrink-0 border-t border-red-500/10 bg-red-500/[0.03] p-4 sm:p-6">
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4 text-red-400" />
                      <h5 className="text-sm font-medium text-red-400">
                        Danger Zone
                      </h5>
                    </div>

                    <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                      Deleting this section will remove all associated
                      routing rules.
                    </p>
                  </div>

                  <Button
                    variant="destructive"
                    className="h-10 w-full rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 shadow-none transition hover:bg-red-500/20 hover:text-red-300"
                    onClick={() => {
                      setError("");
                      setIsSheetOpen(false);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isSaving}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Section
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!isSaving) {
            setIsDeleteDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] max-w-md rounded-2xl border border-white/10 bg-[#0A0A0E] text-white shadow-2xl">
          <AlertDialogHeader>
            <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
              <Trash2 className="h-5 w-5 text-red-400" />
            </div>

            <AlertDialogTitle className="text-lg font-semibold text-white">
              Delete Section?
            </AlertDialogTitle>

            <AlertDialogDescription className="text-sm leading-relaxed text-zinc-400">
              Are you sure you want to delete{" "}
              <span className="font-medium text-white">
                &quot;{selectedSection?.name}&quot;
              </span>
              ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter className="mt-3 flex-col-reverse gap-2 sm:flex-row">
            <AlertDialogCancel
              disabled={isSaving}
              onClick={() => setIsSheetOpen(true)}
              className="mt-0 h-10 w-full rounded-xl border border-white/10 bg-white/[0.04] text-zinc-300 hover:bg-white/[0.08] hover:text-white sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteSection();
              }}
              disabled={isSaving}
              className="h-10 w-full rounded-xl bg-red-600 font-medium text-white hover:bg-red-700 sm:w-auto"
            >
              {isSaving ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Page;
