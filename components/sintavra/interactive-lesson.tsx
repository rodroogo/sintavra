"use client";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  MousePointer2,
  Play,
  Layers3,
  ClipboardCheck,
  Hammer,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Explorer } from "./explorer";
import { Playground } from "./playground";
import type { Lesson, Language } from "@/lib/content";
import type { Locale } from "@/lib/i18n";
import type { LessonProgress } from "./use-learning";
const phases = [
  { id: "discover", es: "Descubrir", en: "Discover", icon: MousePointer2 },
  { id: "understand", es: "Entender", en: "Understand", icon: Layers3 },
  { id: "check", es: "Comprobar", en: "Check", icon: ClipboardCheck },
  { id: "modify", es: "Modificar", en: "Modify", icon: Code2 },
  { id: "run", es: "Escribir", en: "Write", icon: Play },
  { id: "apply", es: "Construir", en: "Build", icon: Hammer },
];
const targetByConcept: Record<string, string[]> = {
  inicio: ["print", "cout", "printf", "WriteLine", "println", "puts"],
  variables: ["="],
  condicionales: [">="],
  bucles: ["for"],
  funciones: ["numero"],
  colecciones: ["notas"],
};
export function InteractiveLesson({
  lesson,
  language,
  locale,
  code,
  onCode,
  fontSize,
  onSave,
  onQuiz,
  onProject,
  progress,
  onProgress,
  level,
  weak,
}: {
  lesson: Lesson;
  language: Language;
  locale: Locale;
  code: string;
  onCode: (s: string) => void;
  fontSize: number;
  onSave: () => void;
  onQuiz: () => void;
  onProject: () => void;
  progress: LessonProgress;
  onProgress: (p: LessonProgress) => void;
  level: string;
  weak: boolean;
}) {
  const en = locale === "en";
  const phase = phases[Math.min(progress.stage, 5)];
  const [selectedCorrect, setSelectedCorrect] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [hints, setHints] = useState(0);
  const [lastOutput, setLastOutput] = useState("");
  const [solution, setSolution] = useState(false);
  const [successfulRun, setSuccessfulRun] = useState(false);
  const setStage = (id: string) =>
    onProgress({
      ...progress,
      stage: phases.findIndex((p) => p.id === id),
      updatedAt: Date.now(),
    });
  function touch(token: string, line: string) {
    if (!progress.touched.includes(token))
      onProgress({
        ...progress,
        touched: [...progress.touched, token].slice(-80),
        updatedAt: Date.now(),
      });
    if (phase.id === "check") {
      const correct =
        targetByConcept[lesson.concept].includes(token) &&
        (lesson.concept !== "funciones" ||
          /def |function |int doble|int Doble/.test(line));
      setSelectedCorrect(correct);
      setFeedback(
        correct
          ? en
            ? "Yes. Now explain how it works with the rest of the line."
            : "Sí. Ahora explica cómo funciona junto con el resto de la línea."
          : en
            ? "Look at its position and try another piece."
            : "Mira su posición y prueba otra pieza.",
      );
    }
  }
  const challenge = (
    {
      inicio: en
        ? "Select the name that produces output."
        : "Marca el nombre que produce la salida.",
      variables: en
        ? "Select the operator that assigns a value."
        : "Marca el operador que asigna un valor.",
      condicionales: en
        ? "Select the comparison operator."
        : "Marca el operador de comparación.",
      bucles: en
        ? "Select the keyword that starts the loop."
        : "Marca la palabra que inicia el bucle.",
      funciones: en
        ? "Select the parameter in the function definition."
        : "Marca el parámetro en la definición de la función.",
      colecciones: en
        ? "Select the name of the collection."
        : "Marca el nombre de la colección.",
    } as Record<string, string>
  )[lesson.concept];
  function template() {
    if (lesson.concept === "funciones")
      return lesson.code.replace(/return numero \* 2/, "return ______");
    if (lesson.concept === "variables")
      return lesson.code.replace(/= 12/, "= ______");
    if (lesson.concept === "bucles")
      return lesson.code
        .replace(/<= 5/, "<= ______")
        .replace(/range\(1, 6\)/, "range(1, ______)")
        .replace(/i = 1, 5/, "i = 1, ______");
    if (lesson.concept === "condicionales")
      return lesson.code.replace(/>= 18/, ">= ______");
    return lesson.code
      .replace(/"Hola[^"\n]*"/, "______")
      .replace(/12, 16, 18/, "______, 16, 18");
  }
  const adaptive = weak
    ? en
      ? "Let’s break it down: inspect one line, predict its effect, then run it."
      : "Vamos por partes: inspecciona una línea, predice su efecto y ejecútala."
    : level === "advanced" || level === "intermediate"
      ? en
        ? "You can skip to writing. Demonstrate the concept with a fresh test when ready."
        : "Puedes pasar directamente a escribir. Demuestra el concepto con una prueba nueva cuando estés listo."
      : en
        ? "Touch any symbol. Use the line number to see how its pieces work together."
        : "Toca cualquier símbolo. Usa el número de línea para ver cómo trabajan juntas sus piezas.";
  return (
    <section className="interactive-lesson">
      <div className="lesson-learning-heading">
        <span className="eyebrow">
          {language.name} / {en ? lesson.titleEn : lesson.title}
        </span>
        <h1>
          {en ? "Read it with your hands." : "Lee el código con las manos."}
        </h1>
        <p>{adaptive}</p>
      </div>
      <Tabs value={phase.id} onValueChange={setStage}>
        <TabsList className="phase-tabs">
          {phases.map((p, i) => (
            <TabsTrigger key={p.id} value={p.id}>
              <p.icon size={15} />
              <span>
                {i + 1}. {en ? p.en : p.es}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value="discover">
          <Explorer
            code={lesson.code}
            language={language.id}
            concept={lesson.concept}
            locale={locale}
            onTouch={touch}
          />
          <div className="phase-footer">
            <span>
              {progress.touched.length}{" "}
              {en ? "pieces explored" : "piezas exploradas"}
            </span>
            <button
              className="btn primary"
              onClick={() => setStage("understand")}
            >
              {en ? "See how it works together" : "Ver cómo funciona junto"}
              <ArrowRight size={16} />
            </button>
          </div>
        </TabsContent>
        <TabsContent value="understand">
          <Explorer
            code={lesson.code}
            language={language.id}
            concept={lesson.concept}
            locale={locale}
            onTouch={touch}
          />
          <div className="lesson-connection">
            <h3>
              {en
                ? "What the program does as a whole"
                : "Qué hace el programa en conjunto"}
            </h3>
            <p>{en ? lesson.bodyEn : lesson.body}</p>
            <p className="muted">{en ? lesson.pitfallEn : lesson.pitfall}</p>
          </div>
          <button className="btn primary" onClick={() => setStage("check")}>
            {en ? "Let me try" : "Déjame intentarlo"}
            <ArrowRight size={16} />
          </button>
        </TabsContent>
        <TabsContent value="check">
          <h2 className="checkpoint-title">{challenge}</h2>
          <Explorer
            code={lesson.code}
            language={language.id}
            locale={locale}
            onTouch={touch}
            challenge={challenge}
          />
          {feedback && (
            <p
              className={selectedCorrect ? "success-text" : "error-output"}
              role="status"
            >
              {feedback}
            </p>
          )}
          <div className="row wrap">
            <button className="btn secondary" onClick={onQuiz}>
              {en
                ? "Predict the output · 3 questions"
                : "Predice la salida · 3 preguntas"}
            </button>
            <button
              className="btn primary"
              disabled={!selectedCorrect}
              onClick={() => setStage("modify")}
            >
              {en ? "Modify the code" : "Modificar el código"}
              <ArrowRight size={16} />
            </button>
          </div>
        </TabsContent>
        <TabsContent value="modify">
          <div className="project-brief">
            <h3>
              {en
                ? "A piece is missing. Make it work."
                : "Falta una pieza. Haz que funcione."}
            </h3>
            <p>
              {en
                ? "Load the incomplete example, replace the blank and run it. This replaces the current lesson draft."
                : "Carga el ejemplo incompleto, sustituye el hueco y ejecútalo. Esto reemplaza el borrador actual de la lección."}
            </p>
            <button
              className="btn secondary"
              onClick={() => {
                onCode(template());
                setSuccessfulRun(false);
              }}
            >
              {en ? "Load incomplete example" : "Cargar ejemplo incompleto"}
            </button>
          </div>
          <Playground
            language={language}
            code={code}
            onChange={onCode}
            original={lesson.code}
            locale={locale}
            fontSize={fontSize}
            onSave={onSave}
            onResult={(out) => {
              setLastOutput(out);
              setSuccessfulRun(true);
            }}
          />
          <div className="phase-footer">
            <span>
              {successfulRun
                ? en
                  ? "Program finished. Compare its output with your prediction."
                  : "El programa terminó. Compara la salida con tu predicción."
                : en
                  ? "Running alone does not prove the solution is correct."
                  : "Ejecutar por sí solo no demuestra que la solución sea correcta."}
            </span>
            <button className="btn primary" onClick={() => setStage("run")}>
              {en ? "Write it yourself" : "Escríbelo tú"}
              <ArrowRight size={16} />
            </button>
          </div>
        </TabsContent>
        <TabsContent value="run">
          <div className="project-brief">
            <h3>{en ? lesson.exerciseEn : lesson.exercise}</h3>
            <p>
              {en
                ? "Use the editor without copying the original. Run, read errors and revise."
                : "Usa el editor sin copiar el original. Ejecuta, lee los errores y revisa."}
            </p>
            <div className="row wrap">
              <button
                className="btn secondary"
                disabled={hints >= 3}
                onClick={() => setHints(hints + 1)}
              >
                {en ? "Another hint" : "Otra pista"} {hints}/3
              </button>
              {hints >= 3 && (
                <button
                  className="text-button"
                  onClick={() => setSolution(!solution)}
                >
                  {en
                    ? "Review the worked example"
                    : "Revisar ejemplo resuelto"}
                </button>
              )}
            </div>
            {hints > 0 &&
              (en ? lesson.hintsEn : lesson.hints)
                .slice(0, hints)
                .map((h, i) => (
                  <p className="hint-box" key={i}>
                    {i + 1}. {h}
                  </p>
                ))}
            {solution && <pre>{lesson.code}</pre>}
          </div>
          <Playground
            language={language}
            code={code}
            onChange={onCode}
            original={lesson.code}
            locale={locale}
            fontSize={fontSize}
            onSave={onSave}
            onResult={(out) => {
              setLastOutput(out);
              setSuccessfulRun(true);
            }}
          />
          <button className="btn primary" onClick={() => setStage("apply")}>
            {en ? "Use it in a problem" : "Usarlo en un problema"}
            <ArrowRight size={16} />
          </button>
        </TabsContent>
        <TabsContent value="apply">
          <div className="application-brief">
            <span className="eyebrow">
              {en ? "TRANSFER WHAT YOU LEARNED" : "COMBINA LO QUE APRENDISTE"}
            </span>
            <h2>
              {lesson.concept === "funciones"
                ? en
                  ? "Introduce someone with a function."
                  : "Presenta a alguien con una función."
                : en
                  ? "Make a new version without the example."
                  : "Crea una versión nueva sin el ejemplo."}
            </h2>
            <p>
              {lesson.concept === "funciones"
                ? en
                  ? "Create a presentar function with name and age parameters. Return a sentence using both values. Call it twice with different arguments."
                  : "Crea una función presentar que reciba nombre y edad. Devuelve una frase con ambos datos. Llámala dos veces con argumentos diferentes."
                : en
                  ? "Change the data and one behavior. Before running, write down the output you expect. Explain the difference with the original."
                  : "Cambia los datos y un comportamiento. Antes de ejecutar, escribe la salida que esperas. Explica la diferencia con el original."}
            </p>
          </div>
          <Playground
            language={language}
            code={code}
            onChange={onCode}
            original={lesson.code}
            locale={locale}
            fontSize={fontSize}
            onSave={onSave}
            onResult={(out) => {
              setLastOutput(out);
              setSuccessfulRun(true);
            }}
          />
          <div className="row wrap">
            <button
              className="btn primary"
              disabled={!successfulRun}
              onClick={() =>
                onProgress({
                  ...progress,
                  completed: true,
                  updatedAt: Date.now(),
                })
              }
            >
              <CheckCircle2 size={17} />
              {progress.completed
                ? en
                  ? "Practice completed"
                  : "Práctica completada"
                : en
                  ? "I tested and explained my result"
                  : "Probé y expliqué mi resultado"}
            </button>
            <button className="btn secondary" onClick={onProject}>
              {en ? "Module project" : "Proyecto del módulo"}
              <ArrowRight size={16} />
            </button>
          </div>
          <p className="muted small-note">
            {en
              ? "Completion is your self-check. Concept mastery comes from separate tests."
              : "Completar es tu autocomprobación. El dominio del concepto procede de pruebas independientes."}
            {lastOutput
              ? ` · ${en ? "Last output" : "Última salida"}: ${lastOutput.slice(0, 60)}`
              : ""}
          </p>
        </TabsContent>
      </Tabs>
    </section>
  );
}
