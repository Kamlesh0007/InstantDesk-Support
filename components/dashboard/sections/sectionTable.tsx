
import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { getStatusBadge, getToneBadge } from "./sectionBadges";
import { Button } from "@/components/ui/button";

import {
  Database,
  ShieldAlert,
  Eye,
  Layers3,
  ChevronRight,
} from "lucide-react";

interface SectionTableProps {
  sections: Section[];
  isLoading: boolean;
  onPreview: (section: Section) => void;
  onCreateSection: () => void;
}

const SectionsTable = ({
  sections,
  isLoading,
  onPreview,
  onCreateSection,
}: SectionTableProps) => {
  // Loading state
  if (isLoading) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />
        <p className="text-sm text-zinc-400">Loading sections...</p>
      </div>
    );
  }

  // Empty state
  if (!sections || sections.length === 0) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-5 py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
          <ShieldAlert className="h-7 w-7 text-zinc-500" />
        </div>

        <h3 className="text-base font-semibold text-white">
          No sections yet
        </h3>

        <p className="mt-2 max-w-xs text-sm leading-relaxed text-zinc-500">
          Create your first section to define how your AI assistant handles
          different topics.
        </p>

        <Button
          onClick={onCreateSection}
          className="mt-5 h-10 rounded-xl bg-white px-5 text-black hover:bg-zinc-200"
        >
          <Layers3 className="mr-2 h-4 w-4" />
          Create your first section
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0">

      {/* DESKTOP TABLE */}
      <div className="hidden w-full overflow-x-auto md:block">
        <Table>
          <TableHeader>
            <TableRow className="border-white/[0.06] hover:bg-transparent">
              <TableHead className="h-12 whitespace-nowrap pl-6 text-xs font-medium uppercase tracking-wider text-zinc-500">
                Name
              </TableHead>

              <TableHead className="h-12 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-zinc-500">
                Sources
              </TableHead>

              <TableHead className="h-12 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-zinc-500">
                Tone
              </TableHead>

              <TableHead className="h-12 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-zinc-500">
                Scope
              </TableHead>

              <TableHead className="h-12 whitespace-nowrap text-xs font-medium uppercase tracking-wider text-zinc-500">
                Status
              </TableHead>

              <TableHead className="h-12 whitespace-nowrap pr-6 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {sections.map((section) => (
              <TableRow
                key={section.id}
                className="group border-white/[0.06] transition-colors hover:bg-white/[0.025]"
              >
                <TableCell className="max-w-[220px] py-4 pl-6">
                  <div className="truncate font-medium text-zinc-200">
                    {section.name}
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  <div className="inline-flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5">
                    <Database className="h-3.5 w-3.5 text-violet-400" />

                    <span className="text-sm font-medium text-white">
                      {section.sourceCount}
                    </span>

                    <span className="text-xs text-zinc-500">
                      {section.sourceCount === 1 ? "Source" : "Sources"}
                    </span>
                  </div>
                </TableCell>

                <TableCell className="py-4">
                  {getToneBadge(section.tone)}
                </TableCell>

                <TableCell className="max-w-[180px] py-4">
                  <span className="block truncate text-sm text-zinc-400">
                    {section.scopeLabel}
                  </span>
                </TableCell>

                <TableCell className="py-4">
                  {getStatusBadge(section.status)}
                </TableCell>

                <TableCell className="py-4 pr-6 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 rounded-lg text-zinc-400 transition hover:bg-white/[0.06] hover:text-white"
                    onClick={() => onPreview(section)}
                  >
                    <Eye className="mr-2 h-3.5 w-3.5" />
                    Preview
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE CARDS */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-3 p-3 md:hidden">
        {sections.map((section) => (
          <div
            key={section.id}
            className="min-w-0 overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.025] p-4 transition-colors active:bg-white/[0.045]"
          >
            {/* Card Header */}
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/15 bg-violet-500/10">
                  <Layers3 className="h-4 w-4 text-violet-400" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-semibold leading-5 text-white">
                    {section.name}
                  </h3>

                  <p className="mt-1 line-clamp-2 break-words text-xs leading-relaxed text-zinc-500">
                    {section.scopeLabel || "General"}
                  </p>
                </div>
              </div>

              <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-zinc-600" />
            </div>

            {/* Card Details */}
            <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/[0.06] pt-4">

              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Sources
                </p>

                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 shrink-0 text-violet-400" />

                  <span className="text-sm font-medium text-zinc-200">
                    {section.sourceCount}{" "}
                    <span className="font-normal text-zinc-500">
                      {section.sourceCount === 1 ? "Source" : "Sources"}
                    </span>
                  </span>
                </div>
              </div>

              <div className="min-w-0 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Tone
                </p>

                <div className="flex min-w-0 flex-wrap">
                  {getToneBadge(section.tone)}
                </div>
              </div>

              <div className="col-span-2 min-w-0 space-y-2">
                <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                  Status
                </p>

                <div className="flex flex-wrap">
                  {getStatusBadge(section.status)}
                </div>
              </div>
            </div>

            {/* Card Action */}
            <div className="mt-4 border-t border-white/[0.06] pt-3">
              <Button
                variant="ghost"
                className="h-10 w-full justify-between rounded-lg bg-white/[0.035] px-3 text-sm text-zinc-300 hover:bg-white/[0.08] hover:text-white"
                onClick={() => onPreview(section)}
              >
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Section
                </span>

                <ChevronRight className="h-4 w-4 text-zinc-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SectionsTable;
