
"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  ArrowUpRight,
  Check,
  Database,
  File,
  Filter,
  Globe,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Upload,
} from "lucide-react";

// --------------------------------------------------
// Types
// --------------------------------------------------

interface KnowledgeTableProps {
  sources: KnowledgeSource[];
  onSourceClick: (source: KnowledgeSource) => void;
  isLoading: boolean;
}

const ALL_TYPES: SourceType[] = ["website", "upload", "text"];

const ALL_STATUSES: SourceStatus[] = [
  "active",
  "training",
  "error",
  "excluded",
];

// --------------------------------------------------
// Source Type Icon
// --------------------------------------------------

export const getTypeIcon = (type: SourceType) => {
  switch (type) {
    case "website":
      return <Globe className="h-4 w-4 text-blue-400" />;

    case "upload":
      return <Upload className="h-4 w-4 text-emerald-400" />;

    case "text":
      return <File className="h-4 w-4 text-violet-400" />;

    default:
      return <Database className="h-4 w-4 text-zinc-400" />;
  }
};

// --------------------------------------------------
// Status Badge
// --------------------------------------------------

export const getStatusBadge = (status: SourceStatus) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="outline"
          className="whitespace-nowrap border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </Badge>
      );

    case "training":
      return (
        <Badge
          variant="outline"
          className="whitespace-nowrap border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Training
        </Badge>
      );

    case "error":
      return (
        <Badge
          variant="outline"
          className="whitespace-nowrap border-red-500/20 bg-red-500/10 text-red-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
          Error
        </Badge>
      );

    case "excluded":
      return (
        <Badge
          variant="outline"
          className="whitespace-nowrap border-zinc-500/20 bg-zinc-500/10 text-zinc-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-zinc-500" />
          Excluded
        </Badge>
      );

    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

// --------------------------------------------------
// Main Component
// --------------------------------------------------

const KnowledgeTable = ({
  sources,
  onSourceClick,
  isLoading,
}: KnowledgeTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  // Applied filters
  const [typeFilters, setTypeFilters] = useState<SourceType[]>([]);
  const [statusFilters, setStatusFilters] = useState<SourceStatus[]>([]);

  // Draft filters inside dialog
  const [draftTypeFilters, setDraftTypeFilters] = useState<SourceType[]>([]);
  const [draftStatusFilters, setDraftStatusFilters] = useState<SourceStatus[]>([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --------------------------------------------------
  // Filter Handlers
  // --------------------------------------------------

  const toggleTypeFilter = (type: SourceType) => {
    setDraftTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleStatusFilter = (status: SourceStatus) => {
    setDraftStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  // Open dialog and copy currently applied filters
  const openFilterDialog = () => {
    setDraftTypeFilters([...typeFilters]);
    setDraftStatusFilters([...statusFilters]);
    setIsFilterOpen(true);
  };

  // Apply draft filters
  const applyFilters = () => {
    setTypeFilters([...draftTypeFilters]);
    setStatusFilters([...draftStatusFilters]);
    setIsFilterOpen(false);
  };

  // Clear draft selections inside dialog
  const clearDraftFilters = () => {
    setDraftTypeFilters([]);
    setDraftStatusFilters([]);
  };

  // Clear applied filters immediately (outside dialog)
  const clearFilters = () => {
    setTypeFilters([]);
    setStatusFilters([]);
    setDraftTypeFilters([]);
    setDraftStatusFilters([]);
  };

  const activeFilterCount =
    typeFilters.length + statusFilters.length;

  const draftFilterCount =
    draftTypeFilters.length + draftStatusFilters.length;

  // --------------------------------------------------
  // Search and Filter Sources
  // --------------------------------------------------

  const filteredSources = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sources.filter((source) => {
      const matchesQuery =
        !query ||
        source.name?.toLowerCase().includes(query) ||
        source.source_url?.toLowerCase().includes(query);

      const matchesType =
        typeFilters.length === 0 ||
        typeFilters.includes(source.type as SourceType);

      const matchesStatus =
        statusFilters.length === 0 ||
        statusFilters.includes(source.status as SourceStatus);

      return matchesQuery && matchesType && matchesStatus;
    });
  }, [sources, searchQuery, typeFilters, statusFilters]);

  // --------------------------------------------------
  // Loading Skeleton
  // --------------------------------------------------

  const renderLoading = () => (
    <div className="w-full min-w-0 space-y-3 p-3 sm:p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex w-full min-w-0 items-center gap-3 overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-3 sm:p-4"
        >
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.06]" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-white/[0.06]" />
            <Skeleton className="h-3 w-1/2 bg-white/[0.06]" />
          </div>

          <Skeleton className="h-6 w-16 shrink-0 rounded-full bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );

  // --------------------------------------------------
  // Empty State
  // --------------------------------------------------

  const renderEmptyState = () => (
    <div className="flex w-full min-w-0 flex-col items-center justify-center px-4 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Database className="h-6 w-6 text-zinc-500" />
      </div>

      <h3 className="mt-5 text-sm font-semibold text-white">
        {sources.length > 0
          ? "No matching sources found"
          : "No knowledge sources yet"}
      </h3>

      <p className="mt-2 max-w-xs text-xs leading-relaxed text-zinc-500">
        {sources.length > 0
          ? "Try changing your search query or filters."
          : "Add a website, upload a document, or manually add text to start building your knowledge base."}
      </p>

      {activeFilterCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="mt-4 rounded-lg border-white/10 bg-white/[0.03] text-zinc-300 hover:bg-white/10 hover:text-white"
        >
          Clear filters
        </Button>
      )}
    </div>
  );

  // --------------------------------------------------
  // Mobile Source Cards
  // --------------------------------------------------

  const renderMobileCards = () => (
    <div className="grid w-full min-w-0 grid-cols-1 gap-3 overflow-hidden p-3 sm:p-4 md:hidden">
      {filteredSources.map((source) => (
        <div
          key={source.id}
          className="relative w-full min-w-0 max-w-full overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#171721] via-[#111119] to-[#0b0b10] p-3.5 shadow-lg shadow-black/10 transition-all duration-200 sm:p-4"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          <div className="flex min-w-0 items-start gap-2.5 sm:gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08] sm:h-11 sm:w-11">
              {getTypeIcon(source.type as SourceType)}
            </div>

            <div className="min-w-0 flex-1 overflow-hidden pt-0.5">
              <h3 className="truncate text-sm font-semibold text-zinc-100">
                {source.name || "Untitled source"}
              </h3>

              <p className="mt-1 truncate text-xs text-zinc-500">
                {source.source_url || "Manually added content"}
              </p>
            </div>

            <div className="max-w-[100px] shrink-0">
              {getStatusBadge(source.status as SourceStatus)}
            </div>
          </div>

          <div className="my-4 h-px w-full bg-white/[0.06]" />

          <div className="flex min-w-0 flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-col gap-1.5">
              <span className="w-fit rounded-md border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                {source.type}
              </span>

              <span className="text-[11px] text-zinc-500">
                {source.last_updated
                  ? `Updated ${new Date(
                      source.last_updated
                    ).toLocaleDateString()}`
                  : "Not updated yet"}
              </span>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onSourceClick(source)}
              className="h-9 shrink-0 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 text-xs font-medium text-zinc-300 transition hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-white"
            >
              View details
              <ArrowUpRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );

  // --------------------------------------------------
  // Desktop Table
  // --------------------------------------------------

  const renderDesktopTable = () => (
    <div className="hidden w-full min-w-0 overflow-x-auto md:block">
      <Table className="w-full min-w-[650px]">
        <TableHeader>
          <TableRow className="border-white/[0.06] hover:bg-transparent">
            <TableHead className="pl-5 text-xs font-medium uppercase tracking-wider text-zinc-500">
              Name
            </TableHead>

            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Type
            </TableHead>

            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Status
            </TableHead>

            <TableHead className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Last Updated
            </TableHead>

            <TableHead className="pr-5 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredSources.map((source) => (
            <TableRow
              key={source.id}
              onClick={() => onSourceClick(source)}
              className="cursor-pointer border-white/[0.06] transition-colors hover:bg-white/[0.025]"
            >
              <TableCell className="max-w-[320px] pl-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03]">
                    {getTypeIcon(source.type as SourceType)}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-medium text-zinc-200">
                      {source.name}
                    </p>

                    {source.source_url && (
                      <p className="truncate text-xs text-zinc-500">
                        {source.source_url}
                      </p>
                    )}
                  </div>
                </div>
              </TableCell>

              <TableCell className="capitalize text-zinc-400">
                {source.type}
              </TableCell>

              <TableCell>
                {getStatusBadge(source.status as SourceStatus)}
              </TableCell>

              <TableCell className="text-sm text-zinc-400">
                {source.last_updated
                  ? new Date(
                      source.last_updated
                    ).toLocaleDateString()
                  : "—"}
              </TableCell>

              <TableCell className="pr-5 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSourceClick(source);
                  }}
                  className="text-zinc-400 hover:bg-white/5 hover:text-white"
                >
                  View
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  // --------------------------------------------------
  // Main UI
  // --------------------------------------------------

  return (
    <Card className="w-full min-w-0 max-w-full overflow-hidden rounded-2xl border-white/[0.07] bg-[#0A0A0E] shadow-xl shadow-black/10">
      <CardHeader className="w-full min-w-0 space-y-4 p-3 sm:p-5">
        {/* Header */}
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
                <Database className="h-4 w-4 text-indigo-400" />
              </div>

              <CardTitle className="text-base font-semibold text-white">
                Sources
              </CardTitle>
            </div>

            <p className="mt-1.5 text-xs text-zinc-500">
              {sources.length} knowledge{" "}
              {sources.length === 1 ? "source" : "sources"} connected
            </p>
          </div>

          {activeFilterCount > 0 && (
            <Badge
              variant="outline"
              className="shrink-0 border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
            >
              {activeFilterCount} filters
            </Badge>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex w-full min-w-0 items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your sources..."
              className="h-11 w-full min-w-0 rounded-xl border-white/[0.08] bg-white/[0.035] pl-10 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/40"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={openFilterDialog}
            className="relative h-11 w-11 shrink-0 rounded-xl border-white/[0.08] bg-white/[0.035] text-zinc-400 hover:bg-white/10 hover:text-white"
          >
            <Filter className="h-4 w-4" />

            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>

        {/* Filter Dialog */}
<Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  <DialogContent className="flex w-[calc(100vw-1.5rem)] max-w-[480px] flex-col gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111116] p-0 text-white shadow-2xl shadow-black/50 max-h-[85dvh] sm:max-h-[85dvh]">

    {/* Header */}
    <DialogHeader className="shrink-0 border-b border-white/[0.06] px-5 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
          <SlidersHorizontal className="h-5 w-5" />
        </div>

        <div className="min-w-0 space-y-1 text-left">
          <DialogTitle className="text-base font-semibold text-white">
            Filter sources
          </DialogTitle>
          <p className="text-xs text-zinc-500">
            Customize which knowledge sources you want to see.
          </p>
        </div>
      </div>
    </DialogHeader>

    {/* Scrollable Content */}
    <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-6">

      {/* Source Type */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Source type
          </p>

          <span className="text-xs text-zinc-500">
            {draftTypeFilters.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ALL_TYPES.map((type) => (
            <div
              key={type}
              onClick={() => toggleTypeFilter(type)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all ${
                draftTypeFilters.includes(type)
                  ? "border-violet-500/40 bg-violet-500/[0.08]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                  {getTypeIcon(type)}
                </div>

                <span className="text-sm font-medium capitalize text-zinc-200">
                  {type}
                </span>
              </div>

              <Checkbox
                id={`type-${type}`}
                checked={draftTypeFilters.includes(type)}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggleTypeFilter(type)}
                className="shrink-0 border-zinc-600 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-500"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/[0.06]" />

      {/* Source Status */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
            Source status
          </p>

          <span className="text-xs text-zinc-500">
            {draftStatusFilters.length} selected
          </span>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {ALL_STATUSES.map((status) => (
            <div
              key={status}
              onClick={() => toggleStatusFilter(status)}
              className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-all ${
                draftStatusFilters.includes(status)
                  ? "border-violet-500/40 bg-violet-500/[0.08]"
                  : "border-white/[0.06] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]"
              }`}
            >
              <span className="text-sm font-medium capitalize text-zinc-200">
                {status}
              </span>

              <Checkbox
                id={`status-${status}`}
                checked={draftStatusFilters.includes(status)}
                onClick={(e) => e.stopPropagation()}
                onCheckedChange={() => toggleStatusFilter(status)}
                className="shrink-0 border-zinc-600 data-[state=checked]:border-violet-500 data-[state=checked]:bg-violet-500"
              />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Fixed Footer */}
    <DialogFooter className="shrink-0 flex-row items-center justify-between gap-3 border-t border-white/[0.06] bg-[#111116] px-5 py-4 sm:px-6">

      <Button
        type="button"
        variant="ghost"
        onClick={clearDraftFilters}
        disabled={draftFilterCount === 0}
        className="h-10 rounded-xl px-3 text-sm text-zinc-400 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Clear all
      </Button>

      <Button
        type="button"
        onClick={applyFilters}
        className="h-10 rounded-xl bg-violet-600 px-5 text-sm font-semibold text-white shadow-lg shadow-violet-600/20 transition hover:bg-violet-500"
      >
        Apply filters
        <Check className="ml-2 h-4 w-4" />
      </Button>

    </DialogFooter>
  </DialogContent>
</Dialog>
      </CardHeader>

      {/* Content */}
      <CardContent className="w-full min-w-0 max-w-full overflow-hidden border-t border-white/[0.05] p-0">
        {isLoading ? (
          renderLoading()
        ) : filteredSources.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {renderMobileCards()}
            {renderDesktopTable()}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default KnowledgeTable;
