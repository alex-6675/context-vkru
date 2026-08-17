import { useState } from "react";
import Reveal from "./Reveal";
import {
  v01Files,
  v01Tree,
  loadSteps,
  testBlock,
  flowNodes,
  buildResultMd,
} from "../data/v01";

export type Verdict = "pass" | "fail" | null;

/* ---------- подсветка листингов ---------- */

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function highlight(code: string): string {
  let html = escapeHtml(code);
  // один проход: блочные/строчные комментарии и строки (без вложений)
  html = html.replace(
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|"(?:[^"\\\n]|\\.)*")/g,
    (m) =>
      m.startsWith('"')
        ? `<span class="tok-str">${m}</span>`
        : `<span class="tok-com">${m}</span>`,
  );
  html = html.replace(
    /\b(const|let|var|return|if|else|new|function|of|in|typeof|await|async|this)\b/g,
    '<span class="tok-kw">$1</span>',
  );
  html = html.replace(
    /\b(true|false|null|undefined)\b/g,
    '<span class="tok-lit">$1</span>',
  );
  html = html.replace(
    /\b(chrome|console|location|document|window)\b/g,
    '<span class="tok-obj">$1</span>',
  );
  html = html.replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
  return html;
}

/* ---------- копирование ---------- */

function CopyBtn({ text }: { text: string }) {
  const [state, setState] = useState<"idle" | "ok" | "err">("idle");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setState("ok");
    } catch {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setState("ok");
      } catch {
        setState("err");
      }
    }
    setTimeout(() => setState("idle"), 1800);
  };

  return (
    <button
      onClick={copy}
      className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[10.5px] font-bold uppercase tracking-wider transition-all ${
        state === "ok"
          ? "border-pass/60 bg-pass/15 text-pass"
          : state === "err"
            ? "border-fail/60 bg-fail/15 text-fail"
            : "border-line2 bg-panel2 text-dim hover:border-steel hover:text-ink"
      }`}
    >
      {state === "ok" ? (
        <>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <path d="M2 6.2L4.8 9L10 3.4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          скопировано
        </>
      ) : state === "err" ? (
        "не удалось"
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
            <rect x="1.5" y="1.5" width="7" height="7" stroke="currentColor" strokeWidth="1.3" />
            <path d="M4 10.5h6.5V4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          копировать
        </>
      )}
    </button>
  );
}

/* ---------- поток шага ---------- */

type NodeState = "done" | "current" | "pending" | "pass" | "fail";

function flowStates(verdict: Verdict): Record<string, NodeState> {
  if (verdict === "pass")
    return { create: "done", load: "done", check: "done", verdict: "pass", stop: "done" };
  if (verdict === "fail")
    return { create: "done", load: "done", check: "done", verdict: "fail", stop: "current" };
  return { create: "done", load: "current", check: "pending", verdict: "pending", stop: "pending" };
}

function NodeDot({ st }: { st: NodeState }) {
  if (st === "done" || st === "pass")
    return (
      <span className="flex h-6 w-6 items-center justify-center border border-pass/60 bg-pass/15">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2 6.2L4.8 9L10 3.4" stroke="var(--color-pass)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  if (st === "fail")
    return (
      <span className="flex h-6 w-6 items-center justify-center border border-fail/60 bg-fail/15">
        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
          <path d="M2.5 2.5l7 7m0-7l-7 7" stroke="var(--color-fail)" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
    );
  if (st === "current")
    return (
      <span className="pulse-now flex h-6 w-6 items-center justify-center border-2 border-steel bg-steel/20">
        <span className="h-1.5 w-1.5 rounded-full bg-steel" />
      </span>
    );
  return <span className="h-6 w-6 border border-line2 bg-panel" />;
}

/* ---------- рабочий лист ---------- */

export default function V01Sheet({
  verdict,
  setVerdict,
}: {
  verdict: Verdict;
  setVerdict: (v: Verdict) => void;
}) {
  const [tab, setTab] = useState(0);
  const [note, setNote] = useState("");
  const file = v01Files[tab];
  const states = flowStates(verdict);
  const lines = file.code.split("\n").length;
  const bytes = new TextEncoder().encode(file.code).length;

  const downloadResult = () => {
    if (!verdict) return;
    const blob = new Blob([buildResultMd(verdict, note.trim())], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "RESULT_v_01.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* левая колонка: поток + дерево пакета */}
        <div className="space-y-6">
          <Reveal>
            <div className="cornered border border-line bg-panel/80 p-5">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
                  Поток шага 1
                </p>
                <span
                  className={`font-mono text-[10px] font-bold uppercase tracking-wider ${
                    verdict === "pass"
                      ? "text-pass"
                      : verdict === "fail"
                        ? "text-fail"
                        : "text-warn"
                  }`}
                >
                  {verdict === "pass"
                    ? "PASS принят"
                    : verdict === "fail"
                      ? "FAIL · итерация"
                      : "ждём Edge"}
                </span>
              </div>

              <div className="relative mt-4">
                <div className="absolute bottom-3 left-[11px] top-3 w-px bg-line" />
                <div className="space-y-4">
                  {flowNodes.map((n) => {
                    const st = states[n.id];
                    return (
                      <div key={n.id} className="relative flex gap-3.5">
                        <div className="relative z-10">
                          <NodeDot st={st} />
                        </div>
                        <div className="pt-0.5">
                          <p
                            className={`text-[13px] font-semibold leading-snug ${
                              st === "pending" ? "text-faint" : st === "fail" ? "text-fail" : "text-ink"
                            }`}
                          >
                            {n.label}
                          </p>
                          <p className="mt-0.5 font-mono text-[10.5px] leading-relaxed text-faint">
                            {n.sub}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="cornered border border-line bg-inset/80">
              <p className="border-b border-line px-4 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
                Пакет v_01
              </p>
              <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[11px] leading-[1.8] text-dim">
                {v01Tree}
              </pre>
            </div>
          </Reveal>
        </div>

        {/* правая колонка: код */}
        <Reveal delay={80}>
          <div className="cornered flex h-full flex-col border border-line bg-inset/90">
            {/* вкладки */}
            <div className="flex flex-wrap items-center gap-1 border-b border-line px-3 pt-3">
              {v01Files.map((f, i) => (
                <button
                  key={f.path}
                  onClick={() => setTab(i)}
                  className={`tab-btn relative cursor-pointer px-3.5 py-2 font-mono text-[11.5px] font-bold tracking-wide transition-colors ${
                    i === tab ? "tab-active text-ink" : "text-faint hover:text-dim"
                  }`}
                >
                  {f.name}
                </button>
              ))}
              <div className="ml-auto hidden pb-1 sm:block">
                <CopyBtn text={file.code} />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-line bg-panel/50 px-4 py-2">
              <p className="truncate font-mono text-[10.5px] text-faint">{file.path}</p>
              <p className="shrink-0 font-mono text-[10.5px] text-faint">
                {lines} стр · {bytes} Б · Vanilla JS
              </p>
            </div>

            {/* листинг */}
            <div className="code-scroll flex-1 overflow-auto">
              <div className="grid w-max min-w-full grid-cols-[auto_1fr]">
                <pre className="select-none border-r border-line bg-panel/40 px-3 py-4 text-right font-mono text-[12px] leading-[1.75] text-[#3d4f63]">
                  {file.code
                    .split("\n")
                    .map((_, i) => i + 1)
                    .join("\n")}
                </pre>
                <pre
                  className="px-4 py-4 font-mono text-[12px] leading-[1.75] text-dim"
                  dangerouslySetInnerHTML={{ __html: highlight(file.code) }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-2.5">
              <p className="font-mono text-[10.5px] text-steel">{file.note}</p>
              <div className="sm:hidden">
                <CopyBtn text={file.code} />
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* загрузка + тест */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div className="cornered h-full border border-line bg-panel/80 p-5 sm:p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
              Как собрать и загрузить
            </p>
            <ol className="mt-4 space-y-4">
              {loadSteps.map((s, i) => (
                <li key={s.t} className="flex gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center border border-steel/50 bg-steel/10 font-mono text-[11px] font-bold text-steel">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-[13.5px] font-semibold leading-snug text-ink">{s.t}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-dim">{s.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={100}>
          <div className="cornered h-full border border-line bg-panel/80 p-5 sm:p-6">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
              TEST.md · критерии
            </p>
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                  Предусловия
                </p>
                <ul className="mt-2 space-y-1.5">
                  {testBlock.pre.map((t) => (
                    <li key={t} className="flex gap-2.5 text-[12.5px] leading-relaxed text-dim">
                      <span className="mt-[7px] h-1 w-1 shrink-0 bg-steel" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-pass">
                  PASS — всё из списка
                </p>
                <ul className="mt-2 space-y-1.5">
                  {testBlock.pass.map((t) => (
                    <li key={t} className="flex gap-2.5 font-mono text-[11.5px] leading-relaxed text-dim">
                      <span className="mt-0.5 shrink-0 text-pass">+</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-fail">
                  FAIL — любой из признаков
                </p>
                <ul className="mt-2 space-y-1.5">
                  {testBlock.fail.map((t) => (
                    <li key={t} className="flex gap-2.5 font-mono text-[11.5px] leading-relaxed text-dim">
                      <span className="mt-0.5 shrink-0 text-fail">−</span>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      {/* рекордер RESULT */}
      <Reveal>
        <div
          className={`cornered border p-5 transition-colors duration-500 sm:p-6 ${
            verdict === "pass"
              ? "border-pass/50 bg-pass/[0.06]"
              : verdict === "fail"
                ? "border-fail/50 bg-fail/[0.06]"
                : "border-line bg-panel/80"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-faint">
              RESULT.md · вердикт Пользователя (§5.6)
            </p>
            <p className="font-mono text-[10.5px] text-faint">
              LLM статус не присваивает — выбор за вами
            </p>
          </div>

          {verdict === null ? (
            <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto]">
              <div>
                <p className="max-w-2xl text-[14px] leading-relaxed text-dim">
                  Сборка на месте. Загрузите её в Edge по инструкции выше, сверьте строки в
                  консолях — и зафиксируйте результат. Без RESULT.md переход к{" "}
                  <span className="font-mono text-[12.5px] text-steel">v_02 «Диагностический канал»</span>{" "}
                  запрещён (§4).
                </p>
                <input
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Комментарий к RESULT.md (необязательно): наблюдения, логи, версии…"
                  className="mt-4 w-full border border-line bg-inset px-4 py-2.5 font-mono text-[12px] text-ink outline-none transition-colors placeholder:text-faint focus:border-steel"
                />
              </div>
              <div className="flex flex-row gap-3 lg:flex-col lg:justify-center">
                <button
                  onClick={() => setVerdict("pass")}
                  className="verdict-btn flex-1 cursor-pointer border border-pass/60 bg-pass/10 px-8 py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-pass transition-all hover:bg-pass/20 hover:shadow-[0_0_32px_-8px_var(--color-pass)] active:translate-y-px lg:flex-none"
                >
                  PASS
                </button>
                <button
                  onClick={() => setVerdict("fail")}
                  className="verdict-btn flex-1 cursor-pointer border border-fail/60 bg-fail/10 px-8 py-3.5 font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-fail transition-all hover:bg-fail/20 hover:shadow-[0_0_32px_-8px_var(--color-fail)] active:translate-y-px lg:flex-none"
                >
                  FAIL
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="max-w-2xl">
                <p
                  className={`font-display text-xl font-extrabold tracking-tight ${
                    verdict === "pass" ? "text-pass" : "text-fail"
                  }`}
                >
                  {verdict === "pass" ? "PASS · v_01 принят" : "FAIL · остаёмся в v_01"}
                </p>
                <p className="mt-2 text-[13.5px] leading-relaxed text-dim">
                  {verdict === "pass"
                    ? "Контрольный каркас подтверждён вручную. Следующий модуль — M-02 / v_02: обмен PING/PONG между content.js и background.js. Запросите задание — соберу по шаблону §7, со своей стороны ничего не начинаю."
                    : "Перескакивать запрещено (§5.1): сравните признаки FAIL с логом Service Worker и консолью страницы, опишите причину — и повторите тест в пределах v_01."}
                </p>
                <button
                  onClick={() => setVerdict(null)}
                  className="mt-3 cursor-pointer font-mono text-[10.5px] uppercase tracking-wider text-faint underline decoration-line underline-offset-4 transition-colors hover:text-dim"
                >
                  сбросить вердикт
                </button>
              </div>
              <div className="flex shrink-0 flex-col items-stretch gap-2">
                <button
                  onClick={downloadResult}
                  className="cursor-pointer border border-steel/60 bg-steel/10 px-5 py-2.5 font-mono text-[11px] font-bold uppercase tracking-wider text-steel transition-all hover:bg-steel/20 active:translate-y-px"
                >
                  ↓ Скачать RESULT.md
                </button>
                <p className="text-center font-mono text-[9.5px] text-faint">
                  → в reports/v_01/
                </p>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}