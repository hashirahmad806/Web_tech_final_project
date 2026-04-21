import ChatHistory from "../models/ChatHistory.js";

export async function upsertSession({
  sessionId,
  studentName = "Student",
  question,
  answer,
  type = "text",
}) {
  const title = question.slice(0, 50) || "New Study Session";

  const existing = await ChatHistory.findOne({ sessionId });

  if (!existing) {
    return ChatHistory.create({
      sessionId,
      studentName,
      title,
      lastQuestion: question,
      messages: [
        { role: "user", content: question, type },
        { role: "assistant", content: answer, type: "text" },
      ],
    });
  }

  existing.lastQuestion = question;
  existing.messages.push(
    { role: "user", content: question, type },
    { role: "assistant", content: answer, type: "text" },
  );

  if (existing.title === "New Study Session" && question) {
    existing.title = title;
  }

  return existing.save();
}
