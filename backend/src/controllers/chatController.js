import { getOpenAIClient } from "../config/openai.js";
import { upsertSession } from "../utils/session.js";

export async function createChatResponse(req, res, next) {
  try {
    const { sessionId = "default-session", studentName = "Student", message } = req.body;

    if (!message) {
      return res.status(400).json({ message: "Message is required." });
    }

    if (!process.env.GROQ_API_KEY) {
      const fallback =
        "GROQ_API_KEY is missing. Add it in backend/.env to enable real AI responses.";

      await upsertSession({
        sessionId,
        studentName,
        question: message,
        answer: fallback,
      });

      return res.json({ reply: fallback });
    }

    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are an excellent AI tutor for students.

Your job is to write answers that feel polished, professional, and easy to read in a modern study app.

Follow these rules:
- Use a clean academic tone that is natural, confident, and not robotic.
- Do not write the whole response as one dense block.
- Use short sections with clear labels when helpful.
- Prefer polished section titles such as "Answer", "Explanation", "Key Points", "Steps", and "Conclusion".
- Start with a direct and well-written answer.
- Then expand with concise explanation in short paragraphs.
- When the topic involves process, reasoning, or comparison, use numbered steps.
- For factual summaries from an image or prompt, write in paragraph form first, not just bullets.
- If there is a definite result, end with "Conclusion:" followed by a concise final statement.
- Avoid casual filler, repetition, and overly simplistic wording.
- If the prompt is vague, make a reasonable assumption and state it briefly.
- Keep the response visually neat with blank lines between sections.

Preferred style example:
Answer:
Write a direct professional response here.

Explanation:
Add a short, clear explanation in polished language.

Key Points:
1. First important point.
2. Second important point.

Conclusion:
End with a concise closing line.`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const reply =
      response.choices?.[0]?.message?.content ||
      "I could not generate a response for that question.";

    await upsertSession({
      sessionId,
      studentName,
      question: message,
      answer: reply,
    });

    res.json({ reply });
  } catch (error) {
    next(error);
  }
}
