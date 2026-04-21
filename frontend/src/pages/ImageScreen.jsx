import { useState } from "react";
import { Camera } from "lucide-react";
import { API_BASE } from "../constants";
import { ScreenCard } from "../components/ScreenCard";
import { FormattedReply } from "../components/FormattedReply";
import { compressImageForVision } from "../utils/compressImage";

export function ImageScreen() {
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
