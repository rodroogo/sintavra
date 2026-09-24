import type { Question } from "./questions";
import type { Attempt } from "@/lib/core/progress";
export function uniqueId() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
}
export function gradeLocal(
  id: string,
  questions: Question[],
  answers: number[],
  kind: string,
  now = Date.now(),
) {
  const feedback = questions.map((q, i) => ({
    id: q.id,
    lessonId: q.lessonId,
    correct: q.answer === answers[i],
    answer: q.answer,
    explanation: q.explanation,
  }));
  const groups = new Map<string, Attempt>();
  questions.forEach((q, i) => {
    const a = groups.get(q.lessonId) || {
      id: "local-" + id + ":" + q.lessonId,
      lessonId: q.lessonId,
      score: 0,
      total: 0,
      hints: 0,
      kind,
      createdAt: now,
      local: true,
      responses: [],
    };
    a.total++;
    if (feedback[i].correct) a.score++;
    a.responses!.push({ id: q.id, choice: q.options[answers[i]] });
    groups.set(q.lessonId, a);
  });
  return { feedback, attempts: [...groups.values()] };
}
