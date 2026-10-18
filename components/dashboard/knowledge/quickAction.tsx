import { Button } from "@/components/ui/button";
import { File, Globe, Upload } from "lucide-react";

// Displays quick actions that allow users to add
// different knowledge sources to train the AI assistant.
const QuickActions = ({
  onOpenModal,
}: {
  // Callback received from the parent component.
  // Opens the corresponding modal based on the selected action.
  onOpenModal: (tab: string) => void;
}) => {
  return (
    // Responsive grid.
    // 1 column on mobile, 3 columns on desktop.
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

      {/* ---------------- Website Source ---------------- */}
      <Button
        variant="outline"
        className="h-auto py-8 px-6 flex flex-col items-center justify-center gap-4 border-white/5 bg-[#0A0A0E] hover:bg-white/2 hover:border-indigo-500/30 transition-all hover:text-white group whitespace-normal"
        onClick={() => onOpenModal("website")}
      >
        {/* Icon */}
        <div className="p-3 rounded-full bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors">
          <Globe className="w-6 h-6 text-indigo-400" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Add Website
          </span>

          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Crawl your website or specific pages to automatically keep your
            knowledge base in sync.
          </p>
        </div>
      </Button>

      {/* ---------------- File Upload ---------------- */}
      <Button
        variant="outline"
        className="h-auto py-8 px-6 flex flex-col items-center justify-center gap-4 border-white/5 bg-[#0A0A0E] hover:bg-white/2 hover:border-emerald-500/30 transition-all hover:text-white group whitespace-normal"
        onClick={() => onOpenModal("upload")}
      >
        {/* Icon */}
        <div className="p-3 rounded-full bg-emerald-500/10 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
          <Upload className="w-6 h-6 text-emerald-400" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Upload File
          </span>

          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Upload CSV files to instantly train your assistant with existing
            documents.
          </p>
        </div>
      </Button>

      {/* ---------------- Manual Text ---------------- */}
      <Button
        variant="outline"
        className="h-auto py-8 px-6 flex flex-col items-center justify-center gap-4 border-white/5 bg-[#0A0A0E] hover:bg-white/2 hover:border-zinc-500/30 transition-all hover:text-white group whitespace-normal"
        onClick={() => onOpenModal("text")}
      >
        {/* Icon */}
        <div className="p-3 rounded-full bg-zinc-500/10 border border-zinc-500/20 group-hover:bg-zinc-500/20 transition-colors">
          <File className="w-6 h-6 text-zinc-400" />
        </div>

        {/* Title & Description */}
        <div className="space-y-1.5 text-center w-full">
          <span className="text-sm font-medium block whitespace-normal">
            Manual Text
          </span>

          <p className="text-xs text-zinc-500 font-normal leading-relaxed whitespace-normal wrap-break-word">
            Manually copy-paste FAQs, internal notes, or policies directly into
            the editor for quick updates.
          </p>
        </div>
      </Button>
    </div>
  );
};

export default QuickActions;