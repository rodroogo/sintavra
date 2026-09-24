import { database } from "@/lib/server/db";
import { identify, body, json, fail, HttpError } from "@/lib/server/http";
import { learningStateSchema } from "@/lib/server/state-schema";
export async function GET(req: Request) {
  try {
    const user = await identify(req);
    const db = database();
    const profile = await db
      .prepare(
        "SELECT settings,drafts,projects,lesson_progress,updated_at FROM profiles WHERE user_id=?",
      )
      .bind(user.userId)
      .first<{
        settings: string;
        drafts: string;
        projects: string;
        lesson_progress: string;
        updated_at: number;
      }>();
    const attempts = await db
      .prepare(
        "SELECT id,lesson_id AS lessonId,score,total,hints,kind,created_at AS createdAt FROM attempts WHERE user_id=? ORDER BY created_at ASC LIMIT 5000",
      )
      .bind(user.userId)
      .all();
    return json({
      settings: profile ? JSON.parse(profile.settings) : {},
      drafts: profile ? JSON.parse(profile.drafts) : {},
      projects: profile ? JSON.parse(profile.projects) : {},
      lessonProgress: profile ? JSON.parse(profile.lesson_progress) : {},
      revision: profile?.updated_at || 0,
      attempts: attempts.results,
      user: { name: user.fullName || "Estudiante" },
    });
  } catch (e) {
    return fail(e);
  }
}
export async function PUT(req: Request) {
  try {
    const user = await identify(req, true);
    const parsed = learningStateSchema.safeParse(await body(req));
    if (!parsed.success)
      throw new HttpError(400, "Configuración o borrador no válido.");
    const data = parsed.data;
    const db = database();
    const now = Math.max(Date.now(), data.revision + 1);
    const encoded = [
      JSON.stringify(data.settings),
      JSON.stringify(data.drafts),
      JSON.stringify(data.projects),
      JSON.stringify(data.lessonProgress),
    ];
    if (data.revision === 0) {
      const r = await db
        .prepare(
          "INSERT OR IGNORE INTO profiles (user_id,settings,drafts,projects,lesson_progress,updated_at) VALUES (?,?,?,?,?,?)",
        )
        .bind(user.userId, ...encoded, now)
        .run();
      if (!r.meta.changes)
        throw new HttpError(
          409,
          "Hay cambios en otro dispositivo. Exporta tu copia antes de recargar.",
        );
    } else {
      const r = await db
        .prepare(
          "UPDATE profiles SET settings=?,drafts=?,projects=?,lesson_progress=?,updated_at=? WHERE user_id=? AND updated_at=?",
        )
        .bind(...encoded, now, user.userId, data.revision)
        .run();
      if (!r.meta.changes)
        throw new HttpError(
          409,
          "Hay cambios en otro dispositivo. Exporta tu copia antes de recargar.",
        );
    }
    return json({ revision: now });
  } catch (e) {
    return fail(e);
  }
}
