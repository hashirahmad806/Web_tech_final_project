import fs from "fs/promises";
import { getOpenAIClient } from "../config/openai.js";
import { upsertSession } from "../utils/session.js";

function extractReplyContent(messageContent) {
  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.type === "text") {
          return item.text || "";
        }

        return "";
      })
      .filter(Boolean)
      .join("\n\n");
  }

  return "";
}

export async function analyzeImageQuestion(req, res, next) {
  const file = req.file;

  try {
    if (!file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const {
      question = "Read the image carefully, extract the full question, and solve it step by step.",
      sessionId = "default-session",
    } = req.body;

    if (!process.env.GROQ_API_KEY) {
      const fallback =
        "GROQ_API_KEY is missing. Add it in backend/.env to enable image-based solving.";

      await upsertSession({
        sessionId,
        question,
        answer: fallback,
        type: "image",
      });

      return res.json({ reply: fallback, imagePath: file.path });
    }

    const imageBuffer = await fs.readFile(file.path);

    if (imageBuffer.length > 2.8 * 1024 * 1024) {
      return res.status(400).json({
        message:
          "This image is still too large for reliable Groq vision analysis after encoding. Try a smaller screenshot, crop the question area, or upload a clearer image with less empty space.",
      });
    }

    const base64Image = imageBuffer.toString("base64");
    const mimeType = file.mimetype || "image/png";
    const openai = getOpenAIClient();

    const response = await openai.chat.completions.create({
      model:
        process.env.GROQ_VISION_MODEL ||
        process.env.GROQ_MODEL ||
        "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content: `You are a patient AI teacher reading a study image with OCR-level attention.

Your job is to understand the image carefully and write the answer in the same polished, professional style used by a premium study assistant.

Follow these rules:
- First identify the question or topic shown in the image.
- Extract the important visible details accurately.
- If anything is unclear, say what is unclear instead of guessing.
- Write in short sections with clean formatting.
- Prefer section titles such as "Detected Question", "Key Details From Image", "Answer", "Steps", and "Conclusion".
- Start with a direct professional answer, not a rough note.
- For descriptive or theory-based prompts, use polished paragraphs.
- For problem solving, use numbered steps.
- For math and science, show the method clearly before the result.
- Avoid one long block of text.
- End with "Conclusion:" when there is a clear final response.
- Keep wording natural, clear, and well-structured for students.
- Do not output messy OCR notes unless the user specifically asks for raw extraction.

Preferred structure:
Detected Question:

Key Details From Image:

Answer:

Steps:
1. ...
2. ...

Conclusion: ...`,
        },
        {
          role: "user",
          content: [
            { type: "text", text: question },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
    });

    const reply =
      extractReplyContent(response.choices?.[0]?.message?.content) ||
      "I could not read a usable answer from the image.";

    await upsertSession({
      sessionId,
      question,
      answer: reply,
      type: "image",
    });

    res.json({
      reply,
      imagePath: file.path,
    });
  } catch (error) {
    if (
      error?.message?.includes("image") ||
      error?.message?.includes("vision") ||
      error?.message?.includes("model") ||
      error?.message?.includes("content") ||
      error?.message?.includes("413") ||
      error?.message?.includes("Request Entity Too Large")
    ) {
      return res.status(400).json({
        message: `Groq vision could not analyze this image. ${
          error?.message || "Try a smaller, clearer image and crop tightly around the question."
        }`,
      });
    }

    next(error);
  }
}
