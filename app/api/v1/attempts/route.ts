import { database } from "@/lib/server/db";
import { identify, body, json, fail, HttpError } from "@/lib/server/http";
import type { Question } from "@/lib/server/questions";
export async function POST(req: Request) {
  try {
    const user = await identify(req, true);
    const data = await body(req);
    const db = database();
    const quiz = await db
      .prepare("SELECT * FROM quizzes WHERE id=? AND user_id=?")
      .bind(String(data.quizId || ""), user.userId)
      .first<{
        id: string;
        questions: string;
        created_at: number;
        kind: string;
        hints: number;
        submitted_at: number | null;
      }>();
    if (!quiz) throw new HttpError(404, "Prueba no encontrada.");
    if (Date.now() - quiz.created_at > 86400000)
      throw new HttpError(410, "La prueba venció. Comienza una nueva.");
    const questions: Question[] = JSON.parse(quiz.questions);
    if (
      !Array.isArray(data.answers) ||
      data.answers.length !== questions.length ||
      data.answers.some(
        (a: unknown) => !Number.isInteger(a) || Number(a) < 0 || Number(a) > 2,
      )
    )
      throw new HttpError(400, "Responde todas las preguntas.");
    if (quiz.submitted_at)
      throw new HttpError(
        409,
        "Esta prueba ya fue evaluada. Actualiza tu progreso.",
      );
    const groups = new Map<string, { score: number; total: number }>();
    const feedback = questions.map((q, i) => {
      const correct = q.answer === data.answers[i];
      const g = groups.get(q.lessonId) || { score: 0, total: 0 };
      g.total++;
      if (correct) g.score++;
      groups.set(q.lessonId, g);
      return {
        id: q.id,
        lessonId: q.lessonId,
        correct,
        answer: q.answer,
        explanation: q.explanation,
      };
    });
    const now = Date.now();
    const rows = [...groups].map(([lessonId, g]) => ({
      id: quiz.id + ":" + lessonId,
      lessonId,
      ...g,
      hints: quiz.hints,
      kind: quiz.kind,
      createdAt: now,
    }));
    await db.batch([
      ...rows.map((a) =>
        db
          .prepare(
            "INSERT OR IGNORE INTO attempts (id,user_id,lesson_id,score,total,hints,kind,created_at) VALUES (?,?,?,?,?,?,?,?)",
          )
          .bind(
            a.id,
            user.userId,
            a.lessonId,
            a.score,
            a.total,
            a.hints,
            a.kind,
            a.createdAt,
          ),
      ),
      db
        .prepare(
          "UPDATE quizzes SET submitted_at=? WHERE id=? AND user_id=? AND submitted_at IS NULL",
        )
        .bind(now, quiz.id, user.userId),
    ]);
    return json({ feedback, attempts: rows });
  } catch (e) {
    return fail(e);
  }
}
