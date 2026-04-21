import { Camera, History, Sparkles } from "lucide-react";

export function HomeScreen() {
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
