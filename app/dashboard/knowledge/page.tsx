"use client";

import React from 'react'
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import QuickActions from '@/components/dashboard/knowledge/quickAction';
import AddKnowledgeModal from '@/components/dashboard/knowledge/addKnowledgeModal';
import KnowledgeTable from '@/components/dashboard/knowledge/knowledgeTable';
import SourceDetailsSheet from '@/components/dashboard/knowledge/sourceDetailSheet';

const page = () => {
     const [defaultTab, setDefaultTab] = useState("website");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [knowledgeStoringLoader, setKnowledgeStoringLoader] = useState(false);
  const [knowledgeSourcesLoader, setKnowledgeSourcesLoader] = useState(true);
  const [knowledgeSources, setKnowledgeSources] = useState<KnowledgeSource[]>(
    []
  );
  const [selectedSource, setSelectedSource] = useState<KnowledgeSource | null>(
    null
  );
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
      const newData = await res.json();
      setKnowledgeSources(newData.sources);
      setIsAddOpen(false);
    } catch (error) {
      console.error(error);
    } finally {
      setKnowledgeSourcesLoader(false);
          setKnowledgeStoringLoader(false);
    }
  };

  const handleSourceClick = (source: KnowledgeSource) => {
    setSelectedSource(source);
    setIsSheetOpen(true);
  };

  // Disconnect / connect API call. Throws on failure so callers can show errors.
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

  // For the table's inline Connect / Disconnect button
  const handleToggleStatus = async (source: KnowledgeSource) => {
    if (updatingId) return;
    try {
      await updateSourceStatus(
        source.id,
        source.status === "excluded" ? "active" : "excluded"
      );
    } catch (error) {
      console.error(error);
    }
  };


  const openModal = (tab: string) => {
    setDefaultTab(tab);
    setIsAddOpen(true);
  };

   useEffect(() => {
    const fetchKnowledgeSources = async () => {
      const res = await fetch("/api/knowledge/fetch");
      const data = await res.json();
      setKnowledgeSources(data.sources);
      setKnowledgeSourcesLoader(false);
    };
    fetchKnowledgeSources();
  }, []);

  return (
 <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Knowledge Base
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your website sources, documents, and uploads here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => openModal("website")}
            className="bg-white text-black hover:bg-zinc-200"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Knowledge
          </Button>
        </div>
      </div>

          {/* Quick Actions */}
      <QuickActions onOpenModal={openModal} />

       <KnowledgeTable
        sources={knowledgeSources}
        onSourceClick={handleSourceClick}
        isLoading={knowledgeSourcesLoader}
      />

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
      
  )
}

export default page