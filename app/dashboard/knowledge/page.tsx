
"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Database, Sparkles } from "lucide-react";
import QuickActions from "@/components/dashboard/knowledge/quickAction";
import AddKnowledgeModal from "@/components/dashboard/knowledge/addKnowledgeModal";
import KnowledgeTable from "@/components/dashboard/knowledge/knowledgeTable";
import SourceDetailsSheet from "@/components/dashboard/knowledge/sourceDetailSheet";

const Page = () => {
  const [defaultTab, setDefaultTab] = useState("website");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [knowledgeStoringLoader, setKnowledgeStoringLoader] = useState(false);
  const [knowledgeSourcesLoader, setKnowledgeSourcesLoader] = useState(true);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>([]);
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleImportSource = async (data: any) => {
    setKnowledgeStoringLoader(true);

    try {
      let response;

      if (data.type === "upload" && data.file) {
        const formData = new FormData();
        formData.append("type", "upload");
        formData.append("file", data.file);

        response = await fetch("/api/knowledge/store", {
          method: "POST",
          body: formData,
        });
      } else {
        response = await fetch("/api/knowledge/store", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
      }

      if (!response.ok) throw new Error("Failed to store source");

      const res = await fetch("/api/knowledge/fetch");
      if (!res.ok) throw new Error("Failed to fetch sources");

      const newData = await res.json();
      setKnowledgeSources(newData.sources ?? []);
      setIsAddOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setKnowledgeStoringLoader(false);
      setKnowledgeSourcesLoader(false);
    }
  };

  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setIsSheetOpen(true);
  };

  const updateSourceStatus = async (
    id: string,
    status: "active" | "excluded"
  ) => {
    setUpdatingId(id);

    try {
      const res = await fetch("/api/knowledge/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to update source");
      }

      const { source } = await res.json();

      setKnowledgeSources((prev) =>
        prev.map((s) => (s.id === source.id ? { ...s, ...source } : s))
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const openModal = (tab: string) => {
    setDefaultTab(tab);
    setIsAddOpen(true);
  };

  useEffect(() => {
    const fetchKnowledgeSources = async () => {
      try {
        const res = await fetch("/api/knowledge/fetch");
        if (!res.ok) throw new Error("Failed to fetch sources");

        const data = await res.json();
        setKnowledgeSources(data.sources ?? []);
      } catch (error) {
        console.error(error);
      } finally {
        setKnowledgeSourcesLoader(false);
      }
    };

    fetchKnowledgeSources();
  }, []);

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#050509]">
      <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-5 sm:px-6 sm:py-7 lg:space-y-8 lg:px-8">

        {/* Header */}
        <section className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
                <Database className="h-4 w-4 text-indigo-400" />
              </div>

              <span className="text-xs font-medium uppercase tracking-[0.18em] text-indigo-400">
                Knowledge Management
              </span>
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Knowledge Base
              </h1>

              <p className="mt-1 max-w-xl text-sm leading-relaxed text-zinc-400">
                Manage your website sources, documents, and uploads to train
                your AI assistant.
              </p>
            </div>
          </div>

          <Button
            onClick={() => openModal("website")}
            className="h-11 w-full rounded-xl bg-white px-5 font-medium text-black shadow-lg shadow-white/5 transition hover:bg-zinc-200 sm:w-auto"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Knowledge
          </Button>
        </section>

        {/* Quick Actions */}
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            <h2 className="text-sm font-medium text-white">
              Add a knowledge source
            </h2>
          </div>

          <QuickActions onOpenModal={openModal} />
        </section>

        {/* Knowledge Sources */}
        <section className="space-y-3">
          <KnowledgeTable
            sources={knowledgeSources}
            onSourceClick={handleSourceClick}
            isLoading={knowledgeSourcesLoader}
          />
        </section>

        {/* Modals */}
        <AddKnowledgeModal
          isOpen={isAddOpen}
          setIsOpen={setIsAddOpen}
          defaultTab={defaultTab}
          setDefaultTab={setDefaultTab}
          onImport={handleImportSource}
          isLoading={knowledgeStoringLoader}
          existingSources={knowledgeSources}
        />

        <SourceDetailsSheet
          isOpen={isSheetOpen}
          setIsOpen={setIsSheetOpen}
          selectedSource={selectedSource}
          onUpdateStatus={updateSourceStatus}
        />
      </div>
    </main>
  );
};

export default Page;
