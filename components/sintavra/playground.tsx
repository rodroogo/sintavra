"use client";
import { useEffect, useRef, useState } from "react";
import {
  Play,
  Square,
  RotateCcw,
  Download,
  Save,
  TerminalSquare,
  Loader2,
} from "lucide-react";
import { Code } from "./code";
import { runCode } from "@/lib/runner";
import type { Language } from "@/lib/content";
import { copy, type Locale } from "@/lib/i18n";
export function downloadFile(name: string, text: string, type = "text/plain") {
  const u = URL.createObjectURL(new Blob([text], { type }));
  const a = document.createElement("a");
  a.href = u;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(u), 1000);
}
export function Playground({
  language,
  code,
  onChange,
  original,
  locale,
  fontSize,
  onSave,
  compact = false,
  onResult,
}: {
  language: Language;
  code: string;
  onChange: (s: string) => void;
  original: string;
  locale: Locale;
  fontSize: number;
  onSave: () => void;
  compact?: boolean;
  onResult?: (output: string) => void;
}) {
  const t = copy[locale];
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const [stdin, setStdin] = useState("");
  const stop = useRef<(() => void) | null>(null);
  const result = useRef("");
  const [error, setError] = useState(false);
  useEffect(() => () => stop.current?.(), [language.id]);
  function run() {
    setOutput("");
    result.current = "";
    setError(false);
    setRunning(true);
    try {
      stop.current = runCode(language.id, code, stdin, (m) => {
        if (m.type === "output") {
          result.current += (m.text || "") + "\n";
          setOutput(result.current.slice(0, 64000));
        }
        if (m.type === "error") {
          setError(true);
          setOutput(result.current + "\n" + m.text);
          setRunning(false);
        }
        if (m.type === "done") {
          setRunning(false);
          onResult?.(result.current);
        }
      });
    } catch (e) {
      setRunning(false);
      setError(true);
      setOutput(String(e));
    }
  }
  return (
    <section className={"playground " + (compact ? "compact" : "")}>
      <div className="editor-toolbar">
        <span className="filename">
          <span className="file-dot" />
          main.{language.ext}
        </span>
        <div className="toolbar-actions">
          <button
            className="icon-btn"
            title={t.save}
            aria-label={t.save}
            onClick={onSave}
          >
            <Save size={16} />
          </button>
          <button
            className="icon-btn"
            title={t.download}
            aria-label={t.download}
            onClick={() => downloadFile("main." + language.ext, code)}
          >
            <Download size={16} />
          </button>
          <button
            className="icon-btn"
            title={t.reset}
            aria-label={t.reset}
            onClick={() => onChange(original)}
          >
            <RotateCcw size={16} />
          </button>
          {running ? (
            <button
              className="btn primary small"
              onClick={() => {
                stop.current?.();
                setRunning(false);
                setOutput((x) => x + "\n" + t.stop);
              }}
            >
              <Square size={14} />
              {t.stop}
            </button>
          ) : (
            <button
              className="btn primary small"
              disabled={!language.runner}
              onClick={run}
            >
              <Play size={14} />
              {t.run}
            </button>
          )}
        </div>
      </div>
      {!language.runner && (
        <p className="runner-setup">
          {locale === "es"
            ? "El motor integrado de este lenguaje todavía no está incluido en este prototipo. El editor y las explicaciones están disponibles."
            : "This language runtime is not yet bundled in this prototype. Editing and explanations are available."}
        </p>
      )}
      <Code
        key={language.id}
        value={code}
        language={language.id}
        onChange={onChange}
        fontSize={fontSize}
      />
      <div className="console">
        <div className="console-title">
          <span>
            <TerminalSquare size={15} />
            {t.console}
          </span>
          {running ? (
            <span>
              <Loader2 className="spin" size={14} />
              {t.loading}
            </span>
          ) : (
            <span>{language.runner ? "browser runtime" : t.runnerPending}</span>
          )}
        </div>
        <pre className={error ? "error-output" : ""} aria-live="polite">
          {output ||
            (language.runner
              ? locale === "es"
                ? "La salida de tu programa aparecerá aquí."
                : "Your program output will appear here."
              : locale === "es"
                ? "Puedes editar y descargar. Motor integrado pendiente."
                : "You can edit and download. Enable the local runtime to execute.")}
        </pre>
        <label className="stdin">
          <span>{t.stdin}</span>
          <textarea
            rows={2}
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
            placeholder={
              language.id === "javascript" ? "readLine()" : "input()"
            }
          />
        </label>
      </div>
    </section>
  );
}
