"use client";
import { useState } from "react";
import { ArrowRight, CheckCircle2, FolderCode } from "lucide-react";
import { getLanguage, languages } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import { Progress } from "@/components/ui/progress";
import { Playground } from "./playground";
const steps = [
  {
    es: "Crea dos variables: a vale 8 y b vale 2. Muestra su suma.",
    en: "Create two variables: a is 8 and b is 2. Print their sum.",
    expected: "10",
  },
  {
    es: "Ahora muestra suma, resta, multiplicación y división, una por línea.",
    en: "Now print addition, subtraction, multiplication and division, one per line.",
    expected: "10\n6\n16\n4",
  },
  {
    es: "Define una función sumar(a, b). Muestra sumar(3, 4) y sumar(0, 0).",
    en: "Define a sumar(a, b) function. Print sumar(3, 4) and sumar(0, 0).",
    expected: "7\n0",
  },
  {
    es: 'Añade dividir(a, b): si b vale cero muestra "No definido". Muestra dividir(8, 2) y dividir(8, 0).',
    en: 'Add dividir(a, b): if b is zero print "No definido". Print dividir(8, 2) and dividir(8, 0).',
    expected: "4\nNo definido",
  },
];
export function Projects({
  locale,
  projects,
  onUpdate,
  onSave,
  fontSize,
}: {
  locale: Locale;
  projects: Record<string, { code: string; step: number }>;
  onUpdate: (id: string, p: { code: string; step: number }) => void;
  onSave: () => void;
  fontSize: number;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  const [passed, setPassed] = useState(false);
  const [checked, setChecked] = useState(false);
  const en = locale === "en";
  const language = getLanguage(selected || "python")!;
  const project = projects[selected || "python"] || {
    step: 0,
    code:
      selected === "java"
        ? "public class Main { public static void main(String[] args) {\n    // Tu código\n} }"
        : selected === "csharp"
          ? "using System;\nclass MainClass { static void Main() {\n    // Tu código\n} }"
          : selected === "c"
            ? "#include <stdio.h>\nint main(void) {\n    // Tu código\n    return 0;\n}"
            : selected === "cpp"
              ? "#include <iostream>\nint main() {\n    // Tu código\n}"
              : selected === "lua"
                ? "-- Tu código\n"
                : selected === "python"
                  ? "# Tu código\n"
                  : "// Tu código\n",
  };
  const step = steps[Math.min(project.step, steps.length - 1)];
  if (!selected)
    return (
      <>
        <div className="section-heading">
          <div>
            <span className="eyebrow">PROJECT MODE</span>
            <h1>
              {en
                ? "Build something you understand."
                : "Construye algo que entiendas."}
            </h1>
            <p className="muted">
              {en
                ? "Four steps. Your own code. No finished solution to copy."
                : "Cuatro pasos. Tu propio código. Sin una solución terminada que copiar."}
            </p>
          </div>
          <FolderCode size={30} />
        </div>
        <div className="project-grid">
          {languages
            .map((l) => l.id)
            .map((id) => (
              <button
                className="project-card"
                key={id}
                onClick={() => setSelected(id)}
              >
                <span className="eyebrow">
                  {getLanguage(id)!.name} · {en ? "4 steps" : "4 pasos"}
                </span>
                <div className="project-glyph">+ − × ÷</div>
                <h2>
                  {en
                    ? "A calculator that checks"
                    : "Una calculadora que comprueba"}
                </h2>
                <p>
                  {en
                    ? "Variables, functions and division by zero."
                    : "Variables, funciones y división entre cero."}
                </p>
                <Progress value={(projects[id]?.step || 0) * 25} />
                <span>
                  {projects[id]?.step || 0}/4 <ArrowRight size={17} />
                </span>
              </button>
            ))}
        </div>
      </>
    );
  return (
    <>
      <div className="section-heading">
        <div>
          <button className="text-button" onClick={() => setSelected(null)}>
            ← {en ? "All projects" : "Todos los proyectos"}
          </button>
          <h1>
            {en ? "Your calculator" : "Tu calculadora"}{" "}
            <span className="muted">/ {language.name}</span>
          </h1>
        </div>
        <span className="badge">{Math.min(project.step + 1, 4)} / 4</span>
      </div>
      <div className="project-brief">
        <h3>
          {project.step >= 4
            ? en
              ? "Project self-check completed"
              : "Autocomprobación del proyecto completada"
            : en
              ? "Your next step"
              : "Tu siguiente paso"}
        </h3>
        <p>
          {project.step >= 4
            ? en
              ? "Try different inputs and explain how each function works. These local output checks do not prove the required code structure."
              : "Prueba otras entradas y explica cada función. Estas comprobaciones locales de salida no demuestran que usaste la estructura de código solicitada."
            : en
              ? step.en
              : step.es}
        </p>
        <details>
          <summary>{en ? "Expected output" : "Salida esperada"}</summary>
          <pre>{step.expected}</pre>
        </details>
      </div>
      <Playground
        language={language}
        locale={locale}
        code={project.code}
        onChange={(code) => {
          onUpdate(selected, { ...project, code });
          setPassed(false);
          setChecked(false);
        }}
        original=""
        fontSize={fontSize}
        onSave={onSave}
        onResult={(out) => {
          const normalize = (s: string) =>
            s
              .trim()
              .split("\n")
              .map((l) => l.trim().replace(/^(\d+)\.0$/, "$1"))
              .join("\n");
          setPassed(normalize(out) === step.expected);
          setChecked(true);
        }}
      />
      {checked && (
        <p className={passed ? "success-text" : "error-output"}>
          {passed
            ? en
              ? "Output matches. Now verify your code uses the requested structure."
              : "La salida coincide. Verifica ahora que tu código utiliza la estructura solicitada."
            : en
              ? "Output differs. Compare line by line with the expected result."
              : "La salida difiere. Compara cada línea con el resultado esperado."}
        </p>
      )}
      {project.step < 4 && (
        <button
          className="btn primary"
          disabled={!passed}
          onClick={() => {
            onUpdate(selected, { ...project, step: project.step + 1 });
            setPassed(false);
            setChecked(false);
          }}
        >
          <CheckCircle2 size={17} />
          {en ? "I checked my code · next" : "Revisé mi código · siguiente"}
        </button>
      )}
    </>
  );
}
