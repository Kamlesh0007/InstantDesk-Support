import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getStatusBadge, getTypeIcon } from "./knowledgeTable";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2 } from "lucide-react";

interface SourceDetailsSheetProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedSource: KnowledgeSource | null;
  onUpdateStatus: (id: string, status: "active" | "excluded") => Promise<void>;
}


const SourceDetailsSheet = ({
  isOpen,
  setIsOpen,
  selectedSource,
  onUpdateStatus
}: SourceDetailsSheetProps) => {

    const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isExcluded = selectedSource?.status === "excluded";

  const handleOpenChange = (open: boolean) => {
    if (isLoading) return; // block dismiss while the request is running
    if (!open) setError(null);
    setIsOpen(open);
  };

  // Runs when "Disconnect Source" or "Reconnect Source" is clicked
  const handleDisconnect = async () => {
    if (!selectedSource) return;

    setIsLoading(true);
    setError(null);

    try {
      await onUpdateStatus(
        selectedSource.id,
        isExcluded ? "active" : "excluded"
      );
      setIsOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };


  if (!selectedSource) return null;
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-[#0A0A0E] p-0 shadow-2xl">
        <div className="h-full flex flex-col">
          <SheetHeader className="p-6 border-b border-white/5">
            <SheetTitle className="text-xl text-white flex items-center gap-2">
              {getTypeIcon(selectedSource.type as SourceType)}
              {selectedSource.name}
            </SheetTitle>
            <SheetDescription className="text-zinc-500">
              {selectedSource.source_url || "Manual entry"}
            </SheetDescription>
            <div className="pt-2 flex gap-2">
              {getStatusBadge(selectedSource.status as SourceStatus)}
              <span className="text-xs text-zinc-500 py-1 flex items-center">
                Updated{" "}
                {selectedSource.last_updated &&
                  new Date(selectedSource.last_updated).toLocaleDateString()}
              </span>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-zinc-300 uppercase tracking-wide">
                Content Preview
              </h4>
              <div className="p-4 rounded-lg border border-white/5 bg-black/40 font-mono text-xs text-zinc-400 h-72 overflow-y-auto leading-relaxed">
                {selectedSource.content ||
                  `# ${selectedSource.name}\n\n(No content preview available)`}
              </div>
            </div>
          </div>

   
            <SheetFooter className="p-6 border-t border-white/5 bg-[#050509] flex-col gap-3 sm:flex-col">
              {error && <p className="text-xs text-red-400">{error}</p>}

              {isExcluded ? (
                <Button
                  className="w-full bg-white text-black hover:bg-zinc-200"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Reconnecting..." : "Reconnect Source"}
                </Button>
              ) : (
                <Button
                  variant="destructive"
                  className="w-full bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20 border"
                  onClick={handleDisconnect}
                  disabled={isLoading}
                >
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {isLoading ? "Disconnecting..." : "Disconnect Source"}
                </Button>
              )}
            </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SourceDetailsSheet;