import { database } from "@/lib/server/db";
import { identify, body, json, fail, HttpError } from "@/lib/server/http";
import { createQuestions } from "@/lib/server/questions";
export async function POST(req: Request) {
  try {
    const user = await identify(req, true);
    const data = await body(req);
    const db = database();
    const now = Date.now();
    const count = await db
      .prepare(
        "SELECT COUNT(*) AS n FROM quizzes WHERE user_id=? AND created_at>?",
      )
      .bind(user.userId, now - 60000)
      .first<{ n: number }>();
    if ((count?.n || 0) >= 15)
      throw new HttpError(
        429,
        "Espera un minuto antes de comenzar otra prueba.",
      );
    if (typeof data.lessonId !== "string")
      throw new HttpError(400, "Lección no válida.");
    const kind = data.kind === "exam" ? "exam" : "quiz";
    const questions = createQuestions(
      data.lessonId,
      data.locale,
      kind === "exam",
    );
    if (!questions.length) throw new HttpError(400, "Lección no encontrada.");
    const id = crypto.randomUUID();
    await db
      .prepare(
        "INSERT INTO quizzes (id,user_id,lesson_id,questions,kind,created_at,hints) VALUES (?,?,?,?,?,?,0)",
      )
      .bind(
        id,
        user.userId,
        data.lessonId,
        JSON.stringify(questions),
        kind,
        now,
      )
      .run();
    await db
      .prepare("DELETE FROM quizzes WHERE user_id=? AND created_at<?")
      .bind(user.userId, now - 7 * 86400000)
      .run();
    return json({
      id,
      kind,
      createdAt: now,
      questions: questions.map((q) => ({
        id: q.id,
        lessonId: q.lessonId,
        prompt: q.prompt,
        options: q.options,
      })),
    });
  } catch (e) {
    return fail(e);
  }
}
