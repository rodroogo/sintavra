import { database } from "@/lib/server/db";
import { identify, fail } from "@/lib/server/http";
export async function GET(req: Request) {
  try {
    const user = await identify(req);
    const result = await database()
      .prepare(
        "SELECT snapshot,created_at AS createdAt FROM backups WHERE user_id=? ORDER BY created_at DESC",
      )
      .bind(user.userId)
      .all<{ snapshot: string; createdAt: number }>();
    return new Response(
      JSON.stringify(
        result.results.map((row) => ({
          createdAt: row.createdAt,
          data: JSON.parse(row.snapshot),
        })),
        null,
        2,
      ),
      {
        headers: {
          "Content-Type": "application/json",
          "Content-Disposition": 'attachment; filename="sintavra-backups.json"',
          "Cache-Control": "no-store",
        },
      },
    );
  } catch (e) {
    return fail(e);
  }
}
