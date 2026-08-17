import { type ReactNode } from "react";
import Reveal from "./components/Reveal";
import Terminal from "./components/Terminal";
import ScoreRing from "./components/ScoreRing";
import ConformanceMatrix from "./components/ConformanceMatrix";
import Roadmap from "./components/Roadmap";
import Steps from "./components/Steps";
import {
  counts,
  stages,
  stackLocal,
  stackTarget,
  templateFiles,
  entityContract,
  entityNotes,
} from "./data/audit";

const DOC_ARCH =
  "https://github.com/alex-6675/context-vkru/blob/main/docs/architecture.md";
const DOC_REG =
  "https://github.com/alex-6675/context-vkru/blob/main/docs/%D0%A0%D0%95%D0%93%D0%9B%D0%90%D0%9C%D0%95%D0%9D%D0%A2_%D0%A0%D0%90%D0%91%D0%9E%D0%A2_v2_0.md";

/* ---------- мелкие svg-иконки ---------- */

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="var(--color-fail)" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const IconCheck = () => (
  <svg width="11" height="11" viewBox="0 0 12 12" fill="none" className="shrink-0">
    <path d="M2 6.2L4.8 9L10 3.4" stroke="var(--color-pass)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconExt = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline-block">
    <path d="M4.5 2H2v8h8V7.5M7 2h3v3M10 2L5.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function SectionHead({
  num,
  title,
  sub,
}: {
  num: string;
  title: string;
  sub: string;
}) {
  return (
    <Reveal className="mb-8">
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-[13px] font-bold text-steel">{num}</span>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-[0.08em] text-ink sm:text-2xl">
          {title}
        </h2>
      </div>
      <p className="mt-2 max-w-2xl pl-0 text-[14px] leading-relaxed text-dim sm:pl-[52px]">
        {sub}
      </p>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-line2 via-line to-transparent" />
    </Reveal>
  );
}

/* ---------- приложение ---------- */

export default function App() {
  return (
    <div className="relative min-h-screen font-body text-ink">
      {/* фоновые слои */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-glow" />
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-0 noise" />
      </div>

      <div className="relative z-10">
        {/* верхняя панель */}
        <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center gap-4 px-5 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center border border-steel/50 bg-steel/10">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 2L12.5 11H1.5L7 2Z" stroke="var(--color-steel)" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </span>
              <div className="leading-tight">
                <p className="font-mono text-[12px] font-bold tracking-wide text-ink">
                  context-vkru
                </p>
                <p className="font-mono text-[10px] tracking-wider text-faint">
                  Edge-расширение для vk.ru · Manifest V3
                </p>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <a
                href={DOC_ARCH}
                target="_blank"
                rel="noreferrer"
                className="filter-btn hidden items-center gap-1.5 border border-line bg-panel px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-dim hover:border-steel hover:text-ink sm:flex"
              >
                architecture.md <IconExt />
              </a>
              <a
                href={DOC_REG}
                target="_blank"
                rel="noreferrer"
                className="filter-btn flex items-center gap-1.5 border border-line bg-panel px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-dim hover:border-steel hover:text-ink"
              >
                РЕГЛАМЕНТ v2.0 <IconExt />
              </a>
              <span className="flex items-center gap-1.5 border border-fail/40 bg-fail/10 px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-wider text-fail">
                <span className="blink-soft h-1.5 w-1.5 rounded-full bg-fail" />
                FAIL
              </span>
            </div>
          </div>
        </header>

        {/* заголовок + терминал */}
        <section className="mx-auto max-w-6xl px-5 pb-10 pt-10 sm:pt-14">
          <div className="grid items-start gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-10">
            <div>
              <Reveal>
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
                  Отчёт о сверке · локальное репо ⇄ документация
                </p>
                <h1 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.3rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
                  Архитектура есть.
                  <br />
                  <span className="text-fail">Кода — нет.</span>
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
                  Локальный репозиторий — чистый шаблон{" "}
                  <span className="font-mono text-[13px] text-ink">Vite + React + TS</span>.
                  Сверено <span className="font-semibold text-ink">{counts.total} требований</span>{" "}
                  из <span className="font-mono text-ink">architecture.md</span> и{" "}
                  <span className="font-mono text-ink">РЕГЛАМЕНТ_РАБОТ v2.0</span>: не найдено ни
                  одного артефакта расширения — от{" "}
                  <span className="font-mono text-ink">manifest.json</span> до{" "}
                  <span className="font-mono text-ink">adapters/vkru.js</span>. Единственный PASS —
                  запрет на перенос legacy (§K), и тот тривиальный.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="border border-fail/50 bg-fail/10 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider text-fail">
                    Вердикт: не соответствует
                  </span>
                  <span className="border border-line bg-panel px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-dim">
                    сборок: 0 / {stages.length}
                  </span>
                  <span className="border border-steel/50 bg-steel/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-steel">
                    следующий шаг: Этап 0 · v_01
                  </span>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-7">
                  <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
                    Что реально лежит в репо
                  </p>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {templateFiles.map((f) => (
                      <span
                        key={f}
                        className="border border-line bg-inset px-2.5 py-1 font-mono text-[11px] text-dim transition-colors hover:border-line2 hover:text-ink"
                      >
                        {f}
                      </span>
                    ))}
                    <span className="border border-warn/40 bg-warn/10 px-2.5 py-1 font-mono text-[11px] text-warn">
                      + 12 npm-зависимостей
                    </span>
                  </div>
                  <p className="mt-2.5 text-[12.5px] leading-relaxed text-faint">
                    Ни один из этих файлов не относится к расширению. Корень, загружаемый в Edge,
                    должен быть другим (§L, §2.3).
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal delay={150}>
              <Terminal />
            </Reveal>
          </div>

          {/* сводная полоса */}
          <Reveal delay={100}>
            <div className="mt-12 grid grid-cols-2 gap-px border border-line bg-line lg:grid-cols-4">
              <div className="flex items-center gap-5 bg-panel px-5 py-5">
                <ScoreRing size={104} />
                <div className="font-mono text-[11.5px] leading-relaxed text-dim">
                  <p><span className="font-bold text-pass">{counts.pass} PASS</span></p>
                  <p><span className="font-bold text-warn">{counts.warn} WARN</span></p>
                  <p><span className="font-bold text-fail">{counts.fail} FAIL</span></p>
                </div>
              </div>

              <div className="bg-panel px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Артефакты расширения</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-ink">
                  0<span className="text-lg text-faint"> / 14</span>
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-dim">
                  manifest, background, content, адаптер, core, ui, styles, иконки
                </p>
              </div>

              <div className="bg-panel px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Сборки по этапам</p>
                <p className="mt-2 font-display text-3xl font-extrabold text-ink">
                  v_00<span className="text-lg text-faint"> → v_01</span>
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                  <div className="progress-fill h-full w-[2%] rounded-full bg-steel" />
                </div>
                <p className="mt-1.5 text-[12px] text-dim">0 из {stages.length} подтверждено</p>
              </div>

              <div className="bg-panel px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Режим процесса</p>
                <p className="mt-2 font-display text-[15px] font-bold leading-snug text-steel">
                  Один модуль → одна сборка → один результат
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-dim">
                  Переход дальше — только после PASS в RESULT.md от Пользователя (§4)
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 01 — матрица */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="01"
            title="Сверка с architecture.md"
            sub={`Постатейная проверка документа: границы и стек (§B), компоненты (§D), контракт ENTITY (§E), идентификация (§F–I), сценарий ПКМ (§J), отказ от legacy (§K) и структура каталогов (§L). Всего ${counts.total} пунктов.`}
          />
          <ConformanceMatrix />
        </section>

        {/* 02 — стек */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="02"
            title="Конфликт стека"
            sub="Единственный WARN аудита — но системный: текущий шаблон собран на том, что регламент прямо запрещает внутри расширения. Конфликт решается разведением корней, а не переписыванием."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="cornered h-full border border-fail/30 bg-panel/80 p-5 sm:p-6">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-fail">
                  Как есть · package.json
                </p>
                <h3 className="mt-1.5 font-display text-[16px] font-bold text-ink">
                  Vite-шаблон с фреймворками
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {stackLocal.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-[13.5px] text-dim">
                      <IconX />
                      <span className="font-mono text-[12.5px]">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <Reveal delay={120}>
              <div className="cornered h-full border border-pass/30 bg-panel/80 p-5 sm:p-6">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-pass">
                  Как надо · РЕГЛАМЕНТ §2.2
                </p>
                <h3 className="mt-1.5 font-display text-[16px] font-bold text-ink">
                  Vanilla JS + нативные API браузера
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {stackTarget.map((s) => (
                    <li key={s} className="flex items-center gap-3 text-[13.5px] text-dim">
                      <IconCheck />
                      <span className="font-mono text-[12.5px]">{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>
          <Reveal delay={160}>
            <div className="mt-5 border border-line bg-inset/80 p-5 sm:p-6">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-steel">
                Предлагаемое решение
              </p>
              <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-dim">
                Расширение живёт в <span className="font-mono text-[12.5px] text-ink">EdgeExtension/</span>{" "}
                и пишется на чистом Vanilla JS — в корень, загружаемый в Edge, не попадает ни одной
                npm-зависимости. Vite/React-шаблон остаётся <em className="not-italic text-ink">вне</em>{" "}
                этого корня: его можно архивировать либо оставить отдельным инструментом проекта —
                например, дашбордом процесса (этот отчёт). Менять стек расширения «для удобства»
                запрещено правилом §5.3.
              </p>
            </div>
          </Reveal>
        </section>

        {/* 03 — контракт */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="03"
            title="Контракт ENTITY"
            sub="Часть 3 регламента: структура заморожена, компоненты обмениваются только ею. Четыре полевых правила — что можно считать ключом, а что запрещено трогать."
          />
          <div className="grid gap-5 lg:grid-cols-[1.15fr_1fr]">
            <Reveal>
              <div className="cornered h-full border border-line bg-inset/90">
                <div className="flex items-center justify-between border-b border-line px-5 py-2.5">
                  <span className="font-mono text-[11px] tracking-wider text-faint">
                    entity.contract · зафиксирован
                  </span>
                  <span className="border border-warn/40 bg-warn/10 px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-wider text-warn">
                    не менять без согласования
                  </span>
                </div>
                <pre className="overflow-x-auto px-5 py-4 font-mono text-[12px] leading-[1.8] text-dim">
                  {entityContract}
                </pre>
              </div>
            </Reveal>
            <div className="space-y-3">
              {entityNotes.map((n, i) => (
                <Reveal key={n.field} delay={i * 80}>
                  <div className="req-row group border border-line bg-panel/70 px-4 py-3.5 transition-all hover:bg-panel" data-status="warn">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-mono text-[12px] font-bold text-ink">{n.field}</p>
                      <span className="font-mono text-[10px] tracking-wider text-steel">{n.doc}</span>
                    </div>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-dim">{n.rule}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* 04 — дорожная карта */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="04"
            title={`Дорожная карта v_01 — v_15`}
            sub="Часть 6 регламента: строго последовательно, один модуль — одна тестовая сборка. Клик по этапу раскрывает цель и PASS-критерий; v_01 пульсирует как ближайшая работа."
          />
          <Roadmap />
        </section>

        {/* 05 — предложения */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="05"
            title="Предложения: с чего начать"
            sub="Семь шагов до первой подтверждённой сборки. Чек-лист сохраняется локально; справа — готовый шаблон задания M-01 по форме §7, его можно скопировать одной кнопкой и отдать в работу."
          />
          <Steps />
        </section>

        {/* финал */}
        <footer className="border-t border-line">
          <div className="mx-auto max-w-6xl px-5 py-14">
            <Reveal>
              <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
                    СТОП<span className="text-fail">.</span>
                  </p>
                  <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-dim">
                    Ожидание <span className="font-mono text-[12.5px] text-ink">RESULT.md</span> от
                    Пользователя. Статус PASS устанавливает только человек после ручной проверки в
                    Edge — LLM не имеет права объявлять тесты пройденными (§5.6) и переходить
                    дальше после FAIL (§5.1).
                  </p>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[11.5px] text-faint">
                  <a href={DOC_ARCH} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                    docs/architecture.md <IconExt />
                  </a>
                  <a href={DOC_REG} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                    docs/РЕГЛАМЕНТ_РАБОТ_v2_0.md <IconExt />
                  </a>
                  <span className="mt-1 text-line2">—</span>
                  <span>отчёт собран по двум документам · сверка: {counts.total} пунктов</span>
                </div>
              </div>
            </Reveal>
          </div>
        </footer>
      </div>
    </div>
  );
}