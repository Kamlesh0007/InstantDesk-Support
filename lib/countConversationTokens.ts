import { encodingForModel } from "js-tiktoken";

// Create a tokenizer for the GPT-4o-mini model.
// A tokenizer converts text into tokens (small pieces of text).
const enc = encodingForModel("gpt-4o-mini");


// This function counts the number of tokens in a single piece of text.
export function countTokens(text: string): number {
  // enc.encode(text) converts the text into an array of tokens.
  // .length tells us how many tokens there are.
  return enc.encode(text).length;
}


// This function counts the approximate number of tokens
// used by an entire conversation.
export function countConversationTokens(
  messages: { role: string; content: string }[]
) {
  let tokens = 0;

  // Go through every message in the conversation.
  for (const msg of messages) {

    // Add 4 tokens for the message formatting/overhead.
    // This represents extra tokens used to structure each message
    // (role + message formatting).
    tokens += 4;

    // Count the tokens in the actual message content
    // and add them to the total.
    tokens += enc.encode(msg.content).length;
  }

  // Add 2 tokens for the final conversation formatting.
  tokens += 2;

  // Return the total estimated token count.
  return tokens;
}