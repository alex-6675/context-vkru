import { useState } from "react";
import Reveal from "./components/Reveal";
import Terminal from "./components/Terminal";
import ScoreRing from "./components/ScoreRing";
import ConformanceMatrix from "./components/ConformanceMatrix";
import Roadmap from "./components/Roadmap";
import Steps from "./components/Steps";
import V01Sheet, { type Verdict } from "./components/V01Sheet";
import V02Sheet from "./components/V02Sheet";
import V03Sheet from "./components/V03Sheet";
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
const DOC_3A =
  "https://github.com/alex-6675/context-vkru/blob/main-qwen_v_03/reports/report_2026-08-19.md";

const VERDICT_KEY = "ctxvkru-verdict-v03";

const extensionFiles = [
  "EdgeExtension/manifest.json",
  "EdgeExtension/_locales/ru/messages.json",
  "EdgeExtension/src/core/messaging.js",
  "EdgeExtension/src/adapters/vkru.js",
  "EdgeExtension/src/background.js",
  "EdgeExtension/src/content.js",
  "reports/v_03/BUILD.md",
  "reports/v_03/TEST.md",
  "reports/v_03/RESULT_v_03.md",
  "scripts/Build.ps1",
  "scripts/Clean.ps1",
  "scripts/Test.ps1",
];

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
      <p className="mt-2 max-w-3xl text-[14px] leading-relaxed text-dim sm:pl-[52px]">
        {sub}
      </p>
      <div className="mt-4 h-px w-full bg-gradient-to-r from-line2 via-line to-transparent" />
    </Reveal>
  );
}

/* ---------- приложение ---------- */

export default function App() {
  const [verdict, setVerdictState] = useState<Verdict>(() => {
    try {
      const raw = localStorage.getItem(VERDICT_KEY);
      if (raw === "pass" || raw === "fail") return raw;
    } catch {
      /* приватный режим */
    }
    return null;
  });

  const setVerdict = (v: Verdict) => {
    setVerdictState(v);
    try {
      if (v) localStorage.setItem(VERDICT_KEY, v);
      else localStorage.removeItem(VERDICT_KEY);
    } catch {
      /* приватный режим */
    }
  };

  const statusChip =
    verdict === "pass"
      ? { cls: "border-pass/50 bg-pass/10 text-pass", dot: "bg-pass", label: "v_03 · PASS" }
      : verdict === "fail"
        ? { cls: "border-fail/50 bg-fail/10 text-fail", dot: "bg-fail", label: "v_03 · FAIL" }
        : { cls: "border-warn/50 bg-warn/10 text-warn", dot: "bg-warn", label: "v_03 · ждёт Edge" };

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
              <span className="hidden items-center gap-1.5 border border-pass/40 bg-pass/[0.07] px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-pass/80 lg:flex">
                v_01 PASS
              </span>
              <span className="hidden items-center gap-1.5 border border-pass/40 bg-pass/[0.07] px-2.5 py-1.5 font-mono text-[10px] font-bold tracking-wider text-pass/80 md:flex">
                v_02 PASS
              </span>
              <a
                href={DOC_3A}
                target="_blank"
                rel="noreferrer"
                className="filter-btn hidden items-center gap-1.5 border border-line bg-panel px-3 py-1.5 font-mono text-[10.5px] tracking-wide text-dim hover:border-steel hover:text-ink lg:flex"
              >
                report_2026-08-19.md <IconExt />
              </a>
              <span
                className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10.5px] font-bold tracking-wider ${statusChip.cls}`}
              >
                <span className={`blink-soft h-1.5 w-1.5 rounded-full ${statusChip.dot}`} />
                {statusChip.label}
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
                  Шаг 3 / v_03 · адаптер собран по report_2026-08-19.md
                </p>
                <h1 className="mt-4 font-display text-[clamp(1.9rem,4.6vw,3.3rem)] font-extrabold leading-[1.08] tracking-tight text-ink">
                  <span className="text-pass">3A закрыт.</span>
                  <br />
                  <span className={verdict === "pass" ? "text-pass" : verdict === "fail" ? "text-fail" : "text-steel"}>
                    {verdict === "pass"
                      ? "v_03 принят — ждём M-04."
                      : verdict === "fail"
                        ? "FAIL — итерация внутри v_03."
                        : "Адаптер ищет сущности."}
                  </span>
                </h1>
                <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-dim">
                  Диагностика 3A.3 дала исчерпывающие данные: поиск — только по{" "}
                  <span className="font-mono text-[12.5px] text-ink">data-testid</span> (семантические
                  якоря VK), идентификация — только по нормализованному{" "}
                  <span className="font-mono text-[12.5px] text-ink">href</span>,{" "}
                  <span className="font-mono text-[12.5px] text-fail">vkit-*</span> не используются.
                  Собран <span className="font-mono text-[13px] text-ink">v_03 «VK.RU Adapter: обнаружение»</span>:
                  комментарии включая треды и посты → ENTITY + живой{" "}
                  <span className="font-mono text-[12.5px] text-ink">sourceElement</span> →{" "}
                  <span className="font-mono text-[12.5px] text-steel">ctx:entity-found</span> в Service
                  Worker. Только «обнаружил → сообщил»: без ▲, цвета, базы, маркера и storage.
                </p>
              </Reveal>

              <Reveal delay={120}>
                <div className="mt-6 flex flex-wrap gap-2">
                  <span className="border border-pass/40 bg-pass/[0.07] px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-pass/90">
                    v_01 PASS · v_02 PASS
                  </span>
                  <span
                    className={`border px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider ${
                      verdict === "pass"
                        ? "border-pass/50 bg-pass/10 text-pass"
                        : verdict === "fail"
                          ? "border-fail/50 bg-fail/10 text-fail"
                          : "border-warn/50 bg-warn/10 text-warn"
                    }`}
                  >
                    {verdict === "pass"
                      ? "v_03 · PASS зафиксирован"
                      : verdict === "fail"
                        ? "v_03 · FAIL зафиксирован"
                        : "v_03 · вердикт ожидается"}
                  </span>
                  <span className="border border-steel/50 bg-steel/10 px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider text-steel">
                    {verdict === "pass" ? "M-04 выдаёт проектировщик" : "пакет: 0.0.3 · plain MV3"}
                  </span>
                </div>
              </Reveal>

              <Reveal delay={200}>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-pass/80">
                      Пакет расширения · v_03 на диске
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {extensionFiles.map((f) => (
                        <span
                          key={f}
                          className="border border-pass/25 bg-pass/[0.06] px-2.5 py-1 font-mono text-[11px] text-dim transition-colors hover:border-pass/50 hover:text-ink"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
                      Шаблон · вне пакета (§2.2)
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {templateFiles.map((f) => (
                        <span
                          key={f}
                          className="border border-line bg-inset px-2.5 py-1 font-mono text-[11px] text-faint transition-colors hover:border-line2 hover:text-dim"
                        >
                          {f}
                        </span>
                      ))}
                    </div>
                    <p className="mt-2.5 text-[12.5px] leading-relaxed text-faint">
                      Сборки нет — plain MV3: пакет и есть артефакт. Node нужен лишь для этого
                      рабочего листа (<span className="font-mono text-[11.5px] text-dim">.nvmrc</span> →
                      Node 22 LTS).
                    </p>
                  </div>
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
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  Подтверждённые сборки
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold text-ink">
                  {verdict === "pass" ? 3 : 2}
                  <span className="text-lg text-faint"> / {stages.length}</span>
                </p>
                <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className={`progress-fill h-full rounded-full ${verdict === "pass" ? "w-[20%] bg-pass" : "w-[13%] bg-steel"}`}
                  />
                </div>
                <p className="mt-1.5 text-[12px] text-dim">
                  v_01 ✓ · v_02 ✓ · v_03 {verdict === "pass" ? "PASS" : verdict === "fail" ? "FAIL" : "на проверке"}
                </p>
              </div>

              <div className="bg-panel px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">
                  Пакет расширения
                </p>
                <p className="mt-2 font-display text-3xl font-extrabold text-ink">
                  0.0.3<span className="text-lg text-faint"> · MV3</span>
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-dim">
                  + adapters/vkru.js · обнаружение по data-testid · ключ — href
                </p>
              </div>

              <div className="bg-panel px-5 py-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-faint">Режим процесса</p>
                <p className="mt-2 font-display text-[15px] font-bold leading-snug text-steel">
                  Один модуль → одна сборка → один результат
                </p>
                <p className="mt-1.5 text-[12px] leading-snug text-dim">
                  До PASS в RESULT_v_03.md модуль M-04 не выдаётся (report_2026-08-19.md)
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* 01 — шаг 3 / v_03 */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="01"
            title="Шаг 3 · v_03 — VK.RU Adapter: обнаружение"
            sub="Рабочий лист сборки по заданию report_2026-08-19.md: итоговая таблица признаков 3A, конвейер обнаружения, дословные листинги пакета, загрузка в Edge и критерии TEST.md. Вердикт фиксируете вы — он сохраняется локально и управляет сводкой."
          />
          <V03Sheet verdict={verdict} setVerdict={setVerdict} />
        </section>

        {/* 02 — шаг 2 / v_02 (закрыт) */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="02"
            title="Шаг 2 · v_02 — диагностический канал · закрыт"
            sub="Историческая сборка: PING/PONG между content.js и Service Worker. Закрыта вердиктом PASS (RESULT_v_02.md, 19.08.2026); листинги оставлены для протокола, канал сохранён в v_03 как регрессия."
          />
          <V02Sheet verdict="pass" setVerdict={() => undefined} locked />
        </section>

        {/* 03 — шаг 1 / v_01 (закрыт) */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="03"
            title="Шаг 1 · v_01 — контрольный каркас · закрыт"
            sub="Историческая сборка: минимальный MV3-манифест, Service Worker и content script. Закрыта вердиктом PASS (RESULT_v_01.md, 18.08.2026); листинги оставлены для протокола."
          />
          <V01Sheet verdict="pass" setVerdict={() => undefined} locked />
        </section>

        {/* 04 — дорожная карта */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="04"
            title="Дорожная карта v_01 — v_15"
            sub="Часть 6 регламента: строго последовательно, один модуль — одна тестовая сборка. v_01 и v_02 зелёные (PASS подтверждены), v_03 пульсирует как текущая работа; клик раскрывает цель и PASS-критерий."
          />
          <Roadmap />
        </section>

        {/* 05 — матрица */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="05"
            title="Сверка с architecture.md"
            sub={`Постатейная проверка: границы и стек (§B), компоненты (§D), контракт ENTITY (§E), идентификация (§F–I), сценарий ПКМ (§J), отказ от legacy (§K), структура каталогов (§L). Всего ${counts.total} пунктов. Бейдж «файл · v_XX» — артефакт создан в соответствующей сборке, полная функция приходит по плану.`}
          />
          <ConformanceMatrix />
        </section>

        {/* 06 — контракт */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="06"
            title="Контракт ENTITY"
            sub="Часть 3 регламента: структура заморожена, компоненты обмениваются только ею. Полевые правила — что можно считать ключом, а что запрещено трогать; вопрос §F закрыт диагностикой 3A."
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

        {/* 07 — стек */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="07"
            title="Конфликт стека — решён разведением корней"
            sub="Единственный WARN аудита (§2.2): шаблон собран на том, что регламент запрещает внутри расширения. Пакет EdgeExtension/ пишется на Vanilla JS с нулём зависимостей — шаблон остаётся снаружи."
          />
          <div className="grid gap-5 md:grid-cols-2">
            <Reveal>
              <div className="cornered h-full border border-fail/30 bg-panel/80 p-5 sm:p-6">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-fail">
                  Как было · package.json
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
        </section>

        {/* 08 — чек-лист */}
        <section className="mx-auto max-w-6xl px-5 py-14">
          <SectionHead
            num="08"
            title="Чек-лист запуска"
            sub="Семь шагов старта проекта. Прогресс сохраняется локально; справа — шаблон задания M-01 по форме §7 как эталон формата для всех следующих модулей."
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
                    {verdict === "pass"
                      ? "RESULT_v_03.md зафиксирован: v_03 = PASS. По report_2026-08-19.md следующий модуль — M-04 (Navigation Target как отдельный контрольный этап); он не выдаётся до PASS — теперь выдача за проектировщиком."
                      : verdict === "fail"
                        ? "v_03 = FAIL: остаёмся внутри этапа (§5.1). Опишите причину в RESULT_v_03.md — при несовпадении data-testid с живым DOM правка селекторов выполняется внутри v_03 без изменения архитектуры."
                        : "Ожидание RESULT_v_03.md от Пользователя: обновите расширение (⟳) до 0.0.3 и пройдите TEST.md — ENTITY FOUND, подсветка sourceElement, дедупликация, ENTITY_FOUND в SW, регрессия PING/PONG. Статус устанавливает только человек (§5.6)."}
                  </p>
                </div>
                <div className="flex flex-col gap-2 font-mono text-[11.5px] text-faint">
                  <a href={DOC_ARCH} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                    docs/architecture.md <IconExt />
                  </a>
                  <a href={DOC_REG} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                    docs/РЕГЛАМЕНТ_РАБОТ_v2_0.md <IconExt />
                  </a>
                  <a href={DOC_3A} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition-colors hover:text-ink">
                    reports/report_2026-08-19.md (задание) <IconExt />
                  </a>
                  <span className="mt-1 text-line2">—</span>
                  <span>v_01 PASS · v_02 PASS · v_03: {verdict ? verdict.toUpperCase() : "ОЖИДАНИЕ"}</span>
                </div>
              </div>
            </Reveal>
          </div>
        </footer>
      </div>
    </div>
  );
}