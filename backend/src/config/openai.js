import OpenAI from "openai";

let client;

export function getOpenAIClient() {
  if (!process.env.GROQ_API_KEY) {
    return null;
  }

  if (!client) {
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    });
  }

  return client;
}
