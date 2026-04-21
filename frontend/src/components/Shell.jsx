import { NavLink } from "react-router-dom";
import { GraduationCap, Mic } from "lucide-react";
import { menuItems } from "../constants";

export function Shell({ children }) {
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
