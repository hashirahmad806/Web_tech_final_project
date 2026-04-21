import { useState } from "react";
import { SendHorizontal } from "lucide-react";
import { API_BASE } from "../constants";
import { ScreenCard } from "../components/ScreenCard";
import { MessageBubble } from "../components/MessageBubble";

export function ChatScreen() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Ask a study question and I'll help with an explanation or summary.",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!question.trim() || loading) return;

    const userMessage = { role: "user", content: question.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: "default-session",
          studentName: "Student",
          message: userMessage.content,
        }),
      });

      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply || "No response received." },
      ]);
    } catch (_error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "The server is not reachable yet. Start the backend and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenCard
      title="Chat with AI"
      subtitle="Ask questions like you would in ChatGPT."
      action={
        <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-accentDark">
          Live tutor mode
        </div>
      }
    >
      <div className="mb-5 flex max-h-[52vh] min-h-[320px] flex-col gap-3 overflow-y-auto rounded-[22px] bg-white/80 p-3 sm:max-h-[420px] sm:gap-4 sm:rounded-[28px] sm:p-4">
        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} message={message} />
        ))}
      </div>

      <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSubmit}>
        <input
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-orange-300"
          placeholder="Type your question here..."
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 lg:min-w-[140px]"
          disabled={loading}
        >
          <SendHorizontal size={18} />
          {loading ? "Thinking..." : "Send"}
        </button>
      </form>
    </ScreenCard>
  );
}
