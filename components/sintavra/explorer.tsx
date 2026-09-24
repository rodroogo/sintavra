"use client";
import { useState } from "react";
import {
  MousePointer2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  tokenize,
  lookupToken,
  explainLine,
  traceFor,
} from "@/lib/education/dictionary";
import type { Locale } from "@/lib/i18n";
export function Explorer({
  code,
  language,
  concept,
  locale,
  onTouch,
  challenge,
}: {
  code: string;
  language: string;
  concept?: string;
  locale: Locale;
  onTouch?: (token: string, line: string) => void;
  challenge?: string;
}) {
  const [selected, setSelected] = useState<number[]>([]);
  const [step, setStep] = useState(0);
  const [showTrace, setShowTrace] = useState(false);
  const lines = code.split("\n");
  const en = locale === "en";
  const trace = traceFor(concept || "inicio", language);
  function selectLine(index: number, shift: boolean) {
    if (shift && selected.length) {
      const start = selected[0];
      setSelected(
        Array.from(
          { length: Math.abs(index - start) + 1 },
          (_, i) => Math.min(start, index) + i,
        ),
      );
    } else setSelected([index]);
  }
  return (
    <div className="explorer">
      <div className="explorer-toolbar">
        <span>
          <MousePointer2 size={16} />
          {challenge ||
            (en ? "Touch a piece of code" : "Toca una pieza del código")}
        </span>
        {concept && (
          <button
            className="text-button"
            onClick={() => setShowTrace(!showTrace)}
          >
            <Layers3 size={16} />
            {en ? "Trace this example" : "Recorrer este ejemplo"}
          </button>
        )}
      </div>
      <div
        className="interactive-code"
        role="group"
        aria-label={en ? "Interactive code" : "Código interactivo"}
      >
        {lines.map((line, index) => (
          <div
            className={
              "interactive-line " + (selected.includes(index) ? "selected" : "")
            }
            key={index}
          >
            <button
              className="line-number"
              aria-label={
                (en ? "Explain line " : "Explicar línea ") + (index + 1)
              }
              title={
                en
                  ? "Shift + click: select a range"
                  : "Mayús + clic: seleccionar un rango"
              }
              onClick={(e) => selectLine(index, e.shiftKey)}
            >
              {selected.includes(index) ? <Check size={12} /> : index + 1}
            </button>
            <code>
              {tokenize(line).map((token, j) => {
                if (/^\s+$/.test(token)) return <span key={j}>{token}</span>;
                const d = lookupToken(token, line, language);
                return (
                  <Popover key={j}>
                    <PopoverTrigger asChild>
                      <button
                        className={
                          "code-token " +
                          (/^['"]/.test(token)
                            ? "string"
                            : /^\d/.test(token)
                              ? "number"
                              : /^(def|return|for|if|else|const|let|int|local|function|class|public|static|using|import)$/.test(
                                    token,
                                  )
                                ? "keyword"
                                : "")
                        }
                        onClick={() => onTouch?.(token, line)}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          e.currentTarget.click();
                        }}
                        aria-label={(en ? "Inspect " : "Inspeccionar ") + token}
                      >
                        {token}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="dictionary-popover"
                      side="bottom"
                      align="start"
                    >
                      <span className="eyebrow">
                        CODE DICTIONARY · {language}
                      </span>
                      <h3>
                        <code>{token}</code>
                        <span>{d.name}</span>
                      </h3>
                      <p>{d.meaning}</p>
                      <h4>{en ? "In this line" : "Qué hace aquí"}</h4>
                      <pre>{line.trim()}</pre>
                      <p>{d.here}</p>
                      <h4>{en ? "Minimal example" : "Ejemplo mínimo"}</h4>
                      <pre>{d.example}</pre>
                      <small>
                        {en ? "Related" : "Relacionados"}:{" "}
                        {d.related.join(" · ") || "—"}
                      </small>
                    </PopoverContent>
                  </Popover>
                );
              })}
              {!line && " "}
            </code>
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="line-explanation">
          <span className="eyebrow">
            {en ? "THE PIECES TOGETHER" : "LAS PIEZAS JUNTAS"} ·{" "}
            {selected.map((i) => i + 1).join(", ")}
          </span>
          {selected.map((i) => (
            <div key={i}>
              <code>{lines[i]}</code>
              <p>{explainLine(lines[i], language)}</p>
            </div>
          ))}
        </div>
      )}
      {showTrace && (
        <div className="execution-trace">
          <div>
            <span className="eyebrow">
              {en
                ? "GUIDED TRACE OF THE ORIGINAL EXAMPLE"
                : "RECORRIDO GUIADO DEL EJEMPLO ORIGINAL"}
            </span>
            <p>
              {en
                ? "This annotated trace explains the lesson example. Run edited code in the editor for its actual output."
                : "Este recorrido anotado explica el ejemplo de la lección. Ejecuta el código modificado en el editor para ver su salida real."}
            </p>
          </div>
          <div className="trace-state">
            <span>{trace[step].label}</span>
            <code>{trace[step].value}</code>
            <pre>{trace[step].output || "—"}</pre>
          </div>
          <div className="row">
            <button
              className="btn secondary small"
              aria-label={en ? "Previous step" : "Paso anterior"}
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              {step + 1} / {trace.length}
            </span>
            <button
              className="btn secondary small"
              aria-label={en ? "Next step" : "Paso siguiente"}
              disabled={step === trace.length - 1}
              onClick={() => setStep(step + 1)}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
