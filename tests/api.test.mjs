import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
const require = createRequire(import.meta.url);
const runtimeRequire = createRequire(require.resolve("wrangler"));
const { Miniflare } = runtimeRequire("miniflare");
const root = path.resolve("dist/server");
const files = fs
  .readdirSync(root, { recursive: true })
  .filter((f) => /\.(m?js)$/.test(f));
files.sort((a, b) =>
  a === "index.js" ? -1 : b === "index.js" ? 1 : a.localeCompare(b),
);
const mf = new Miniflare({
  modules: files.map((file) => ({
    type: "ESModule",
    path: path.join(root, file),
  })),
  modulesRoot: root,
  compatibilityDate: "2026-05-15",
  compatibilityFlags: ["nodejs_compat"],
  d1Databases: { DB: "test-db" },
  cf: false,
});
const db = await mf.getD1Database("DB");
for (const file of fs
  .readdirSync("drizzle")
  .filter((f) => f.endsWith(".sql"))
  .sort())
  for (const sql of fs
    .readFileSync("drizzle/" + file, "utf8")
    .split("--> statement-breakpoint")
    .filter((s) => s.trim()))
    await db.prepare(sql).run();
const headers = {
  "oai-authenticated-user-id": "test-student-a",
  "oai-authenticated-user-email": "test-a@example.invalid",
  "Content-Type": "application/json",
  Origin: "https://sintavra.test",
};
async function call(route, method = "GET", data, custom = headers) {
  const response = await mf.dispatchFetch(
    "https://sintavra.test/api/v1/" + route,
    {
      method,
      headers: custom,
      body: data === undefined ? undefined : JSON.stringify(data),
    },
  );
  let value;
  try {
    value = await response.json();
  } catch {
    value = {};
  }
  return { status: response.status, value };
}
try {
  assert.equal(
    (await call("state", "GET", undefined, {})).status,
    401,
    "anonymous state rejected",
  );
  const initial = await call("state");
  assert.equal(initial.status, 200);
  assert.equal(initial.value.attempts.length, 0);
  const data = {
    settings: {
      locale: "es",
      theme: "dark",
      mode: "guided",
      language: "python",
      lastLesson: "python-inicio",
      fontSize: 15,
      displayName: "Test",
    },
    drafts: { "python-inicio": "print(1)" },
    projects: {},
    revision: 0,
  };
  const saved = await call("state", "PUT", data);
  assert.equal(saved.status, 200);
  assert.ok(saved.value.revision > 0);
  assert.equal(
    (await call("state", "PUT", data)).status,
    409,
    "stale revisions rejected",
  );
  assert.equal(
    (
      await call(
        "state",
        "PUT",
        { ...data, revision: saved.value.revision },
        { ...headers, Origin: "https://untrusted.invalid" },
      )
    ).status,
    403,
    "cross-origin writes rejected",
  );
  const other = await call("state", "GET", undefined, {
    ...headers,
    "oai-authenticated-user-id": "test-student-b",
  });
  assert.deepEqual(other.value.drafts, {});
  const quiz = await call("quiz", "POST", {
    lessonId: "python-variables",
    kind: "quiz",
    locale: "es",
  });
  assert.equal(quiz.status, 200);
  assert.equal(quiz.value.questions.length, 3);
  assert.ok(!("answer" in quiz.value.questions[0]));
  const truth = await db
    .prepare("SELECT questions FROM quizzes WHERE id=?")
    .bind(quiz.value.id)
    .first();
  const answers = JSON.parse(truth.questions).map((q) => q.answer);
  const attempt = await call("attempts", "POST", {
    quizId: quiz.value.id,
    answers,
  });
  assert.equal(attempt.status, 200);
  assert.equal(attempt.value.attempts[0].score, 3);
  assert.equal(
    (await call("attempts", "POST", { quizId: quiz.value.id, answers })).status,
    409,
    "repeat grading rejected",
  );
  assert.equal((await call("state")).value.attempts.length, 1);
  assert.equal(
    (
      await call(
        "attempts",
        "POST",
        { quizId: quiz.value.id, answers },
        { ...headers, "oai-authenticated-user-id": "test-student-b" },
      )
    ).status,
    404,
    "other account cannot submit quiz",
  );
  const exam = await call("quiz", "POST", {
    lessonId: "cpp",
    kind: "exam",
    locale: "en",
  });
  assert.equal(exam.value.questions.length, 12);
  const current = (await call("state")).value;
  const localQuestions = JSON.parse(truth.questions);
  const localAttempt = {
    id: "offline-test",
    lessonId: "python-variables",
    kind: "quiz",
    createdAt: Date.now(),
    local: true,
    score: 999,
    total: 999,
    responses: localQuestions.map((q) => ({
      id: q.id,
      choice: q.options[q.answer],
    })),
  };
  const sync = await call("sync", "POST", {
    strategy: "combine",
    locale: "en",
    state: { ...current, attempts: [localAttempt] },
  });
  assert.equal(sync.status, 200, JSON.stringify(sync.value));
  assert.equal(sync.value.attempts.length, 2);
  assert.equal(
    sync.value.attempts.find((a) => a.id.endsWith("offline-test")).score,
    3,
    "local score regraded, not trusted",
  );
  const again = await call("sync", "POST", {
    strategy: "combine",
    locale: "en",
    state: { ...sync.value, attempts: [localAttempt] },
  });
  assert.equal(again.status, 200);
  assert.equal(again.value.attempts.length, 2, "local import idempotent");
  const replace = await call("sync", "POST", {
    strategy: "local",
    locale: "es",
    state: { ...again.value, attempts: [localAttempt] },
  });
  assert.equal(replace.status, 200);
  assert.equal(replace.value.attempts.length, 1);
  assert.equal(
    (await db.prepare("SELECT count(*) AS n FROM backups").first()).n,
    1,
  );
  assert.equal((await call("account", "DELETE", {})).status, 200);
  assert.equal((await call("state")).value.attempts.length, 0);
  console.log(
    "PASS: auth, persistence, revision conflict, CSRF, account isolation, quiz grading, replay prevention, exams and deletion.",
  );
} finally {
  await mf.dispose();
}
