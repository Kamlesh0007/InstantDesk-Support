"use client";
import ApperanceConfig from '@/components/dashboard/chatbot/apperanceConfig';
import ChatSimulator from '@/components/dashboard/chatbot/chatSimulator';
import EmbedCodeConfig from '@/components/dashboard/chatbot/embedCodeConfig';
import ModeConfig from '@/components/dashboard/chatbot/modeConfig';
import { ScrollArea } from '@/components/ui/scroll-area';
import React, { useEffect, useRef, useState } from 'react'


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

  // Knowledge source status, used for the "all disconnected" warning
  const [totalSources, setTotalSources] = useState(0);
  const [activeSources, setActiveSources] = useState(0);

  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  const [primaryColor, setPrimaryColor] = useState("#4f46e5");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [mode, setMode] = useState<"text" | "voice" | "both">("text");
  const [isSaving, setIsSaving] = useState(false);

  const allDisconnected = totalSources > 0 && activeSources === 0;


 const handleSectionClick = async (sectionName: string) => {
    setActiveSection(sectionName);
    const userMsg = { role: "user", content: sectionName, section: null };
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
  const handleReset = async () => {
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
const handleSend = async () => {
    if (!input.trim()) return;

    const currentSection = sections.find((s) => s.name === activeSection);
    const sourceIds = currentSection?.source_ids || [];

    const userMsg = { role: "user", content: input, section: activeSection };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    const res = await fetch("/api/chat/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...messages, userMsg],
        knowledge_source_ids: sourceIds,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.response, section: null },
      ]);
      setIsTyping(false);
    }
  };


  // Runs only once when the component first mounts
// (because the dependency array is empty [])
useEffect(() => {
  // Async function to fetch all initial data
  const fetchData = async () => {
    try {
      // ============================
      // 1. Fetch chatbot metadata
      // ============================

      // Call the API that returns chatbot settings
      const metaRes = await fetch("/api/chatbot/metadata/fetch");

      // Convert the response into a JavaScript object
      const metaData = await metaRes.json();

      // Store the metadata in state
      setMetadata(metaData);

      // If metadata exists, initialize the UI
      if (metaData) {
        // Set chatbot theme color
        // If no color exists, use the default purple color
        setPrimaryColor(metaData.color || "#4f46e5");

        // Set the chatbot welcome message
        // If no message exists, use the default one
        setWelcomeMessage(
          metaData.welcome_message || "Hi! How can I help you?"
        );

        // Set chatbot mode
        // Can be "text", "voice", or "both"
        // If nothing exists, default to "text"
        setMode((metaData.mode as "text" | "voice" | "both") ?? "text");

        // Initialize the chat window with the welcome message
        // This creates the very first assistant message
        setMessages([
          {
            role: "assistant",
            content:
              metaData.welcome_message || "Hi! How can I help you?",
            isWelcome: true, // Indicates this is the initial greeting
            section: null,
          },
        ]);
      }

      // ============================
      // 2. Fetch chatbot sections
      // ============================

      // Fetch all chatbot sections/knowledge categories
      const sectionsRes = await fetch("/api/section/fetch");

      // Only continue if the request succeeded (status 200-299)
      if (sectionsRes.ok) {
        // Convert JSON response into JavaScript
        const sectionsData = await sectionsRes.json();

        // Store sections in state
        // If API returns null, store an empty array
        setSections(sectionsData || []);
      }
       // 3. Knowledge source status (for the disconnected warning)
        const sourcesRes = await fetch("/api/knowledge/fetch");
        if (sourcesRes.ok) {
          const { sources } = await sourcesRes.json();
          const list: { status: string }[] = sources ?? [];
          setTotalSources(list.length);
          setActiveSources(list.filter((s) => s.status === "active").length);
        }
    } catch (error) {
      // Runs if any fetch fails or throws an exception
      console.error("Error fetching data:", error);
    } finally {
      // This always runs whether success or failure
      // Hide the loading spinner
      setLoading(false);
    }
  };

  // Call the async function
  fetchData();

// Empty dependency array means:
// Run only once after the first render (ComponentDidMount)
}, []);

  // Automatically scroll to the latest message
// whenever a new message is added
// or the typing indicator appears/disappears
useEffect(() => {
  // Ensure the element exists before scrolling
  if (scrollViewportRef.current) {
    // Scroll smoothly to the bottom
    scrollViewportRef.current.scrollIntoView({
      behavior: "smooth",
    });
  }

  

// Run whenever messages change
// or the typing indicator changes
}, [messages, isTyping]);

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

 const hasChanges = metadata
    ? primaryColor !== (metadata.color || "#4f46e5") ||
      welcomeMessage !== (metadata.welcome_message || "Hi! How can I help you?") ||
      mode !== (metadata.mode ?? "text")
    : false;

const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/chatbot/metadata/update", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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

 const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

   if (loading) {
    return (
      <div className="p-8 text-zinc-500">Loading chatbot configuration...</div>
    );
  }

  return (
     <div className="p-6 md:p-8 space-y-8 max-w-400 mx-auto animate-in fade-in duration-500 h-[calc(100vh-64px)] overflow-hidden flex flex-col">
      <div className="flex justify-between items-center shrink-0">
        <div>
          <h1 className="text-2xl font-semibold text-white tracking-tight">
            Chatbot Playground
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Test your assistant, customize appearance, and deploy it.
          </p>
        </div>
      </div>

    {allDisconnected && (
        <div className="shrink-0 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-500">
          All knowledge sources are disconnected, so your chatbot can't answer
          questions. Reconnect at least one in the Knowledge Base.
        </div>
      )}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full min-h-0">
        <div   className={`lg:col-span-7 flex flex-col h-full min-h-0 space-y-4 ${
    allDisconnected ? "pointer-events-none opacity-50" : ""
  }`}>
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

        <div className="lg:col-span-5 h-full min-h-0 overflow-hidden flex flex-col">
          <ScrollArea className="h-full pr-4">
            <div className="space-y-6 pb-8">
              <ApperanceConfig
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                welcomeMessage={welcomeMessage}
                setWelcomeMessage={setWelcomeMessage}
                handleSave={handleSave}
                isSaving={isSaving}
                hasChanges={hasChanges}
              />
              <ModeConfig mode={mode} setMode={setMode} />
              <EmbedCodeConfig chatbotId={metadata?.id} />
            </div>
          </ScrollArea>
        </div>
      </div>
      </div>
  )
}

export default ChatbotPage