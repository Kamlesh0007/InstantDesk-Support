import { db } from "@/db/client";
import {
  chatBotMetadata,
  conversation,
  knowledge_source,
  messages,
  sections,
} from "@/db/schema";
import { isAuthorized } from "@/lib/isAuthorized";
import { count, desc, eq, inArray } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // ----------------------------------------
    // Authenticate the current user
    // ----------------------------------------
    const user = await isAuthorized();

    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // ----------------------------------------
    // Fetch all chatbots created by the user
    // ----------------------------------------
    const bots = await db
      .select()
      .from(chatBotMetadata)
      .where(eq(chatBotMetadata.user_email, user.email));

    const botIds = bots.map((b) => b.id);

    // ----------------------------------------
    // Fetch knowledge source counts grouped
    // by their type (website, text, upload)
    // ----------------------------------------
    const ks = await db
      .select({
        type: knowledge_source.type,
        count: count(),
      })
      .from(knowledge_source)
      .where(eq(knowledge_source.user_email, user.email))
      .groupBy(knowledge_source.type);

    // Store aggregated knowledge statistics
    const knowledgeStats = {
      website: 0,
      upload: 0,
      text: 0,
      total: 0,
    };

    // Convert grouped database results into
    // a frontend-friendly statistics object
    ks.forEach((k) => {
      if (k.type === "website") {
        knowledgeStats.website += k.count;
      } else if (k.type === "text") {
        knowledgeStats.text += k.count;
      } else {
        knowledgeStats.upload += k.count;
      }

      knowledgeStats.total += k.count;
    });

    // ----------------------------------------
    // Fetch all AI sections configured
    // by the current user
    // ----------------------------------------
    const recentSections = await db
      .select()
      .from(sections)
      .where(eq(sections.user_email, user.email));

    // Prepare section data for dashboard display
    const sectionStats = {
      total: recentSections.length,
      list: recentSections.map((s) => ({
        name: s.name,
        sourceCount: s.source_ids.length,
        tone: s.tone,
      })),
    };

    // Get accurate total section count
    const [totalSections] = await db
      .select({ value: count() })
      .from(sections)
      .where(eq(sections.user_email, user.email));

    sectionStats.total = totalSections.value;

    // Dashboard recent conversations
    let recentChats: {
      title: string;
      snippet: string;
      time: string;
    }[] = [];

    let totalConversations = 0;

    // ----------------------------------------
    // Only fetch conversations if at least
    // one chatbot exists
    // ----------------------------------------
    if (botIds.length > 0) {
      // Fetch latest five conversations
      const rawConvs = await db
        .select()
        .from(conversation)
        .where(inArray(conversation.chatbot_id, botIds))
        .orderBy(desc(conversation.created_at))
        .limit(5);

      totalConversations = rawConvs.length;

      // Fetch the latest message for each conversation
      recentChats = await Promise.all(
        rawConvs.map(async (c) => {
          const [lastMsg] = await db
            .select()
            .from(messages)
            .where(eq(messages.conversation_id, c.id))
            .orderBy(desc(messages.created_at))
            .limit(1);

          // Format message timestamp into a
          // relative time (e.g. 5m ago, 2h ago)
          let timeDisplay = "";

          const ts = lastMsg?.created_at || c.created_at;

          if (ts) {
            const date = new Date(ts);
            const now = new Date();

            const diffMs = now.getTime() - date.getTime();
            const diffMins = Math.floor(diffMs / 60000);

            if (diffMins < 60) {
              timeDisplay = `${diffMins}m ago`;
            } else {
              timeDisplay = `${Math.floor(diffMins / 60)}h ago`;
            }
          }

          return {
            title: c.name || "Visitor Chat",
            snippet: lastMsg?.content || "No interactions yet",
            time: timeDisplay,
          };
        })
      );

      // If exactly five conversations were returned,
      // fetch the actual total conversation count
      // for dashboard statistics.
      if (totalConversations === 5) {
        const [t] = await db
          .select({ value: count() })
          .from(conversation)
          .where(inArray(conversation.chatbot_id, botIds));

        totalConversations = t.value;
      }
    }

    // ----------------------------------------
    // Return dashboard overview response
    // ----------------------------------------
    return NextResponse.json({
      botId: botIds[0] || null,
      knowledge: knowledgeStats,
      sections: sectionStats,
      chats: recentChats,
      counts: {
        knowledge: knowledgeStats.total,
        sections: sectionStats.total,
        conversations: totalConversations,
      },
    });
  } catch (error) {
    // Log unexpected server errors
    console.error("Dashboard Overview Error:", error);

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}