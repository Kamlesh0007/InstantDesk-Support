"use client";

import SectionFormFields from "@/components/dashboard/sections/sectionFormFields";
import SectionsTable from "@/components/dashboard/sections/sectionTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AlertCircle, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import React, { useEffect, useState } from "react";
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
import { useSearchParams } from "next/navigation";

// Shape of a knowledge source as returned by /api/knowledge/fetch
interface KnowledgeSource {
  id: string;
  name: string;
  type: string;
  status: string;
}

// Default/empty state for the section creation form
const INITIAL_FORM_DATA: SectionFormData = {
  name: "",
  description: "",
  tone: "neutral",
  allowedTopics: "",
  blockedTopics: "",
  fallbackBehavior: "escalate",
};

const Page = () => {
  // Controls whether the create/preview side panel (Sheet) is open
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // The section currently being created or previewed; null when the sheet is closed
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);

  // All knowledge sources available to attach to a section
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );

  // IDs of knowledge sources selected for the section currently being edited
  const [selectedSources, setSelectedSources] = useState<string[]>([]);

  // Loading flags — kept separate since sources and sections load independently
  const [isLoadingSources, setIsLoadingSources] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // All sections belonging to the user, shown in the main table
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(true);

  // Form state bound to the create/edit panel
  const [formData, setFormData] = useState<SectionFormData>(INITIAL_FORM_DATA);

  const [error, setError] = useState("");

  const searchParams = useSearchParams();

  // Load the user's sections once on mount
  useEffect(() => {
    fetchSections();
  }, []);

  useEffect(() => {
  if (searchParams.get("createSection") === "true") {
handleCreateSection();
  }
}, [searchParams]);

  // Opens the sheet in "create" mode with a blank draft section and empty form
  const handleCreateSection = async () => {
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

  // Load available knowledge sources once on mount, independent of sections
  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const res = await fetch("/api/knowledge/fetch");
        const data = await res.json();
        setKnowledgeSources(data.sources || []);
      } catch (error) {
        console.error("Failed to fetch knowledge sources:", error);
      } finally {
        setIsLoadingSources(false);
      }
    };
    fetchKnowledgeSources();
  }, []);

  // Fetches all sections and normalizes the API response into the shape the UI expects
  const fetchSections = async () => {
    try {
      setIsLoadingSections(true);
      const res = await fetch("/api/section/fetch");
      const data = await res.json();

      // Map raw snake_case API fields to the camelCase Section type used in the UI
      const transformedSections: Section[] = data.map((section: any) => ({
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
      }));

      setSections(transformedSections);
    } catch (error) {
      console.error("Failed to fetch sections:", error);
    } finally {
      setIsLoadingSections(false);
    }
  };

  // Validates and submits the create-section form
  const handleSaveSection = async () => {
    // Basic client-side validation before hitting the API
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
      // Bundle form fields with selected source IDs and force status to active on creation
      const sectionData = {
        ...formData,
        sourceIds: selectedSources,
        status: "active",
      };

      const response = await fetch("/api/section/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sectionData),
      });

      if (!response.ok) {
        throw new Error("Failed to create section");
      }

      // Refresh the sections list and close the panel on success
      await fetchSections();
      setIsSheetOpen(false);
    } catch (error) {
      console.error("Failed to save section:", error);
        setError("Failed to create section. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Deletes the currently selected section after user confirmation
  const handleDeleteSection = async () => {
    setError("")
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

  // Opens the sheet in read-only "preview" mode, pre-filled with an existing section's data
  const handlePreviewSection = async (section: Section) => {
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

  // Anything other than the "new" draft is treated as an existing section being viewed
  const isPreviewMode = selectedSection?.id !== "new";

  return (
    <div className="p-8 space-y-6">
      {/* Page header with title and create-section entry point */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Sections</h1>
          <p className="text-zinc-400 mt-1">
            Define behavior and tone for different topics.
          </p>
        </div>
        <Button
          onClick={handleCreateSection}
          className="bg-white text-black hover:bg-zinc-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </Button>
      </div>

      {/* Table of existing sections (currently commented out / pending implementation) */}
      <Card className="border-white/5 bg-[#0A0A0E]">
        <CardContent className="p-0">
          <SectionsTable
            sections={sections}
            isLoading={isLoadingSections}
            onPreview={handlePreviewSection}
            onCreateSection={handleCreateSection}
          />
        </CardContent>
      </Card>

      {/* Slide-over panel used for both creating a new section and previewing an existing one */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent  className="w-full sm:max-w-lg border-l border-white/10 bg-[#0A0A0E] p-0 shadow-2xl flex flex-col h-full">
          {selectedSection && (
            <>
              {/* Header text changes depending on create vs. preview mode */}
              <SheetHeader className="p-6 border-b border-white/5">
                <SheetTitle className="text-xl text-white">
                  {selectedSection.id === "new"
                    ? "Create Section"
                    : "View Section"}
                </SheetTitle>
                <SheetDescription className="text-zinc-500">
                  {selectedSection.id === "new"
                    ? "Configure how the AI behaves for this specific topic."
                    : "Review section configuration and data sources."}
                </SheetDescription>
              </SheetHeader>
{error && (
  <div className="px-6 pt-4">
    <Badge
      variant="destructive"
      className="w-full justify-start rounded-md py-2 px-3 text-sm gap-2 bg-red-500/10 border border-red-500/20 text-red-400"
    >
      <AlertCircle className="h-4 w-4 shrink-0" />
      {error}
    </Badge>
  </div>
)}
              {/* Form fields for name, description, tone, topics, and source selection
                  (currently commented out / pending implementation) */}
              <div className="flex-1 overflow-y-auto px-6 py-0 space-y-8">
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

              {/* Create button only shown for new, unsaved drafts */}
              {selectedSection.id === "new" && (
                <div className="p-6 border-t border-white/5">
                  <Button
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    onClick={handleSaveSection}
                    disabled={isSaving}
                  >
                    {isSaving ? "Creating..." : "Create Section"}
                  </Button>
                </div>
              )}

              {/* Danger zone / delete action only shown for existing, saved sections */}
              {selectedSection.id !== "new" && (
                <div className="p-6 bg-red-500/5 border-t border-red-500/10">
                  <h5 className="text-sm font-medium text-red-400 mb-1">
                    Danger Zone
                  </h5>
                  <p className="text-xs text-red-500/70 mb-3">
                    Deleting this section will remove all associated routing
                    rules.
                  </p>

     <Button
  variant="destructive"
  size="sm"
  className="w-full bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20 shadow-none"
  onClick={() => {
    setIsSheetOpen(false)
    setIsDeleteDialogOpen(true)
    
  }}
  disabled={isSaving}
>
  Delete Section
</Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
<AlertDialog
  open={isDeleteDialogOpen}
  onOpenChange={(open) => {
    if (!isSaving) {

      setIsDeleteDialogOpen(open);
    }
  }}>
  <AlertDialogContent className="border-zinc-800 bg-[#0A0A0E]">
    <AlertDialogHeader>
      <AlertDialogTitle className="text-white">
        Delete Section?
      </AlertDialogTitle>

      <AlertDialogDescription className="text-zinc-400">
        Are you sure you want to delete{" "}
        <span className="font-medium text-white">
          "{selectedSection?.name}"
        </span>
        ?
        <br />
        <br />
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>

    <AlertDialogFooter>
      <AlertDialogCancel disabled={isSaving} onClick={()=> setIsSheetOpen(true)}>
        Cancel
      </AlertDialogCancel>

      <AlertDialogAction
        onClick={handleDeleteSection}
        disabled={isSaving}
        className="bg-red-600 hover:bg-red-700"
      >
        {isSaving ? "Deleting..." : "Delete"}
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
    </div>
  );
};

export default Page;