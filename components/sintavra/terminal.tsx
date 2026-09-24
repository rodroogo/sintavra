"use client";
import { useState, useRef, useEffect } from "react";
import { parseCommand } from "@/lib/core/commands";
import { languages, getLanguage } from "@/lib/content";
import { conceptStatus, xpFor, type Attempt } from "@/lib/core/progress";
import type { Locale } from "@/lib/i18n";
export function Terminal({
  locale,
  attempts,
  onNavigate,
  onLanguage,
  onLesson,
  onQuiz,
  name,
}: {
  locale: Locale;
  attempts: Attempt[];
  onNavigate: (view: string) => void;
  onLanguage: (id: string) => void;
  onLesson: (id: string) => void;
  onQuiz: (id: string, exam?: boolean) => void;
  name: string;
}) {
  const en = locale === "en";
  const [history, setHistory] = useState<string[]>([
    "SINTAVRA 0.1.0\n" +
      (en
        ? "Type help to see available commands."
        : "Escribe ayuda para ver los comandos disponibles."),
  ]);
  const [input, setInput] = useState("");
  const [commands, setCommands] = useState<string[]>([]);
  const [cursor, setCursor] = useState(0);
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => {
    bottom.current?.scrollIntoView({ block: "nearest" });
  }, [history]);
  function execute() {
    const raw = input.trim();
    if (!raw) return;
    setCommands((c) => [...c, raw]);
    setCursor(commands.length + 1);
    setInput("");
    let output = "";
    const cmd = parseCommand(raw);
    const language = getLanguage(cmd.language || "python");
    if (cmd.name === "limpiar") {
      setHistory([]);
      return;
    }
    if (["ayuda", ""].includes(cmd.name))
      output =
        "sintavra aprender <python|cpp|c|javascript|java|csharp|lua>\nsintavra manual <lenguaje> <concepto>\nsintavra practicar <lenguaje>\nsintavra desafio <lenguaje>\nsintavra examen <lenguaje>\nsintavra proyectos\nsintavra progreso\nsintavra debilidades\nsintavra tutor\nsintavra pista\nsintavra explicar\nsintavra lenguajes\nsintavra configuracion\nsintavra ui\nlimpiar";
    else if (cmd.name === "lenguajes")
      output = languages
        .map(
          (l) =>
            l.name +
            " · " +
            l.lessons.length +
            " " +
            (en ? "lessons" : "lecciones") +
            (l.runner
              ? " · runner"
              : " · " + (en ? "manual + quizzes" : "manual + pruebas")),
        )
        .join("\n");
    else if (cmd.name === "progreso")
      output =
        languages
          .map((l) => {
            const n = l.lessons.filter(
              (x) => conceptStatus(attempts, x.id) === "mastered",
            ).length;
            return `${l.name.padEnd(12)} ${n}/${l.lessons.length} ${en ? "mastered" : "dominados"}`;
          })
          .join("\n") +
        "\nXP: " +
        xpFor(attempts);
    else if (cmd.name === "debilidades")
      output =
        languages
          .flatMap((l) =>
            l.lessons
              .filter((x) => conceptStatus(attempts, x.id) === "practice")
              .map((x) => l.name + " / " + (en ? x.titleEn : x.title)),
          )
          .join("\n") ||
        (en
          ? "No weak concepts recorded yet."
          : "Todavía no hay conceptos débiles registrados.");
    else if (
      ["aprender", "practicar", "desafio", "manual", "examen"].includes(
        cmd.name,
      )
    ) {
      if (!language)
        output = en
          ? "Unknown language. Use lenguajes."
          : "Lenguaje desconocido. Usa lenguajes.";
      else {
        onLanguage(language.id);
        const lesson =
          language.lessons.find((l) =>
            [
              l.id,
              l.concept,
              l.title.toLowerCase(),
              l.titleEn.toLowerCase(),
            ].some((s) => s.includes(cmd.topic.toLowerCase())),
          ) || language.lessons[0];
        if (cmd.name === "examen") onQuiz(language.id, true);
        else if (cmd.name === "practicar" || cmd.name === "desafio")
          onQuiz(lesson.id);
        else if (cmd.name === "manual") {
          output =
            (en ? lesson.titleEn : lesson.title) +
            "\n\n" +
            (en ? lesson.bodyEn : lesson.body) +
            "\n\n" +
            lesson.code;
        } else onLesson(lesson.id);
      }
    } else if (
      [
        "ui",
        "configuracion",
        "proyectos",
        "tutor",
        "pista",
        "explicar",
      ].includes(cmd.name)
    )
      onNavigate(
        (
          {
            ui: "home",
            configuracion: "settings",
            proyectos: "projects",
            tutor: "tutor",
            pista: "tutor",
            explicar: "tutor",
          } as Record<string, string>
        )[cmd.name],
      );
    else
      output = en
        ? "Command not recognized. Type help."
        : "Comando no reconocido. Escribe ayuda.";
    setHistory((h) =>
      [...h, `sintavra@${name || "estudiante"}:~$ ${raw}`, output].filter(
        Boolean,
      ),
    );
  }
  return (
    <section className="terminal-workspace">
      <div className="terminal-top">
        <span>&gt;_ Terminal Mode</span>
        <span>UTF-8 / {locale.toUpperCase()}</span>
      </div>
      <div className="terminal-history" role="log">
        {history.map((line, i) => (
          <pre
            key={i}
            className={line.startsWith("sintavra@") ? "prompt-line" : ""}
          >
            {line}
          </pre>
        ))}
        <div ref={bottom} />
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          execute();
        }}
      >
        <label htmlFor="terminal-input">
          sintavra@{name || "estudiante"}:~$
        </label>
        <input
          id="terminal-input"
          autoComplete="off"
          spellCheck={false}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") {
              e.preventDefault();
              const n = Math.max(0, cursor - 1);
              setCursor(n);
              setInput(commands[n] || "");
            }
            if (e.key === "ArrowDown") {
              e.preventDefault();
              const n = Math.min(commands.length, cursor + 1);
              setCursor(n);
              setInput(commands[n] || "");
            }
          }}
        />
        <button type="submit" className="sr-only">
          Enter
        </button>
      </form>
      <p className="terminal-foot">
        {en
          ? "Same account. Same progress. Your commands stay inside Sintavra."
          : "Misma cuenta. Mismo progreso. Tus comandos se quedan dentro de Sintavra."}
      </p>
    </section>
  );
}
