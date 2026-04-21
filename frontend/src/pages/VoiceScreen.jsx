import { useState, useEffect } from "react";
import { Mic } from "lucide-react";
import { API_BASE } from "../constants";
import { ScreenCard } from "../components/ScreenCard";
import { MessageBubble } from "../components/MessageBubble";

export function VoiceScreen() {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState("idle");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Press record and speak your study question, then submit it for an answer.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [supported, setSupported] = useState(true);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.interimResults = true;
    recog.lang = "en-US";

    recog.onresult = (event) => {
      const result = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join(" ");
      setTranscript(result);
    };

    recog.onstart = () => setStatus("listening");
    recog.onerror = () => {
      setStatus("error");
      setSupported(false);
    };
    recog.onend = () => {
      setStatus("idle");
    };

    setRecognition(recog);
    return () => {
      if (recog && recog.abort) {
        recog.abort();
      }
    };
  }, []);

  const startListening = () => {
    if (!recognition || loading) return;
    try {
      setTranscript("");
      recognition.start();
    } catch (error) {
      setStatus("error");
    }
  };

  const stopListening = () => {
    if (!recognition || status !== "listening") return;
    recognition.stop();
    setStatus("idle");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!transcript.trim() || loading) return;

    const userMessage = { role: "user", content: transcript.trim() };
    setMessages((prev) => [...prev, userMessage]);
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
      setTranscript("");
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "The server is not reachable yet. Start the backend and try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenCard
      title="Voice Mode"
      subtitle="Speak your question and let the AI answer it."
      action={
        <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-accentDark">
          {supported ? "Speech ready" : "Speech unsupported"}
        </div>
      }
    >
      <div className="mb-5 flex max-h-[52vh] min-h-[320px] flex-col gap-3 overflow-y-auto rounded-[22px] bg-white/80 p-3 sm:max-h-[420px] sm:gap-4 sm:rounded-[28px] sm:p-4">
        {messages.map((message, index) => (
          <MessageBubble key={`${message.role}-${index}`} message={message} />
        ))}
      </div>

      <form className="flex flex-col gap-3 lg:flex-row" onSubmit={handleSubmit}>
        <textarea
          className="flex-1 min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-orange-300"
          placeholder={
            supported
              ? "Your speech will appear here after recording."
              : "Speech recognition is not available in this browser."
          }
          value={transcript}
          onChange={(event) => setTranscript(event.target.value)}
          disabled={!supported}
        />
        <div className="flex flex-col gap-3 lg:min-w-[180px]">
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-ink px-5 py-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={status === "listening" ? stopListening : startListening}
            disabled={!supported || loading}
          >
            <Mic size={18} />
            {status === "listening" ? "Stop listening" : "Start recording"}
          </button>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-teal px-5 py-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!supported || !transcript.trim() || loading}
          >
            {loading ? "Sending..." : "Send voice question"}
          </button>
        </div>
      </form>

      {!supported ? (
        <p className="mt-3 text-sm text-slate-500">
          Voice recognition is unavailable in this browser. Use Chrome or Edge with microphone permissions enabled.
        </p>
      ) : null}
    </ScreenCard>
  );
}
