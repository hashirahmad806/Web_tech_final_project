import { NavLink, Route, Routes } from "react-router-dom";
import {
  Bot,
  Camera,
  GraduationCap,
  History,
  Home,
  Mic,
  SendHorizontal,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const menuItems = [
  { to: "/", label: "Home", icon: Home },
  { to: "/chat", label: "Chat", icon: Bot },
  { to: "/voice", label: "Voice", icon: Mic },
  { to: "/image", label: "Vision", icon: Camera },
  { to: "/history", label: "History", icon: History },
];

function FormattedReply({ text }) {
  const lines = text.split("\n");
  const blocks = [];
  let paragraphLines = [];
  let listItems = [];

  const flushParagraph = () => {
    if (!paragraphLines.length) return;
    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" ").trim(),
    });
    paragraphLines = [];
  };

  const flushList = () => {
    if (!listItems.length) return;
    blocks.push({
      type: "list",
      items: [...listItems],
    });
    listItems = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    const numberedMatch = line.match(/^(\d+)\.\s+(.*)$/);
    const bulletMatch = line.match(/^[-*]\s+(.*)$/);
    const markdownHeadingMatch = line.match(/^#{1,6}\s+(.*)$/);

    if (numberedMatch) {
      flushParagraph();
      listItems.push(numberedMatch[2]);
      continue;
    }

    if (bulletMatch) {
      flushParagraph();
      listItems.push(bulletMatch[1]);
      continue;
    }

    if (markdownHeadingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        title: markdownHeadingMatch[1],
        content: "",
      });
      continue;
    }

    const headingMatch = line.match(/^([A-Za-z][A-Za-z\s]{1,40}):\s*(.*)$/);

    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: "heading",
        title: headingMatch[1],
        content: headingMatch[2],
      });
      continue;
    }

    flushList();
    paragraphLines.push(line);
  }

  flushParagraph();
  flushList();

  if (!blocks.length) {
    return <div className="whitespace-pre-wrap break-words leading-7">{text}</div>;
  }

  return (
    <div className="space-y-4 break-words leading-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <section
              key={`${block.type}-${index}`}
              className="rounded-2xl border border-slate-200/80 bg-white/80 px-4 py-3 shadow-sm"
            >
              <h4 className="font-display text-sm font-bold uppercase tracking-[0.18em] text-accentDark">
                {block.title}
              </h4>
              {block.content ? <p className="mt-2 text-[15px] text-slate-700">{block.content}</p> : null}
            </section>
          );
        }

        if (block.type === "list") {
          return (
            <ol
              key={`${block.type}-${index}`}
              className="space-y-3 rounded-2xl bg-white/70 px-4 py-4 text-[15px] text-slate-700"
            >
              {block.items.map((item, itemIndex) => (
                <li key={`${item}-${itemIndex}`} className="flex gap-3">
                  <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                    {itemIndex + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          );
        }

        return (
          <p key={`${block.type}-${index}`} className="text-[15px] text-slate-700">
            {block.content}
          </p>
        );
      })}
    </div>
  );
}

async function compressImageForVision(file) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the selected image."));
      img.src = imageUrl;
    });

    const shouldCompress =
      file.size > 1.5 * 1024 * 1024 ||
      file.type !== "image/jpeg" ||
      image.width > 1400 ||
      image.height > 1400;

    if (!shouldCompress) {
      return file;
    }

    const maxDimension = 1280;
    const scale = Math.min(maxDimension / image.width, maxDimension / image.height, 1);
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Could not prepare the image for upload.");
    }

    context.drawImage(image, 0, 0, width, height);

    const compressedBlob = await new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
            return;
          }

          reject(new Error("Could not compress the image."));
        },
        "image/jpeg",
        0.72,
      );
    });

    return new File([compressedBlob], `${file.name.replace(/\.[^.]+$/, "") || "upload"}.jpg`, {
      type: "image/jpeg",
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

function Shell({ children }) {
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-4 px-3 py-3 sm:px-4 sm:py-4 lg:flex-row lg:gap-6 lg:px-6 lg:py-6">
      <div className="glass-panel flex items-center justify-between rounded-[24px] border border-white/60 px-4 py-4 shadow-float sm:rounded-[28px] lg:hidden">
        <div>
          <p className="font-display text-base font-bold text-ink sm:text-lg">AI Student</p>
          <p className="text-sm text-slate-500">Hi, Student</p>
        </div>
        <div className="rounded-2xl bg-ink p-3 text-white">
          <GraduationCap size={20} />
        </div>
      </div>

      <nav className="glass-panel flex items-center gap-2 overflow-x-auto rounded-[22px] border border-white/60 p-2 shadow-float lg:hidden">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `inline-flex min-w-fit items-center gap-2 rounded-2xl px-3 py-3 text-sm font-semibold transition sm:px-4 ${
                isActive ? "bg-ink text-white" : "text-slate-600"
              }`
            }
          >
            <Icon size={16} />
            {label}
          </NavLink>
        ))}
      </nav>

      <aside className="glass-panel hidden w-72 flex-col rounded-[32px] border border-white/60 p-6 shadow-float xl:w-80 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-ink p-3 text-white">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="font-display text-lg font-bold">AI Student</p>
            <p className="text-sm text-slate-500">Study smarter every day</p>
          </div>
        </div>

        <div className="mb-6 rounded-[28px] bg-gradient-to-br from-ink to-teal p-5 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">Welcome</p>
          <h1 className="mt-2 font-display text-2xl font-bold">Hi, Student</h1>
          <p className="mt-2 text-sm text-white/75">
            Ask questions, upload homework, and keep your study trail in one place.
          </p>
        </div>

        <nav className="space-y-2">
          {menuItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-ink text-white"
                    : "text-slate-600 hover:bg-white hover:text-ink"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto rounded-[24px] border border-orange-200 bg-orange-50 p-5">
          <div className="mb-3 inline-flex rounded-full bg-white p-2 text-accent shadow-sm">
            <Mic size={18} />
          </div>
          <p className="font-display text-lg font-semibold">Voice Mode</p>
          <p className="mt-2 text-sm text-slate-600">
            Tap Voice in the nav to speak your question and get AI answers.
          </p>
        </div>
      </aside>

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

function ScreenCard({ title, subtitle, children, action }) {
  return (
    <section className="glass-panel rounded-[24px] border border-white/60 p-4 shadow-float sm:rounded-[28px] sm:p-5 lg:rounded-[32px] lg:p-6">
      <div className="mb-5 flex flex-col gap-4 md:mb-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-ink sm:text-2xl">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">{subtitle}</p>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function HomeScreen() {
  const cards = [
    {
      title: "Ask anything",
      text: "Get step-by-step help for assignments, concepts, and exam prep.",
      icon: Sparkles,
      tone: "from-orange-100 to-orange-50",
    },
    {
      title: "Solve from image",
      text: "Upload a worksheet, handwritten note, or textbook snap for AI help.",
      icon: Camera,
      tone: "from-teal-100 to-teal-50",
    },
    {
      title: "Review history",
      text: "Return to earlier questions and continue where you left off.",
      icon: History,
      tone: "from-slate-100 to-white",
    },
  ];

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-ink via-slate-800 to-teal p-5 text-white shadow-float sm:rounded-[32px] sm:p-7 lg:rounded-[36px] lg:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-orange-200">Student Assistant</p>
        <h1 className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight sm:text-4xl">
          Your pocket tutor for chat, vision, and study memory.
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-white/75 md:text-base">
          Built with React, Express, MongoDB, and OpenAI so students can ask, upload, learn,
          and revisit answers from one clean dashboard.
        </p>
      </section>

      <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ title, text, icon: Icon, tone }) => (
          <div
            key={title}
            className={`rounded-[24px] border border-white/70 bg-gradient-to-br ${tone} p-5 shadow-float sm:rounded-[28px] sm:p-6`}
          >
            <div className="mb-4 inline-flex rounded-2xl bg-white p-3 text-ink">
              <Icon size={20} />
            </div>
            <h3 className="font-display text-xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatScreen() {
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
          <div
            key={`${message.role}-${index}`}
            className={`w-full rounded-[20px] px-3 py-3 text-sm shadow-sm sm:w-auto sm:max-w-[88%] sm:rounded-[24px] sm:px-4 sm:py-4 ${
              message.role === "user"
                ? "sm:ml-auto bg-ink text-white"
                : "border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-slate-50 text-slate-700"
            }`}
          >
            {message.role === "user" ? (
              <div className="whitespace-pre-wrap break-words leading-7">{message.content}</div>
            ) : (
              <FormattedReply text={message.content} />
            )}
          </div>
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

function VoiceScreen() {
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
          <div
            key={`${message.role}-${index}`}
            className={`w-full rounded-[20px] px-3 py-3 text-sm shadow-sm sm:w-auto sm:max-w-[88%] sm:rounded-[24px] sm:px-4 sm:py-4 ${
              message.role === "user"
                ? "sm:ml-auto bg-ink text-white"
                : "border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-slate-50 text-slate-700"
            }`}
          >
            {message.role === "user" ? (
              <div className="whitespace-pre-wrap break-words leading-7">{message.content}</div>
            ) : (
              <FormattedReply text={message.content} />
            )}
          </div>
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

function ImageScreen() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async (event) => {
    event.preventDefault();
    if (!file || loading) return;

    const preparedFile = await compressImageForVision(file);
    const formData = new FormData();
    formData.append("image", preparedFile);
    formData.append("question", question);
    formData.append("sessionId", "default-session");

    setLoading(true);
    setResult("");

    try {
      const response = await fetch(`${API_BASE}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Image upload failed.");
      }

      const data = await response.json();
      setResult(data.reply || "No answer returned.");
    } catch (error) {
      setResult(
        error.message ||
          "The vision endpoint is not reachable yet. Start the backend and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenCard
      title="Image-Based Solving"
      subtitle="Upload a photo of a question and ask the assistant to solve or explain it."
    >
      <form className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]" onSubmit={handleUpload}>
        <div className="rounded-[24px] border-2 border-dashed border-orange-200 bg-orange-50/70 p-4 sm:rounded-[28px] sm:p-6">
          <label className="flex min-h-[240px] cursor-pointer flex-col items-center justify-center rounded-[22px] bg-white px-5 py-10 text-center sm:min-h-[280px] sm:rounded-[24px] sm:px-6 sm:py-12">
            <Camera className="mb-3 text-accent" size={28} />
            <span className="font-display text-lg font-semibold">Choose image</span>
            <span className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
              JPG or PNG. Large images are automatically compressed for Groq vision.
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
            />
          </label>
          {file ? (
            <p className="mt-4 text-sm font-medium text-slate-700">Selected: {file.name}</p>
          ) : null}
        </div>

        <div className="space-y-4 rounded-[24px] bg-white/80 p-4 sm:rounded-[28px] sm:p-5">
          <textarea
            className="min-h-[150px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-orange-300 sm:min-h-[160px]"
            placeholder="Optional: ask something specific, like 'Solve question 3 step by step'."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-teal px-4 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!file || loading}
          >
            {loading ? "Analyzing image..." : "Upload and Solve"}
          </button>

          <div className="overflow-hidden rounded-[22px] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-slate-50 shadow-sm sm:rounded-[24px]">
            <div className="border-b border-orange-100/80 px-4 py-3">
              <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-accentDark">
                Vision Answer
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Structured response from the uploaded image
              </p>
            </div>

            <div className="max-h-[48vh] overflow-y-auto px-4 py-4 text-sm text-slate-600 sm:max-h-[420px]">
              <FormattedReply
                text={
                  result ||
                  "The AI answer will appear here after upload in the same polished format as chat."
                }
              />
            </div>
          </div>
        </div>
      </form>
    </ScreenCard>
  );
}

function HistoryScreen() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const response = await fetch(`${API_BASE}/history`);
        const data = await response.json();
        setHistory(data.history || []);
      } catch (_error) {
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  return (
    <ScreenCard
      title="Study History"
      subtitle="See previous questions and continue earlier study sessions."
    >
      <div className="space-y-4">
        {loading ? <p className="text-sm text-slate-500">Loading history...</p> : null}

        {!loading && history.length === 0 ? (
          <div className="rounded-[24px] bg-white/75 p-6 text-sm text-slate-500">
            No study history yet. Start chatting or upload a question image to create entries.
          </div>
        ) : null}

        {history.map((item) => (
          <article
            key={item._id}
            className="rounded-[20px] border border-white/60 bg-white/85 p-4 sm:rounded-[24px] sm:p-5"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <h3 className="font-display text-base font-semibold text-ink sm:text-lg">
                {item.title}
              </h3>
              <span className="text-[11px] uppercase tracking-[0.18em] text-slate-400 sm:text-xs">
                {new Date(item.updatedAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.lastQuestion}</p>
          </article>
        ))}
      </div>
    </ScreenCard>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/voice" element={<VoiceScreen />} />
        <Route path="/image" element={<ImageScreen />} />
        <Route path="/history" element={<HistoryScreen />} />
      </Routes>
    </Shell>
  );
}
