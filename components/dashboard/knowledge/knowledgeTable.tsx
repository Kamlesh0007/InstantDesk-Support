
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
import { Label } from "@/components/ui/label";

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
  Database,
  File,
  Filter,
  Globe,
  Search,
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
          className="border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Active
        </Badge>
      );

    case "training":
      return (
        <Badge
          variant="outline"
          className="border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
          Training
        </Badge>
      );

    case "error":
      return (
        <Badge
          variant="outline"
          className="border-red-500/20 bg-red-500/10 text-red-400 shadow-none"
        >
          <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-red-400" />
          Error
        </Badge>
      );

    case "excluded":
      return (
        <Badge
          variant="outline"
          className="border-zinc-500/20 bg-zinc-500/10 text-zinc-400 shadow-none"
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
  const [typeFilters, setTypeFilters] = useState<SourceType[]>([]);
  const [statusFilters, setStatusFilters] = useState<SourceStatus[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // --------------------------------------------------
  // Filter Handlers
  // --------------------------------------------------

  const toggleTypeFilter = (type: SourceType) => {
    setTypeFilters((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const toggleStatusFilter = (status: SourceStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const activeFilterCount =
    typeFilters.length + statusFilters.length;

  const clearFilters = () => {
    setTypeFilters([]);
    setStatusFilters([]);
  };

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
    <div className="space-y-3 p-3 sm:p-5">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <Skeleton className="h-11 w-11 shrink-0 rounded-xl bg-white/[0.06]" />

          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-2/3 bg-white/[0.06]" />
            <Skeleton className="h-3 w-1/2 bg-white/[0.06]" />
          </div>

          <Skeleton className="h-6 w-16 rounded-full bg-white/[0.06]" />
        </div>
      ))}
    </div>
  );

  // --------------------------------------------------
  // Empty State
  // --------------------------------------------------

  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
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
          ? "Try changing your search query or filters to find what you're looking for."
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
    <div className="space-y-3 p-3 sm:p-4 md:hidden">
      {filteredSources.map((source) => (
        <div
          key={source.id}
          className="group relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#171721] via-[#111119] to-[#0b0b10] p-4 shadow-lg shadow-black/10 transition-all duration-200 active:scale-[0.99]"
        >
          {/* Top Highlight */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

          {/* Source Header */}
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/[0.08]">
              {getTypeIcon(source.type as SourceType)}
            </div>

            {/* Name and URL */}
            <div className="min-w-0 flex-1 pt-0.5">
              <h3 className="truncate text-sm font-semibold text-zinc-100">
                {source.name || "Untitled source"}
              </h3>

              <p className="mt-1 truncate text-xs text-zinc-500">
                {source.source_url || "Manually added content"}
              </p>
            </div>

            {/* Status */}
            <div className="shrink-0">
              {getStatusBadge(source.status as SourceStatus)}
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-white/[0.06]" />

          {/* Footer */}
          <div className="flex items-center justify-between gap-2">
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
    <div className="hidden overflow-x-auto md:block">
      <Table>
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
    <Card className="overflow-hidden rounded-2xl border-white/[0.07] bg-[#0A0A0E] shadow-xl shadow-black/10">
      {/* Header */}
      <CardHeader className="space-y-4 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/20 bg-indigo-500/10">
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
              className="border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
            >
              {activeFilterCount} filters
            </Badge>
          )}
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search your sources..."
              className="h-11 w-full rounded-xl border-white/[0.08] bg-white/[0.035] pl-10 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/40"
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsFilterOpen(true)}
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
          <DialogContent className="border-white/10 bg-[#0e0e12] sm:max-w-sm">
            <DialogHeader>
              <DialogTitle className="text-white">
                Filter sources
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Type Filters */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Source Type
                </p>

                <div className="space-y-3">
                  {ALL_TYPES.map((type) => (
                    <div
                      key={type}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        id={`type-${type}`}
                        checked={typeFilters.includes(type)}
                        onCheckedChange={() => toggleTypeFilter(type)}
                      />

                      <Label
                        htmlFor={`type-${type}`}
                        className="cursor-pointer font-normal capitalize text-zinc-300"
                      >
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-white/[0.06]" />

              {/* Status Filters */}
              <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Source Status
                </p>

                <div className="space-y-3">
                  {ALL_STATUSES.map((status) => (
                    <div
                      key={status}
                      className="flex items-center gap-3"
                    >
                      <Checkbox
                        id={`status-${status}`}
                        checked={statusFilters.includes(status)}
                        onCheckedChange={() =>
                          toggleStatusFilter(status)
                        }
                      />

                      <Label
                        htmlFor={`status-${status}`}
                        className="cursor-pointer font-normal capitalize text-zinc-300"
                      >
                        {status}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <DialogFooter className="flex-row justify-between gap-2 sm:justify-between">
              <Button
                variant="ghost"
                onClick={clearFilters}
                disabled={activeFilterCount === 0}
                className="text-zinc-400 hover:text-white"
              >
                Clear filters
              </Button>

              <Button
                onClick={() => setIsFilterOpen(false)}
                className="bg-white text-black hover:bg-zinc-200"
              >
                Apply filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      {/* Content */}
      <CardContent className="border-t border-white/[0.05] p-0">
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
