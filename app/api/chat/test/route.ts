// Database
import { db } from "@/db/client";
import { knowledge_source } from "@/db/schema";
import { and, eq, inArray } from "drizzle-orm";

// Authentication
import { isAuthorized } from "@/lib/isAuthorized";

// Token counting
import { countConversationTokens } from "@/lib/countConversationTokens";

// Groq helper
import { summarizeConversation } from "@/lib/openAi";

// Next.js response
import { NextResponse } from "next/server";

// IMPORTANT:
// Import the Groq client.
// Change this import path depending on where you keep your Groq client.
import { groq } from "@/lib/openAi";



// -----------------------------------------------------------------------------
// POST API
// -----------------------------------------------------------------------------
const NO_INFO_REPLY =
  "I don't have any information to answer that right now. Please contact the team directly.";
export async function POST(req: Request) {

  // ---------------------------------------------------------------------------
  // 1. CHECK USER AUTHENTICATION
  // ---------------------------------------------------------------------------

  // Check whether the user is logged in
  const user = await isAuthorized();

  // If user is not logged in, stop here
  if (!user) {
    return NextResponse.json(
      {
        error: "Unauthorized",
      },
      {
        status: 401,
      }
    );
  }


  // ---------------------------------------------------------------------------
  // 2. GET DATA FROM FRONTEND
  // ---------------------------------------------------------------------------

  // Read the request body
  //
  // Example:
  //
  // {
  //   messages: [
  //     {
  //       role: "user",
  //       content: "What is your return policy?"
  //     }
  //   ],
  //
  //   knowledge_source_ids: ["abc", "xyz"]
  // }
  const body = await req.json();

  let {
    messages,
    knowledge_source_ids,
  } = body;


  // ---------------------------------------------------------------------------
  // 3. GET LAST USER MESSAGE
  // ---------------------------------------------------------------------------

  // Get the last message from the conversation
  const lastMessage = messages[messages.length - 1];


  // ---------------------------------------------------------------------------
  // 4. GET KNOWLEDGE FROM DATABASE
  // ---------------------------------------------------------------------------

  // Start with an empty context
  let context = "";

  // This will tell us whether we actually found knowledge
  let hasKnowledge = false;


  // Only search the database if knowledge_source_ids exists
  // and contains at least one ID.
  if (
    knowledge_source_ids &&
    knowledge_source_ids.length > 0
  ) {

    // Get the selected knowledge sources from the database
    const sources = await db
      .select({
        content: knowledge_source.content,
      })
      .from(knowledge_source)
      .where(
           and(
          eq(knowledge_source.user_email, user.email),
          eq(knowledge_source.status, "active"),
          Array.isArray(knowledge_source_ids) && knowledge_source_ids.length > 0
            ? inArray(knowledge_source.id, knowledge_source_ids)
            : undefined
        )
      );

      // Everything excluded (or the section's sources are all excluded):
    // return a fixed reply and skip the model call.
    if (sources.length === 0) {
      return NextResponse.json({ response: NO_INFO_REPLY });
    }



    // Check whether we actually received content
    hasKnowledge = sources.some(
      (source) => Boolean(source.content)
    );


    // Convert all source content into one string
    //
    // Example:
    //
    // Source 1 content
    //
    // Source 2 content
    //
    // Source 3 content
    //
    context = sources
      .map((source) => source.content)
      .filter(Boolean)
      .join("\n\n");
  }


  // ---------------------------------------------------------------------------
  // 5. COUNT CONVERSATION TOKENS
  // ---------------------------------------------------------------------------

  // Count how many tokens the current conversation uses
  const tokenCount = countConversationTokens(messages);


  // ---------------------------------------------------------------------------
  // 6. SUMMARIZE OLD CONVERSATION IF TOO LARGE
  // ---------------------------------------------------------------------------

  if (tokenCount > 6000) {

    // Keep the last 10 messages
    //
    // These are the most recent messages,
    // so they are usually the most important.
    const recentMessages = messages.slice(-10);


    // Get all messages before the last 10
    const olderMessages = messages.slice(0, -10);


    // Only summarize if old messages actually exist
    if (olderMessages.length > 0) {

      // Send old messages to Groq
      //
      // Your summarizeConversation() function
      // uses Groq internally.
      const summary = await summarizeConversation(
        olderMessages
      );


      // Add the conversation summary before
      // the knowledge-base context.
      context =
        `PREVIOUS CONVERSATION SUMMARY:\n${summary}\n\n` +
        context;


      // Replace the full conversation
      // with only the recent messages.
      messages = recentMessages;
    }
  }


  // ---------------------------------------------------------------------------
  // 7. HANDLE EMPTY KNOWLEDGE BASE
  // ---------------------------------------------------------------------------

  // If no knowledge was found,
  // tell Sarah not to guess.
  const emptyContextNote = !hasKnowledge
    ? `
IMPORTANT:
No relevant information was found in the knowledge base for this question.

Do not guess the answer.

Tell the user that you don't have that information
and offer to create a support ticket.
`
    : "";


  // ---------------------------------------------------------------------------
  // 8. CREATE SYSTEM PROMPT
  // ---------------------------------------------------------------------------

  const systemPrompt = `
Your name is Sarah.
You are a friendly, human-like customer support specialist.

CRITICAL RULES:

- If asked for your name, always respond with "I'm Sarah".
- If asked for your role, always respond with "I'm a customer support specialist".
- Keep answers EXTREMELY SHORT.
- Maximum 1-2 sentences.
- Be conversational.
- Mirror the user's brevity.
- Do not dump large amounts of information.
- If the user asks a broad question, ask a friendly clarifying question.

GROUNDING:

- Answer ONLY using the context provided below.
- Never use general knowledge.
- Never guess.
- If the answer is not present in the context, say you don't have that information.
- When you state a fact from the context, add the source number in square brackets.

Example:

"Returns are accepted within 30 days [1]."

${emptyContextNote}

ESCALATION PROTOCOL:

- If you don't know the answer from the context,
  ask:

"Would you like me to create a support ticket for our specialist team?"

- If the user says yes or gives permission to create a ticket,
  respond EXACTLY with:

"[ESCALATED] I have created a support ticket. Our specialist team will review this conversation and contact you shortly."

CONTEXT:

${context}
`;


  // ---------------------------------------------------------------------------
  // 9. CALL GROQ
  // ---------------------------------------------------------------------------

  try {

    // Send the request to Groq
    //
    // Groq uses the OpenAI-compatible chat completion API,
    // so the syntax looks almost identical to OpenAI.
    const completion = await groq.chat.completions.create(
      {
        // Your Groq model
        model: "openai/gpt-oss-120b",

        // System instructions
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },

          // Add the conversation
          ...messages.map((message: {
            role: string;
            content: string;
          }) => ({
            role: message.role as
              | "user"
              | "assistant"
              | "system",

            content: message.content,
          })),
        ],

        // Controls creativity
        temperature: 0.7,

        // Maximum output tokens
        max_completion_tokens: 200,
      },

      // Request timeout
      {
        timeout: 30000,
      }
    );


    // -------------------------------------------------------------------------
    // 10. GET GROQ RESPONSE
    // -------------------------------------------------------------------------

    // Get the generated answer
    const reply =
      completion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't generate a response.";


    // -------------------------------------------------------------------------
    // 11. SEND RESPONSE TO FRONTEND
    // -------------------------------------------------------------------------

    return NextResponse.json({
      response: reply,
    });


  } catch (error) {

    // Print Groq error in the server console
    console.error("Groq Error:", error);


    // Send error to frontend
    return NextResponse.json(
      {
        response:
          "An error occurred while processing your request.",
      },
      {
        status: 500,
      }
    );
  }
}