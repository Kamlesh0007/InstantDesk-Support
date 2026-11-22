
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import {
  Bot,
  RefreshCw,
  Send,
  User,
  MessageSquare,
} from "lucide-react";

import React, { RefObject } from "react";

interface ChatSimulatorProps {
  messages: any[];
  primaryColor: string;
  sections: Section[];
  input: string;
  setInput: (val: string) => void;
  handleSend: () => void;
  handleKeyDown: (e: React.KeyboardEvent) => void;
  handleSectionClick: (name: string) => void;
  activeSection: string | null;
  isTyping: boolean;
  handleReset: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}

const ChatSimulator = ({
  messages,
  primaryColor,
  sections,
  input,
  setInput,
  handleSend,
  handleKeyDown,
  handleSectionClick,
  activeSection,
  isTyping,
  handleReset,
  scrollRef,
}: ChatSimulatorProps) => {
  return (
    <Card className="relative flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0A0E] shadow-2xl">

      {/* HEADER - Always visible */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0E0E12] px-3 sm:px-5">

        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-emerald-500/15 bg-emerald-500/10">
            <Bot className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="min-w-0">
            <p className="truncate text-xs font-semibold text-white sm:text-sm">
              Test Environment
            </p>

            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <span className="text-[10px] text-zinc-500">
                Online
              </span>
            </div>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-9 shrink-0 rounded-lg px-2 text-xs text-zinc-400 hover:bg-white/[0.06] hover:text-white sm:px-3"
        >
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Reset
        </Button>
      </div>

      {/* CHAT MESSAGES - Independently scrollable */}
      <div className="relative min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain bg-zinc-950/30">

        <div className="flex min-h-full flex-col gap-5 px-3 py-4 sm:gap-6 sm:px-5 sm:py-6">

          {/* Messages */}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                "flex w-full min-w-0 flex-col",
                msg.role === "user" ? "items-end" : "items-start"
              )}
            >
              <div
                className={cn(
                  "flex w-full min-w-0 gap-2.5 sm:gap-3",
                  msg.role === "user"
                    ? "flex-row-reverse"
                    : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/5",
                    msg.role === "user" ? "bg-zinc-800" : "text-white"
                  )}
                  style={
                    msg.role !== "user"
                      ? { backgroundColor: primaryColor }
                      : {}
                  }
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-zinc-400" />
                  ) : (
                    <Bot className="h-4 w-4 text-white" />
                  )}
                </div>

                {/* Message Content */}
                <div className="flex min-w-0 max-w-[88%] flex-col gap-2 sm:max-w-[80%]">

                  <div
                    className={cn(
                      "min-w-0 break-words rounded-2xl px-3.5 py-3 text-sm leading-relaxed shadow-sm [overflow-wrap:anywhere] sm:px-4",
                      msg.role === "user"
                        ? "rounded-tr-sm bg-zinc-800 text-zinc-100"
                        : "rounded-tl-sm bg-white text-zinc-900"
                    )}
                  >
                    {msg.content}
                  </div>

                  {/* Section Selection */}
                  {msg.isWelcome && sections.length > 0 && (
                    <div className="ml-1 flex flex-wrap gap-2 pt-1">

                      <p className="w-full text-[11px] font-medium text-zinc-500">
                        Choose a topic to get started
                      </p>

                      {sections.map((section) => {
                        const isActive =
                          activeSection === section.name;

                        return (
                          <button
                            key={section.id}
                            type="button"
                            onClick={() =>
                              handleSectionClick(section.name)
                            }
                            className={cn(
                              "max-w-full rounded-full border px-3 py-2 text-left text-xs font-medium transition-all duration-200",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500",
                              isActive
                                ? "border-violet-500/40 bg-violet-500/15 text-violet-300"
                                : "border-white/10 bg-zinc-800/70 text-zinc-300 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white"
                            )}
                          >
                            {section.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex w-full min-w-0 justify-start">
              <div className="flex max-w-[85%] items-start gap-2.5 sm:gap-3">

                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot className="h-4 w-4 text-white" />
                </div>

                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm bg-white px-4 py-4 shadow-sm">
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-zinc-400" />
                </div>
              </div>
            </div>
          )}

          {/* Scroll Target */}
          <div ref={scrollRef} className="h-px shrink-0" />
        </div>
      </div>

      {/* INPUT AREA - Always visible at bottom */}
      <div className="relative z-10 shrink-0 border-t border-white/[0.08] bg-[#0A0A0E] p-3 sm:p-4">

        {activeSection && (
          <div className="mb-2 flex min-w-0 items-center gap-2">
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-violet-400" />

            <span className="truncate text-[11px] text-zinc-500">
              Asking about:
            </span>

            <span className="truncate text-[11px] font-medium text-violet-300">
              {activeSection}
            </span>
          </div>
        )}

        <div
          className={cn(
            "relative flex min-w-0 items-end gap-2 rounded-xl border p-1.5 transition-colors",
            activeSection
              ? "border-white/10 bg-zinc-900/80 focus-within:border-violet-500/40"
              : "border-white/[0.06] bg-zinc-900/40"
          )}
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!activeSection || isTyping}
            placeholder={
              activeSection
                ? "Type your question..."
                : "Select a topic above to start chatting..."
            }
            rows={1}
            className="min-h-[42px] max-h-28 min-w-0 flex-1 resize-none border-0 bg-transparent px-3 py-2.5 text-sm leading-relaxed text-white shadow-none outline-none placeholder:text-zinc-500 focus-visible:ring-0 disabled:cursor-not-allowed disabled:opacity-50"
          />

          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={!activeSection || !input.trim() || isTyping}
            aria-label="Send message"
            className={cn(
              "mb-0.5 h-9 w-9 shrink-0 rounded-lg transition-all",
              !activeSection || !input.trim() || isTyping
                ? "bg-zinc-800 text-zinc-500"
                : "text-white hover:opacity-90"
            )}
            style={
              activeSection && input.trim() && !isTyping
                ? { backgroundColor: primaryColor }
                : {}
            }
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <p className="mt-2 text-center text-[10px] text-zinc-600">
          Press Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </Card>
  );
};

export default ChatSimulator;
