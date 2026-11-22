
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Globe,
  Loader2,
  MoreHorizontal,
  Plus,
  Upload,
  MessageSquare,
  Sparkles,
  Layers,
} from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

const DashboardOverView = () => {
  const [data, setData] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const router = useRouter();

  useEffect(() => {
    setOrigin(window.location.origin);

    fetch("/api/overview")
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  }, []);

  const handleCopy = async () => {
    const code = `<script src="${origin}/widget.js" data-id="${data?.botId}"></script>`;

    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-96 flex items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { knowledge, sections, chats, counts } = data;

  const setupSteps = [
    { label: "Website Scanned", complete: true, href: "#" },
    {
      label: "Knowledge Added",
      complete: counts.knowledge > 0,
      href: "/dashboard/knowledge",
    },
    {
      label: "Sections Configured",
      complete: counts.sections > 0,
      href: "/dashboard/sections",
    },
    {
      label: "Widget Installed",
      complete: counts.conversations > 0,
      href: "#widget",
    },
  ];

  const knowledgeStats = [
    {
      label: "Pages",
      value: knowledge.website || 0,
      icon: Globe,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/10",
    },
    {
      label: "Texts",
      value: knowledge.text || 0,
      icon: FileText,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      border: "border-purple-500/10",
    },
    {
      label: "Uploads",
      value: knowledge.upload || 0,
      icon: Upload,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/10",
    },
  ];

  return (
    <div className="w-full min-w-0 max-w-7xl mx-auto p-3 sm:p-5 md:p-8 space-y-6 sm:space-y-8">

      {/* Dashboard Heading */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-indigo-400 font-medium tracking-wide uppercase">
              Overview
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1">
            Manage your AI support workspace.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs text-emerald-400 font-medium">
            Workspace Active
          </span>
        </div>
      </div>

      {/* Setup Progress */}
      <section className="space-y-3 sm:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-semibold text-white">
              Getting Started
            </h3>
            <p className="text-xs text-zinc-500 mt-1">
              Complete your workspace setup
            </p>
          </div>

          <Badge className="bg-indigo-500/10 text-indigo-400 border-indigo-500/20 text-[10px] sm:text-xs">
            {setupSteps.filter((step) => step.complete).length}/4 Completed
          </Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {setupSteps.map((step, i) => (
            <Link
              key={i}
              href={step.href}
              className="group min-w-0"
            >
              <div
                className={cn(
                  "relative overflow-hidden h-full rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all duration-300",
                  step.complete
                    ? "bg-gradient-to-br from-emerald-500/[0.08] to-[#0A0A0E] border-emerald-500/15"
                    : "bg-gradient-to-br from-indigo-500/[0.10] to-[#0A0A0E] border-indigo-500/20 hover:border-indigo-500/40"
                )}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] sm:text-xs text-zinc-500 font-medium">
                    STEP 0{i + 1}
                  </span>

                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center",
                      step.complete
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-indigo-500/10 text-indigo-400"
                    )}
                  >
                    {step.complete ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                </div>

                <p className="text-xs sm:text-sm font-medium text-zinc-200 leading-relaxed">
                  {step.label}
                </p>

                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      step.complete
                        ? "w-full bg-emerald-400"
                        : "w-1/3 bg-indigo-400"
                    )}
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8 min-w-0">

        {/* Left Content */}
        <div className="lg:col-span-2 space-y-5 sm:space-y-6 min-w-0">

          {/* Knowledge Base */}
          <Card className="relative overflow-hidden border-white/[0.07] bg-[#0A0A0E] rounded-2xl sm:rounded-3xl">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/[0.06] blur-3xl pointer-events-none" />

            <CardHeader className="relative flex flex-row items-center justify-between gap-3 px-4 pt-5 sm:px-6 sm:pt-6 pb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-indigo-400" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base font-semibold text-white">
                    Knowledge Base
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs mt-1">
                    Your AI knowledge sources
                  </CardDescription>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 sm:px-3 text-[10px] sm:text-xs border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white shrink-0"
                asChild
              >
                <Link href="/dashboard/knowledge">
                  Manage
                  <ArrowUpRight className="w-3 h-3 ml-1" />
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="relative grid grid-cols-3 gap-2 sm:gap-4 px-4 pb-5 sm:px-6 sm:pb-6">
              {knowledgeStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={cn(
                      "rounded-xl sm:rounded-2xl p-3 sm:p-4 border transition-all hover:-translate-y-1",
                      stat.bg,
                      stat.border
                    )}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center">
                        <Icon className={cn("w-4 h-4", stat.color)} />
                      </div>

                      <span className="text-[10px] sm:text-xs text-zinc-400 font-medium">
                        {stat.label}
                      </span>
                    </div>

                    <p className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                      {stat.value}
                    </p>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Sections */}
          <Card className="border-white/[0.07] bg-[#0A0A0E] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between gap-3 px-4 py-5 sm:px-6 sm:py-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/10 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5 text-purple-400" />
                </div>

                <div className="min-w-0">
                  <CardTitle className="text-sm sm:text-base text-white">
                    Sections
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs mt-1">
                    Configure AI behavior
                  </CardDescription>
                </div>
              </div>

              <Button
                size="sm"
                className="h-9 px-3 bg-white text-black hover:bg-zinc-200 text-xs shrink-0"
                asChild
              >
                <Link href="/dashboard/sections?createSection=true">
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Create
                </Link>
              </Button>
            </CardHeader>

            <CardContent className="p-0">
              {sections.list.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Layers className="w-5 h-5 text-zinc-500" />
                  </div>
                  <p className="text-sm text-zinc-400">
                    No sections configured yet.
                  </p>
                  <p className="text-xs text-zinc-600 mt-1">
                    Create your first section to get started.
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Section Cards */}
                  <div className="sm:hidden divide-y divide-white/5">
                    {sections.list.map((section: any, i: number) => (
                      <div
                        key={i}
                        className="px-4 py-4 flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/10 border border-white/5 flex items-center justify-center shrink-0">
                          <span className="text-sm font-semibold text-indigo-300">
                            {section.name?.charAt(0)?.toUpperCase() || "S"}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">
                            {section.name}
                          </p>

                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-zinc-500">
                              {section.sourceCount} sources
                            </span>

                            <span className="w-1 h-1 rounded-full bg-zinc-700" />

                            <Badge
                              variant="secondary"
                              className="h-5 bg-white/5 text-zinc-400 border-white/5 rounded-md text-[10px] font-normal"
                            >
                              {section.tone}
                            </Badge>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            router.push("/dashboard/sections")
                          }
                          className="w-9 h-9 shrink-0 text-zinc-500 hover:text-white hover:bg-white/5"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Sections Table */}
                  <div className="hidden sm:block">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-white/[0.02] text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                      <div className="col-span-5">Name</div>
                      <div className="col-span-3">Sources</div>
                      <div className="col-span-3">Tone</div>
                      <div className="col-span-1" />
                    </div>

                    {sections.list.map((section: any, i: number) => (
                      <div
                        key={i}
                        className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 items-center hover:bg-white/[0.02] transition-colors last:border-0 group"
                      >
                        <div className="col-span-5 text-sm font-medium text-zinc-200 truncate">
                          {section.name}
                        </div>

                        <div className="col-span-3 text-sm text-zinc-500">
                          {section.sourceCount} sources
                        </div>

                        <div className="col-span-3">
                          <Badge
                            variant="secondary"
                            className="bg-white/5 text-zinc-400 border-white/5 rounded-lg font-normal"
                          >
                            {section.tone}
                          </Badge>
                        </div>

                        <div className="col-span-1 flex justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              router.push("/dashboard/sections")
                            }
                            className="h-7 w-7 text-zinc-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5 sm:space-y-6 min-w-0">

          {/* Recent Chats */}
          <Card className="border-white/[0.07] bg-[#0A0A0E] rounded-2xl sm:rounded-3xl overflow-hidden">
            <CardHeader className="px-4 pt-5 sm:px-5 sm:pt-6 pb-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                  </div>

                  <CardTitle className="text-sm sm:text-base text-white">
                    Recent Chats
                  </CardTitle>
                </div>

                <Link
                  href="/dashboard/conversations"
                  className="text-[10px] sm:text-xs text-zinc-500 hover:text-white flex items-center gap-1"
                >
                  View all
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardHeader>

            <CardContent className="px-2 pb-3">
              {chats.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <MessageSquare className="w-5 h-5 text-zinc-500" />
                  </div>
                  <p className="text-xs text-zinc-500">
                    No chats yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {chats.map((chat: any, i: number) => (
                    <Link
                      key={i}
                      href="/dashboard/conversations"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 flex items-center justify-center shrink-0">
                        <span className="text-xs font-semibold text-indigo-300">
                          {chat.title?.charAt(0)?.toUpperCase() || "C"}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-xs sm:text-sm font-medium text-zinc-200 group-hover:text-white truncate">
                            {chat.title}
                          </p>

                          <span className="text-[9px] text-zinc-600 whitespace-nowrap shrink-0">
                            {chat.time}
                          </span>
                        </div>

                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                          {chat.snippet}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Install Widget */}
          <Card
            className="relative overflow-hidden border-indigo-500/15 bg-gradient-to-br from-indigo-500/[0.08] via-[#0A0A0E] to-[#0A0A0E] rounded-2xl sm:rounded-3xl"
            id="widget"
          >
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-indigo-500/10 blur-3xl pointer-events-none" />

            <CardHeader className="relative px-4 pt-5 sm:px-5 sm:pt-6 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/10 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                </div>

                <div>
                  <CardTitle className="text-sm sm:text-base text-white">
                    Install Widget
                  </CardTitle>
                  <CardDescription className="text-[10px] sm:text-xs mt-1">
                    Connect your website
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="relative px-4 pb-5 sm:px-5 sm:pb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-medium">
                  Installation code
                </span>

                <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>

              <div className="relative group">
                <pre className="bg-[#050509]/90 p-4 pr-12 rounded-xl text-[10px] sm:text-xs text-zinc-400 overflow-x-auto border border-white/[0.07] leading-relaxed">
                  <code className="font-mono whitespace-pre">
                    {`<script src="${origin}/widget.js"
  data-id="${data?.botId || "..."}"
  defer>
</script>`}
                  </code>
                </pre>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopy}
                  className={cn(
                    "absolute top-2 right-2 h-8 w-8 rounded-lg border transition-all",
                    copied
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10"
                  )}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <p className="text-[10px] text-zinc-500 mt-3 leading-relaxed">
                Copy the snippet and add it to your website to activate your AI support widget.
              </p>

              <Button
                onClick={handleCopy}
                className="w-full mt-4 h-10 rounded-xl bg-white text-black hover:bg-zinc-200 text-xs font-semibold"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied Successfully
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Installation Code
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverView;
