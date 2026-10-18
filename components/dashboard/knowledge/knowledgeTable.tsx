import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { File, Filter, Globe, Search, Upload } from "lucide-react";

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

export const getTypeIcon = (type: SourceType) => {
  switch (type) {
    case "website":
      return <Globe className="w-4 h-4 text-blue-400" />;
    case "upload":
      return <Upload className="w-4 h-4 text-emerald-400" />;
    case "text":
      return <File className="w-4 h-4 text-zinc-400" />;
  }
};

export const getStatusBadge = (status: SourceStatus) => {
  switch (status) {
    case "active":
      return (
        <Badge
          variant="default"
          className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none"
        >
          Active
        </Badge>
      );
    case "training":
      return (
        <Badge
          variant="secondary"
          className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20 shadow-none"
        >
          Training
        </Badge>
      );
    case "error":
      return (
        <Badge
          variant="destructive"
          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 shadow-none"
        >
          Error
        </Badge>
      );
    case "excluded":
      return (
        <Badge
          variant="secondary"
          className="bg-zinc-500/10 text-zinc-500 hover:bg-zinc-500/20 border-zinc-500/20 shadow-none"
        >
          Excluded
        </Badge>
      );
    default:
      return <Badge variant="outline">Unknown</Badge>;
  }
};

const KnowledgeTable = ({
  sources,
  onSourceClick,
  isLoading,
}: KnowledgeTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilters, setTypeFilters] = useState<SourceType[]>([]);
  const [statusFilters, setStatusFilters] = useState<SourceStatus[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const toggleTypeFilter = (type: SourceType) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleStatusFilter = (status: SourceStatus) => {
    setStatusFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const activeFilterCount = typeFilters.length + statusFilters.length;

  const clearFilters = () => {
    setTypeFilters([]);
    setStatusFilters([]);
  };

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

  return (
    <Card className="border-white/5 bg-[#0a0a0e]">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-white">
            Sources
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
           <Input
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  className="h-9 w-50 border-white/10 bg-white/5 pl-9 text-sm text-white placeholder:text-zinc-500 md:w-75"
  placeholder="Search sources..."
/>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFilterOpen(true)}
              className="relative text-zinc-400 hover:text-white hover:bg-white/5"
            >
              <Filter className="w-4 h-4" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[10px] font-medium text-black">
                  {activeFilterCount}
                </span>
              )}
            </Button>

            <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <DialogContent className="bg-[#0e0e12] border-white/10 sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle className="text-white">
                    Filter sources
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                  <div className="space-y-3">
                    <p className="text-xs uppercase text-zinc-500">Type</p>
                    <div className="space-y-2">
                      {ALL_TYPES.map((type) => (
                        <div key={type} className="flex items-center gap-2">
                          <Checkbox
                            id={`type-${type}`}
                            checked={typeFilters.includes(type)}
                            onCheckedChange={() => toggleTypeFilter(type)}
                          />
                          <Label
                            htmlFor={`type-${type}`}
                            className="capitalize text-zinc-300 font-normal"
                          >
                            {type}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-xs uppercase text-zinc-500">Status</p>
                    <div className="space-y-2">
                      {ALL_STATUSES.map((status) => (
                        <div key={status} className="flex items-center gap-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={statusFilters.includes(status)}
                            onCheckedChange={() => toggleStatusFilter(status)}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="capitalize text-zinc-300 font-normal"
                          >
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter className="flex-row justify-between sm:justify-between">
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
                    Apply
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="border-white/5 hover:bg-transparent">
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Name
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Type
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Status
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Last Updated
              </TableHead>
              <TableHead className="text-xs uppercase font-medium text-zinc-500">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="border-white/5">
                  <TableCell className="hover:bg-white/5">
                    <Skeleton className="h-5 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 bg-white/5" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-32 bg-white/5" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredSources.length > 0 ? (
              filteredSources.map((source, index) => (
                <TableRow
                  key={index}
                  className="border-white/5 hover:bg-white/2 cursor-pointer group transition-colors"
                  onClick={() => onSourceClick(source)}
                >
                  <TableCell className="font-medium text-zinc-200 group-hover:text-white">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(source.type as SourceType)}
                      <div className="flex flex-col">
                        <span>{source.name}</span>
                        {source.source_url && (
                          <span className="text-xs text-zinc-500 font-normal">
                            {source.source_url}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="capitalize text-zinc-400">
                    {source.type}
                  </TableCell>
                  <TableCell className="capitalize text-zinc-400">
                    {getStatusBadge(source.status as SourceStatus)}
                  </TableCell>
                  <TableCell className="capitalize text-zinc-400">
                    {source.last_updated &&
                      new Date(source.last_updated).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 text-zinc-400 hover:text-white hover:bg-white/2"
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-500"
                >
                  {sources.length > 0
                    ? "No sources match your search or filters."
                    : "No knowledge sources added yet."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default KnowledgeTable;