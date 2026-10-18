
import OpenAI from "openai";

export const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY!,
  baseURL: "https://api.groq.com/openai/v1",
});

const MODEL_NAME = "openai/gpt-oss-120b";

const MAX_RETRIES = 2;
const BASE_DELAY = 1000;
const TIMEOUT = 30000;

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: any) {
  const status = error?.status ?? error?.response?.status;

  return [429, 500, 502, 503, 504].includes(status);
}

async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  let lastError: any;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;

      console.error(
        `Groq request failed (Attempt ${attempt}/${retries})`,
        error?.status,
        error?.message
      );

      if (!isRetryable(error) || attempt === retries) {
        break;
      }

      const delay = BASE_DELAY * Math.pow(2, attempt - 1);

      console.log(`Retrying in ${delay} ms...`);

      await sleep(delay);
    }
  }

  throw lastError;
}

// -----------------------------------------------------------------------------
// summarizeMarkdown
// -----------------------------------------------------------------------------

export async function summarizeMarkdown(markdown: string): Promise<string> {
  return withRetry(async () => {
    const completion = await groq.chat.completions.create(
      {
        model: MODEL_NAME,

        temperature: 0.1,

        max_completion_tokens: 900,

        messages: [
          {
            role: "system",
            content: `
You are a data summarization engine for an AI chatbot.

Your task:

Convert website markdown, plain text, or CSV data into a clean, dense summary
optimized for long-term RAG storage.

STRICT RULES

- Output ONLY plain text.
- No markdown.
- No headings.
- No bullet points.
- Write as one continuous paragraph.
- Remove navigation.
- Remove menus.
- Remove buttons.
- Remove pricing.
- Remove testimonials.
- Remove advertisements.
- Remove UI labels.
- Remove marketing language.
- Remove repetition.
- Preserve only factual information useful for answering customer questions.
- Rewrite instead of copying.
- Keep the output under 2000 words.
`,
          },
          {
            role: "user",
            content: markdown,
          },
        ],
      },
      {
        timeout: TIMEOUT,
      }
    );

    return completion.choices[0].message.content?.trim() ?? "";
  });
}

// -----------------------------------------------------------------------------
// summarizeConversation
// -----------------------------------------------------------------------------

export async function summarizeConversation(
  messages: { role: string; content: string }[]
): Promise<string> {
  return withRetry(async () => {
    const completion = await groq.chat.completions.create(
      {
        model: MODEL_NAME,

        temperature: 0.3,

        max_completion_tokens: 500,

        messages: [
          {
            role: "system",
            content:
              "Summarize the following conversation into one concise paragraph while preserving user intent, decisions, context, and important information. Keep the summary under 2000 words.",
          },

          ...messages.map((m) => ({
            role: m.role as "user" | "assistant" | "system",
            content: m.content,
          })),
        ],
      },
      {
        timeout: TIMEOUT,
      }
    );

    return completion.choices[0].message.content?.trim() ?? "";
  });
}