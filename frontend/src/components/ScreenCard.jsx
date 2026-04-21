export function ScreenCard({ title, subtitle, children, action }) {
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
