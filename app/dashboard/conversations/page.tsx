
"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Loader2,
  MessageSquare,
  Mic,
  MoreHorizontal,
  Search,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";

interface Conversation {
  id: string;
  user: string;
  lastMessage: string;
  time: string;
  email?: string;
  visitor_ip?: string;
  channel?: "text" | "voice";
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

const ConversationPage = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [replyContent, setReplyContent] = useState("");
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await fetch("/api/conversations");
        const data = await res.json();
        setConversations(data.conversations || []);
      } catch (error) {
        console.error("Failed to fetch conversations", error);
      } finally {
        setIsLoadingList(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    if (!selectedId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      setCurrentMessages([]);

      try {
        const res = await fetch(
          `/api/conversations/${selectedId}/messages`
        );
        const data = await res.json();
        setCurrentMessages(data.messages || []);
      } catch (error) {
        console.error("Failed to fetch messages", error);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages, isLoadingMessages]);

  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedId) return;

    setIsSending(true);

    try {
      const content = replyContent.trim();

      const res = await fetch(
        `/api/conversations/${selectedId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content }),
        }
      );

      if (res.ok) {
        const newMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content,
          created_at: new Date().toISOString(),
        };

        setCurrentMessages((prev) => [...prev, newMsg]);
        setReplyContent("");

        setConversations((prev) =>
          prev.map((c) =>
            c.id === selectedId
              ? { ...c, lastMessage: content, time: "Just now" }
              : c
          )
        );
      }
    } catch (error) {
      console.error("Failed to send reply", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.user?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedConv = conversations.find(
    (c) => c.id === selectedId
  );

  return (
    <div className="flex h-[calc(100dvh-64px)] min-h-0 w-full overflow-hidden bg-[#07070b] text-zinc-100">

      {/* Conversation Sidebar */}
      <aside
        className={cn(
          "w-full shrink-0 flex-col border-r border-white/[0.07] bg-[#09090e] md:flex md:w-[340px] lg:w-[380px]",
          selectedId ? "hidden" : "flex"
        )}
      >
        {/* Header */}
        <div className="border-b border-white/[0.07] p-4 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Inbox
              </h1>
              <p className="mt-1 text-xs text-zinc-500">
                Manage your customer conversations
              </p>
            </div>

            <div className="rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-300">
              {filteredConversations.length} conversations
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 rounded-xl border-white/[0.08] bg-white/[0.035] pl-10 text-sm text-white placeholder:text-zinc-600 focus-visible:ring-indigo-500/40"
            />
          </div>
        </div>

        {/* Conversation List */}
        <ScrollArea className="min-h-0 flex-1">
          <div className="space-y-1 p-2 sm:p-3">
            {isLoadingList ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-16 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.035]">
                  <MessageSquare className="h-5 w-5 text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-300">
                  No conversations found
                </p>
                <p className="mt-1 text-xs text-zinc-600">
                  Try searching with another keyword.
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const isSelected = selectedId === conversation.id;

                return (
                  <button
                    key={conversation.id}
                    onClick={() => setSelectedId(conversation.id)}
                    className={cn(
                      "group flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200",
                      isSelected
                        ? "border-indigo-500/20 bg-indigo-500/[0.09]"
                        : "border-transparent hover:border-white/[0.06] hover:bg-white/[0.035]"
                    )}
                  >
                    <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-zinc-700 to-zinc-900">
                      <User className="h-4 w-4 text-zinc-300" />
                      <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-[#09090e] bg-emerald-500" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm font-medium",
                            isSelected ? "text-white" : "text-zinc-300"
                          )}
                        >
                          {conversation.user}
                        </span>

                        <span className="shrink-0 text-[10px] text-zinc-500">
                          {conversation.time}
                        </span>
                      </div>

                      <div className="mt-1.5 flex items-center gap-1.5">
                        {conversation.channel === "voice" ? (
                          <Mic className="h-3 w-3 shrink-0 text-emerald-400" />
                        ) : (
                          <MessageSquare className="h-3 w-3 shrink-0 text-zinc-500" />
                        )}

                        <p className="truncate text-xs text-zinc-500">
                          {conversation.lastMessage}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Chat Panel */}
      <main
        className={cn(
          "min-w-0 flex-1 flex-col bg-[#08080c]",
          selectedId ? "flex" : "hidden md:flex"
        )}
      >
        {selectedConv ? (
          <>
            {/* Chat Header */}
            <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/[0.07] bg-[#0b0b10] px-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                {/* Mobile Back Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedId(null)}
                  className="h-9 w-9 shrink-0 text-zinc-400 hover:bg-white/[0.06] hover:text-white md:hidden"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-gradient-to-br from-indigo-500/20 to-indigo-900/30">
                  <User className="h-4 w-4 text-indigo-300" />
                </div>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-semibold text-white">
                    {selectedConv.user}
                  </h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] text-zinc-500">
                      Customer conversation
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {selectedConv.visitor_ip && (
                  <span className="hidden rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 text-[11px] text-zinc-500 lg:block">
                    {selectedConv.visitor_ip}
                  </span>
                )}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
                  aria-label="More conversation options"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </Button>
              </div>
            </header>

            {/* Messages */}
            <ScrollArea className="min-h-0 flex-1 px-3 py-5 sm:px-6 sm:py-8">
              {isLoadingMessages ? (
                <div className="flex h-full min-h-40 items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-indigo-400" />
                </div>
              ) : (
                <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
                  {currentMessages.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center text-center">
                      <MessageSquare className="mb-3 h-8 w-8 text-zinc-700" />
                      <p className="text-sm text-zinc-400">
                        No messages yet
                      </p>
                    </div>
                  ) : (
                    currentMessages.map((msg) => {
                      const isUser = msg.role === "user";

                      return (
                        <div
                          key={msg.id}
                          className={cn(
                            "flex w-full items-end gap-2.5 sm:gap-3",
                            isUser ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <div
                            className={cn(
                              "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/[0.08]",
                              isUser
                                ? "bg-zinc-800"
                                : "bg-indigo-600/20"
                            )}
                          >
                            {isUser ? (
                              <User className="h-4 w-4 text-zinc-400" />
                            ) : (
                              <Image
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=64&h=64&q=80&fit=crop"
                                alt="Support Agent"
                                fill
                                sizes="32px"
                                className="object-cover"
                              />
                            )}
                          </div>

                          <div
                            className={cn(
                              "flex min-w-0 max-w-[85%] flex-col gap-1.5 sm:max-w-[75%]",
                              isUser ? "items-end" : "items-start"
                            )}
                          >
                            <div
                              className={cn(
                                "rounded-2xl px-3.5 py-3 text-[13px] leading-6 break-words sm:px-4",
                                isUser
                                  ? "rounded-br-md bg-indigo-600 text-white shadow-lg shadow-indigo-950/20"
                                  : "rounded-bl-md border border-white/[0.07] bg-[#111116] text-zinc-300"
                              )}
                            >
                              {msg.content}
                            </div>

                            <span className="px-1 text-[10px] text-zinc-600">
                              {msg.created_at
                                ? new Date(msg.created_at).toLocaleTimeString(
                                    [],
                                    {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    }
                                  )
                                : ""}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}

                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>

            {/* Reply Composer */}
            <footer className="shrink-0 border-t border-white/[0.07] bg-[#0b0b10] p-3 sm:p-5">
              <div className="mx-auto flex w-full max-w-3xl items-center gap-2 rounded-2xl border border-white/[0.09] bg-[#111116] p-2 shadow-xl shadow-black/10 transition-colors focus-within:border-indigo-500/40">
                <Input
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Write a reply..."
                  disabled={isSending}
                  className="h-10 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-white shadow-none placeholder:text-zinc-600 focus-visible:ring-0"
                />

                <Button
                  onClick={handleSendReply}
                  disabled={!replyContent.trim() || isSending}
                  size="icon"
                  className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-950/30 hover:bg-indigo-500 disabled:opacity-40"
                  aria-label="Send reply"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>

              <p className="mx-auto mt-2 hidden max-w-3xl text-[10px] text-zinc-600 sm:block">
                Press Enter to send · Shift + Enter for a new line
              </p>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-3xl border border-indigo-500/15 bg-indigo-500/[0.07]">
              <MessageSquare className="h-7 w-7 text-indigo-400" />
            </div>

            <h2 className="text-base font-semibold text-zinc-200">
              Your inbox, all in one place
            </h2>

            <p className="mt-2 max-w-xs text-sm leading-6 text-zinc-500">
              Select a conversation from the sidebar to view messages and reply to your customers.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ConversationPage;
