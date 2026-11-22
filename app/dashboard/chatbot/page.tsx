
"use client";

import React, { useEffect, useRef, useState } from "react";

import ApperanceConfig from "@/components/dashboard/chatbot/apperanceConfig";
import ChatSimulator from "@/components/dashboard/chatbot/chatSimulator";
import EmbedCodeConfig from "@/components/dashboard/chatbot/embedCodeConfig";
import ModeConfig from "@/components/dashboard/chatbot/modeConfig";

import {
  AlertCircle,
  Bot,
  MessageSquare,
  Sparkles,
} from "lucide-react";

interface ChatBotMetadata {
  id: string;
  user_email: string;
  color: string;
  welcome_message: string;
  mode: "text" | "voice" | "both";
  created_at: string;
  source_ids: string[];
}

const ChatbotPage = () => {
  const [metadata, setMetadata] = useState<ChatBotMetadata | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);

  // Knowledge source status
  const [totalSources, setTotalSources] = useState(0);
  const [activeSources, setActiveSources] = useState(0);

  // Chat states
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const scrollViewportRef = useRef<HTMLDivElement>(null);

  // Chatbot configuration
  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [mode, setMode] = useState<"text" | "voice" | "both">("text");
  const [isSaving, setIsSaving] = useState(false);

  const allDisconnected = totalSources > 0 && activeSources === 0;

  // Handle section selection
  const handleSectionClick = (sectionName: string) => {
    setActiveSection(sectionName);

    const userMsg = {
      role: "user",
      content: sectionName,
      section: null,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      const aiMsg = {
        role: "assistant",
        content: `You can ask me any question related to "${sectionName}"`,
        section: sectionName,
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  // Reset chat
  const handleReset = () => {
    setActiveSection(null);

    setMessages([
      {
        role: "assistant",
        content: welcomeMessage,
        isWelcome: true,
        section: null,
      },
    ]);
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const currentSection = sections.find(
      (section) => section.name === activeSection
    );

    const sourceIds = currentSection?.source_ids || [];

    const userMsg = {
      role: "user",
      content: input,
      section: activeSection,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chat/test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          knowledge_source_ids: sourceIds,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const data = await res.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.response,
          section: null,
        },
      ]);
    } catch (error) {
      console.error("Chat request failed:", error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Something went wrong. Please try again.",
          section: null,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Fetch chatbot metadata, sections and knowledge sources
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch chatbot metadata
        const metaRes = await fetch("/api/chatbot/metadata/fetch");

        if (!metaRes.ok) {
          throw new Error("Failed to fetch chatbot metadata");
        }

        const metaData = await metaRes.json();

        setMetadata(metaData);

        if (metaData) {
          setPrimaryColor(metaData.color || "#4f46e5");

          const initialWelcome =
            metaData.welcome_message || "Hi! How can I help you?";

          setWelcomeMessage(initialWelcome);

          setMode(metaData.mode ?? "text");

          setMessages([
            {
              role: "assistant",
              content: initialWelcome,
              isWelcome: true,
              section: null,
            },
          ]);
        }

        // Fetch sections
        const sectionsRes = await fetch("/api/section/fetch");

        if (sectionsRes.ok) {
          const sectionsData = await sectionsRes.json();
          setSections(sectionsData || []);
        }

        // Fetch knowledge sources
        const sourcesRes = await fetch("/api/knowledge/fetch");

        if (sourcesRes.ok) {
          const { sources } = await sourcesRes.json();

          const list: { status: string }[] = sources ?? [];

          setTotalSources(list.length);

          setActiveSources(
            list.filter((source) => source.status === "active").length
          );
        }
      } catch (error) {
        console.error("Error fetching chatbot data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Auto-scroll to latest message
  useEffect(() => {
    scrollViewportRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isTyping]);

  // Update welcome message in the initial assistant message
  useEffect(() => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.isWelcome
          ? {
              ...msg,
              content: welcomeMessage,
            }
          : msg
      )
    );
  }, [welcomeMessage]);

  // Check for unsaved changes
  const hasChanges = metadata
    ? primaryColor !== (metadata.color || "#4f46e5") ||
      welcomeMessage !==
        (metadata.welcome_message || "Hi! How can I help you?") ||
      mode !== (metadata.mode ?? "text")
    : false;

  // Save chatbot configuration
  const handleSave = async () => {
    setIsSaving(true);

    try {
      const res = await fetch("/api/chatbot/metadata/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color: primaryColor,
          welcome_message: welcomeMessage,
          mode,
        }),
      });

      if (res.ok) {
        const updated = await res.json();
        setMetadata(updated);
      } else {
        console.error("Failed to save changes");
      }
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Enter to send, Shift + Enter for new line
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Loading screen
  if (loading) {
    return (
      <div className="flex min-h-[60dvh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-500/20 bg-violet-500/10">
          <Bot className="h-6 w-6 text-violet-400" />
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-violet-400" />
          Loading chatbot configuration...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full min-w-0 max-w-[1600px] flex-col gap-6 overflow-x-clip px-4 py-5 sm:gap-7 sm:px-6 sm:py-7 lg:h-[calc(100dvh-64px)] lg:overflow-hidden lg:px-8">

      {/* PAGE HEADER */}
      <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-500/20 bg-violet-500/10 sm:h-11 sm:w-11">
            <Bot className="h-5 w-5 text-violet-400" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                Chatbot Playground
              </h1>

              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Playground
              </span>
            </div>

            <p className="mt-1 text-xs leading-relaxed text-zinc-400 sm:text-sm">
              Test your assistant, customize its appearance, and deploy it.
            </p>
          </div>
        </div>
      </div>

      {/* DISCONNECTED WARNING */}
      {allDisconnected && (
        <div className="flex shrink-0 items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-400">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

          <p className="min-w-0 leading-relaxed">
            All knowledge sources are disconnected. Your chatbot cannot
            answer questions until you reconnect at least one source in the
            Knowledge Base.
          </p>
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="grid w-full min-w-0 grid-cols-1 gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-12 lg:gap-6">

        {/* CHAT SIMULATOR */}
        <div
          className={`flex min-w-0 flex-col gap-3 lg:col-span-7 lg:min-h-0 ${
            allDisconnected ? "pointer-events-none opacity-50" : ""
          }`}
        >
          <div className="flex shrink-0 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
                <MessageSquare className="h-4 w-4 text-violet-400" />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-white">
                  Live Preview
                </h2>
                <p className="text-[11px] text-zinc-500">
                  Test your chatbot experience
                </p>
              </div>
            </div>

            <span className="hidden items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-2.5 py-1 text-[10px] text-zinc-400 sm:inline-flex">
              <Sparkles className="h-3 w-3 text-violet-400" />
              Interactive
            </span>
          </div>

          <div className="h-[min(72dvh,720px)] min-h-[480px] w-full min-w-0 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] shadow-xl shadow-black/10 sm:min-h-[560px] lg:h-full lg:min-h-0">
            <ChatSimulator
              messages={messages}
              primaryColor={primaryColor}
              sections={sections}
              input={input}
              setInput={setInput}
              handleSend={handleSend}
              handleKeyDown={handleKeyDown}
              handleSectionClick={handleSectionClick}
              activeSection={activeSection}
              isTyping={isTyping}
              handleReset={handleReset}
              scrollRef={scrollViewportRef}
            />
          </div>
        </div>

        {/* CONFIGURATION PANEL */}
        <div className="flex min-w-0 flex-col gap-5 lg:col-span-5 lg:min-h-0 lg:overflow-hidden">

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Sparkles className="h-4 w-4 text-violet-400" />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-white">
                Customize Chatbot
              </h2>

              <p className="text-[11px] text-zinc-500">
                Configure your chatbot settings
              </p>
            </div>
          </div>

          {/* Settings: natural page scroll on mobile, internal scroll on desktop */}
          <div className="min-w-0 space-y-5 pb-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto lg:overscroll-contain lg:pr-3">
            <ApperanceConfig
              primaryColor={primaryColor}
              setPrimaryColor={setPrimaryColor}
              welcomeMessage={welcomeMessage}
              setWelcomeMessage={setWelcomeMessage}
              handleSave={handleSave}
              isSaving={isSaving}
              hasChanges={hasChanges}
            />

            <ModeConfig
              mode={mode}
              setMode={setMode}
            />

            <EmbedCodeConfig chatbotId={metadata?.id} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
