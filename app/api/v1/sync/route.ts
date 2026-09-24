import { z } from "zod";
import { database } from "@/lib/server/db";
import { identify, body, json, fail, HttpError } from "@/lib/server/http";
import { learningStateSchema } from "@/lib/server/state-schema";
import { questionBank } from "@/lib/education/questions";
import { getLesson, getLanguage } from "@/lib/content";
const submission = z.object({
  strategy: z.enum(["combine", "local"]),
  locale: z.enum(["es", "en"]),
  state: learningStateSchema.extend({
    attempts: z
      .array(
        z
          .object({
            id: z.string().max(150),
            lessonId: z.string().max(60),
            kind: z.string().max(20),
            createdAt: z.number().min(0),
            local: z.boolean().optional(),
            responses: z
              .array(
                z.object({
                  id: z.string().max(80),
                  choice: z.string().max(3000),
                }),
              )
              .max(3)
              .optional(),
          })
          .passthrough(),
      )
      .max(1000),
  }),
});
export async function POST(req: Request) {
  try {
    const user = await identify(req, true);
    const parsed = submission.safeParse(await body(req));
    if (!parsed.success)
      throw new HttpError(400, "El progreso local no tiene un formato válido.");
    const { state, strategy, locale } = parsed.data;
    const db = database();
    const profile = await db
      .prepare("SELECT * FROM profiles WHERE user_id=?")
      .bind(user.userId)
      .first<{ updated_at: number }>();
    if ((profile?.updated_at || 0) !== state.revision)
      throw new HttpError(
        409,
        "El progreso de la cuenta cambió. Exporta tu copia y recarga antes de sincronizar.",
      );
    const previous = await db
      .prepare(
        "SELECT id,lesson_id AS lessonId,score,total,hints,kind,created_at AS createdAt FROM attempts WHERE user_id=?",
      )
      .bind(user.userId)
      .all();
    const imported = [];
    for (const attempt of state.attempts) {
      if (!attempt.local || !attempt.responses) continue;
      const lesson = getLesson(attempt.lessonId);
      const lang = getLanguage(attempt.lessonId.split("-")[0]);
      if (!lesson || !lang) continue;
      const bank = questionBank(lesson, lang, locale === "en").slice(
        0,
        attempt.kind === "exam" ? 2 : 3,
      );
      if (
        attempt.responses.length !== bank.length ||
        new Set(attempt.responses.map((r) => r.id)).size !== bank.length
      )
        throw new HttpError(400, "Prueba local incompleta.");
      let score = 0;
      for (const q of bank) {
        const answer = attempt.responses.find((r) => r.id === q.id);
        const alternate = questionBank(lesson, lang, locale !== "en").find(
          (x) => x.id === q.id,
        )!;
        if (
          !answer ||
          (!q.options.includes(answer.choice) &&
            !alternate.options.includes(answer.choice))
        )
          throw new HttpError(400, "Respuesta local no válida.");
        if (
          answer.choice === q.options[q.answer] ||
          answer.choice === alternate.options[alternate.answer]
        )
          score++;
      }
      imported.push({
        id: attempt.id,
        lessonId: lesson.id,
        score,
        total: bank.length,
        hints: 0,
        kind: attempt.kind === "exam" ? "exam-local" : "quiz-local",
        createdAt: Math.min(attempt.createdAt, Date.now()),
      });
    }
    const revision = Math.max(Date.now(), state.revision + 1);
    const encoded = [
      JSON.stringify(state.settings),
      JSON.stringify(state.drafts),
      JSON.stringify(state.projects),
      JSON.stringify(state.lessonProgress),
    ];
    const matches =
      "EXISTS (SELECT 1 FROM profiles WHERE user_id=? AND updated_at=?)";
    const statements = [
      db
        .prepare(
          "INSERT OR IGNORE INTO profiles (user_id,updated_at) VALUES (?,0)",
        )
        .bind(user.userId),
    ];
    if (strategy === "local") {
      statements.push(
        db
          .prepare(
            "INSERT INTO backups (id,user_id,snapshot,created_at) SELECT ?,?,?,? WHERE " +
              matches,
          )
          .bind(
            crypto.randomUUID(),
            user.userId,
            JSON.stringify({ profile, attempts: previous.results }),
            Date.now(),
            user.userId,
            state.revision,
          ),
      );
      statements.push(
        db
          .prepare("DELETE FROM attempts WHERE user_id=? AND " + matches)
          .bind(user.userId, user.userId, state.revision),
      );
    }
    for (const a of imported)
      statements.push(
        db
          .prepare(
            "INSERT OR IGNORE INTO attempts (id,user_id,lesson_id,score,total,hints,kind,created_at) SELECT ?,?,?,?,?,?,?,? WHERE " +
              matches,
          )
          .bind(
            user.userId + ":" + a.id,
            user.userId,
            a.lessonId,
            a.score,
            a.total,
            a.hints,
            a.kind,
            a.createdAt,
            user.userId,
            state.revision,
          ),
      );
    statements.push(
      db
        .prepare(
          "UPDATE profiles SET settings=?,drafts=?,projects=?,lesson_progress=?,updated_at=? WHERE user_id=? AND updated_at=?",
        )
        .bind(...encoded, revision, user.userId, state.revision),
    );
    const results = await db.batch(statements);
    if (!results[results.length - 1].meta.changes)
      throw new HttpError(
        409,
        "Conflicto de sincronización. Tu copia local está conservada.",
      );
    const attempts = await db
      .prepare(
        "SELECT id,lesson_id AS lessonId,score,total,hints,kind,created_at AS createdAt FROM attempts WHERE user_id=? ORDER BY created_at",
      )
      .bind(user.userId)
      .all();
    return json({ ...state, attempts: attempts.results, revision });
  } catch (e) {
    return fail(e);
  }
}
