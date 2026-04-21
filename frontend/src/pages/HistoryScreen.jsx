import { useState, useEffect } from "react";
import { API_BASE } from "../constants";
import { ScreenCard } from "../components/ScreenCard";

export function HistoryScreen() {
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
