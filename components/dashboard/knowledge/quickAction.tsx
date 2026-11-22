
import { Button } from "@/components/ui/button";
import { File, Globe, Upload, ArrowUpRight } from "lucide-react";

const QuickActions = ({
  onOpenModal,
}: {
  onOpenModal: (tab: string) => void;
}) => {
  const actions = [
    {
      title: "Add Website",
      description: "Crawl your website and sync its content automatically.",
      tab: "website",
      icon: Globe,
      color: "indigo",
    },
    {
      title: "Upload File",
      description: "Import CSV files and documents into your knowledge base.",
      tab: "upload",
      icon: Upload,
      color: "emerald",
    },
    {
      title: "Manual Text",
      description: "Add FAQs, internal notes, and policies manually.",
      tab: "text",
      icon: File,
      color: "zinc",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
      {actions.map((action) => {
        const Icon = action.icon;

        return (
          <Button
            key={action.tab}
            variant="outline"
            onClick={() => onOpenModal(action.tab)}
            className="group h-auto min-h-[108px] w-full justify-start whitespace-normal rounded-2xl border border-white/[0.07] bg-[#0A0A0E] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-indigo-500/30 hover:bg-white/[0.035] hover:text-white sm:p-5"
          >
            <div className="flex w-full items-center gap-4">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
                  action.color === "indigo"
                    ? "border-indigo-500/20 bg-indigo-500/10 text-indigo-400"
                    : action.color === "emerald"
                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400"
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-white">
                    {action.title}
                  </span>

                  <ArrowUpRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:text-white" />
                </div>

                <p className="mt-1 text-xs font-normal leading-relaxed text-zinc-500">
                  {action.description}
                </p>
              </div>
            </div>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;
