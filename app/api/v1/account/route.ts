import { database } from "@/lib/server/db";
import { identify, json, fail } from "@/lib/server/http";
export async function DELETE(req: Request) {
  try {
    const user = await identify(req, true);
    const db = database();
    await db.batch(
      ["profiles", "attempts", "quizzes", "backups"].map((table) =>
        db.prepare(`DELETE FROM ${table} WHERE user_id=?`).bind(user.userId),
      ),
    );
    return json({ deleted: true });
  } catch (e) {
    return fail(e);
  }
}
