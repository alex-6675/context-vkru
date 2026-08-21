import { useState } from "react";
import { tasks, taskProcessRules } from "../data/tasks";
import Reveal from "./Reveal";

export default function TaskRegistry() {
  const [open, setOpen] = useState<string>("TASK-0001");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
      {/* леджер */}
      <div className="relative">
        <div className="absolute bottom-6 left-[7px] top-6 w-px bg-line" />
        <div className="space-y-2.5">
          {tasks.map((t, i) => {
            const isOpen = open === t.id;
            const active = t.status === "done-wait";
            return (
              <Reveal key={t.id} delay={Math.min(i * 60, 240)}>
                <div className="relative flex gap-4">
                  <div className="relative z-10 flex shrink-0 pt-4">
                    <span
                      className={`h-[15px] w-[15px] rounded-full border-2 ${
                        active
                          ? "pulse-now border-steel bg-steel/30"
                          : "border-line2 bg-panel"
                      }`}
                    />
                  </div>
                  <button
                    onClick={() => setOpen(isOpen ? "" : t.id)}
                    className={`group mb-1 flex-1 cursor-pointer border px-4 py-3.5 text-left transition-all duration-300 sm:px-5 ${
                      isOpen
                        ? "border-steel/50 bg-panel2 shadow-[0_16px_44px_-20px_rgba(0,0,0,0.7)]"
                        : "border-line bg-panel/60 hover:border-line2 hover:bg-panel"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                      <span
                        className={`font-mono text-[12px] font-bold tracking-wide ${
                          active ? "text-steel" : "text-faint"
                        }`}
                      >
                        {t.id}
                      </span>
                      <span className="border border-line2 bg-inset px-1.5 py-px font-mono text-[10px] tracking-wide text-dim">
                        {t.build}
                      </span>
                      <span className="font-mono text-[10px] text-faint">{t.manifest}</span>
                      <span className="font-display text-[13.5px] font-semibold leading-snug text-ink transition-colors group-hover:text-steel">
                        {t.title}
                      </span>
                      <span
                        className={`ml-auto shrink-0 rounded-sm border px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider ${
                          active
                            ? "border-warn/50 bg-warn/10 text-warn"
                            : "border-line2 bg-inset text-faint"
                        }`}
                      >
                        {t.statusLabel}
                      </span>
                      <svg
                        className={`h-3.5 w-3.5 shrink-0 text-faint transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>

                    <p className="mt-1.5 truncate font-mono text-[10.5px] tracking-tight text-faint/90">
                      <span className="text-steel/80">$</span> {t.commit}
                    </p>

                    <div className={`stage-detail ${isOpen ? "open" : ""}`}>
                      <div>
                        <div className="mt-3 border-t border-line pt-3">
                          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-faint">
                            Цель
                          </p>
                          <p className="mt-1 text-[13px] leading-relaxed text-dim">{t.goal}</p>

                          <div className="mt-3 grid gap-3 sm:grid-cols-2">
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                                Изменяемые файлы
                              </p>
                              <ul className="mt-1.5 space-y-1.5">
                                {t.files.map((f) => (
                                  <li key={f} className="flex gap-2 font-mono text-[11px] leading-relaxed text-dim">
                                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-steel/70" />
                                    {f}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-warn">
                                Тест
                              </p>
                              <ul className="mt-1.5 space-y-1.5">
                                {t.test.map((s) => (
                                  <li key={s} className="flex gap-2 text-[12px] leading-relaxed text-dim">
                                    <span className="mt-[6px] h-1 w-1 shrink-0 rounded-full bg-warn/70" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-pass/80">
                            PASS
                          </p>
                          <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{t.pass}</p>

                          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-line/60 pt-2.5 font-mono text-[10.5px] text-faint">
                            <span>
                              зависимость: <span className="text-dim">{t.dep}</span>
                            </span>
                            <span>
                              основание: <span className="text-dim">{t.basis}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>

      {/* правая колонка: процесс + порядок */}
      <div className="space-y-5">
        <Reveal delay={100}>
          <div className="border border-warn/40 bg-warn/[0.06] p-5">
            <h3 className="font-display text-[15px] font-semibold text-warn">
              Правила выдачи и приёмки
            </h3>
            <div className="mt-3.5 space-y-3">
              {taskProcessRules.map((r, i) => (
                <div key={r} className="flex gap-3">
                  <span className="mt-px flex h-6 w-6 shrink-0 items-center justify-center border border-warn/50 bg-warn/10 font-mono text-[11px] font-bold text-warn">
                    {i + 1}
                  </span>
                  <p className="text-[12.5px] leading-relaxed text-dim">{r}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={160}>
          <div className="cornered border border-line bg-inset/90 p-5">
            <h3 className="font-display text-[15px] font-semibold text-ink">
              Порядок r-серии
            </h3>
            <pre className="mt-3 overflow-x-auto font-mono text-[11.5px] leading-[1.9] text-dim">
{`TASK-0001  v03r   фундамент (ПКМ)
    │      RESULT_v03r.md → PASS
    ▼
TASK-0002  v_04r  портал + id + авто-тип
    ▼
TASK-0003  v_05r  запись в базу (контракт v2)
    ▼
TASK-0004  v_06r  маркировка после F5
    ▼
TASK-0005  v_07r  меню коррекции карточки
    ▼
далее (Дополнение №3): v_08r слияние · v_09r экспорт/импорт`}
            </pre>
            <p className="mt-3 text-[12px] leading-relaxed text-faint">
              Строго последовательно: следующий TASK не выдаётся до PASS по
              предыдущему (§4 регламента). Файлы группы —{" "}
              <span className="font-mono text-[11px] text-dim">docs/tasks/TASK-000X.md</span>;
              поправка о TASK —{" "}
              <span className="font-mono text-[11px] text-dim">docs/ARCHITECTURE_TASKS_ADDENDUM.md</span>.
            </p>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
