"use client";
import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { gradeLocal } from "@/lib/education/offline-quiz";
import type { Question } from "@/lib/education/questions";
import { api } from "./use-learning";
import type { Attempt } from "@/lib/core/progress";
import { copy, type Locale } from "@/lib/i18n";
export type QuizData = {
  local?: boolean;
  offlineQuestions?: Question[];
  id: string;
  kind: string;
  questions: {
    id: string;
    lessonId: string;
    prompt: string;
    options: string[];
  }[];
};
export function Quiz({
  quiz,
  locale,
  onComplete,
  onClose,
}: {
  quiz: QuizData;
  locale: Locale;
  onComplete: (a: Attempt[]) => void;
  onClose: () => void;
}) {
  const t = copy[locale];
  const [answers, setAnswers] = useState<number[]>(
    quiz.questions.map(() => -1),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<
    { correct: boolean; answer: number; explanation: string }[] | null
  >(null);
  async function submit() {
    setBusy(true);
    setError("");
    try {
      const r =
        quiz.local && quiz.offlineQuestions
          ? gradeLocal(quiz.id, quiz.offlineQuestions, answers, quiz.kind)
          : await api<{
              feedback: {
                correct: boolean;
                answer: number;
                explanation: string;
              }[];
              attempts: Attempt[];
            }>("attempts", "POST", { quizId: quiz.id, answers });
      setFeedback(r.feedback);
      onComplete(r.attempts);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="quiz-sheet">
      <div className="section-heading">
        <div>
          <span className="eyebrow">
            {quiz.kind === "exam" ? "EXAM MODE" : t.checks}
          </span>
          <h1>
            {locale === "es"
              ? "Sin el ejemplo delante."
              : "Without the example in front of you."}
          </h1>
        </div>
        <ShieldCheck size={30} />
      </div>
      <p className="muted">
        {locale === "es"
          ? "Aquí no hay pistas. Piensa en lo que haría el programa antes de elegir."
          : "No hints here. Think about what the program would do before choosing."}
      </p>
      {feedback && (
        <div className="result-banner">
          {feedback.filter((f) => f.correct).length} / {feedback.length} ·{" "}
          {locale === "es"
            ? "Resultado guardado. Revisa las explicaciones."
            : "Result saved. Review the explanations."}
        </div>
      )}
      {quiz.questions.map((q, i) => (
        <article className="question" key={q.id}>
          <div className="question-number">
            {String(i + 1).padStart(2, "0")}
          </div>
          <div>
            <pre className="question-prompt">{q.prompt}</pre>
            <RadioGroup
              disabled={!!feedback || busy}
              value={String(answers[i])}
              onValueChange={(v) =>
                setAnswers((a) => a.map((x, j) => (j === i ? Number(v) : x)))
              }
            >
              {q.options.map((option, j) => (
                <label
                  className={
                    "answer " +
                    (answers[i] === j ? "selected " : "") +
                    (feedback && feedback[i].answer === j ? "correct" : "")
                  }
                  key={j}
                >
                  <RadioGroupItem value={String(j)} id={q.id + "-" + j} />
                  <span>{option}</span>
                </label>
              ))}
            </RadioGroup>
            {feedback && (
              <p
                className={
                  "feedback " + (feedback[i].correct ? "right" : "wrong")
                }
              >
                {feedback[i].correct ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <XCircle size={18} />
                )}{" "}
                {feedback[i].explanation}
              </p>
            )}
          </div>
        </article>
      ))}
      {error && (
        <p role="alert" className="error-banner">
          {error}
        </p>
      )}
      <div className="row">
        <button className="btn secondary" onClick={onClose}>
          {feedback
            ? t.back
            : locale === "es"
              ? "Abandonar prueba"
              : "Leave test"}
        </button>
        {!feedback ? (
          <button
            className="btn primary"
            disabled={busy || answers.some((a) => a < 0)}
            onClick={submit}
          >
            {busy ? (
              <Loader2 className="spin" size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}{" "}
            {t.submit}
          </button>
        ) : (
          <button className="btn primary" onClick={onClose}>
            {t.continue}
            <ArrowRight size={17} />
          </button>
        )}
      </div>
    </section>
  );
}
