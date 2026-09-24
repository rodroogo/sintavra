import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  conceptStatus,
  xpFor,
  dueLessons,
  studyStreak,
} from "../lib/core/progress.ts";
import { parseCommand } from "../lib/core/commands.ts";
const day = 86400000,
  now = Date.UTC(2026, 8, 23, 12);
const attempt = (id, date, score = 3, hints = 0) => ({
  id,
  lessonId: "python-bucles",
  score,
  total: 3,
  hints,
  createdAt: date,
  kind: "quiz",
});
test("mastery needs independent success on separate days", () => {
  assert.equal(conceptStatus([], "python-bucles", now), "pending");
  assert.equal(
    conceptStatus(
      [attempt("a", now), attempt("b", now + 1000)],
      "python-bucles",
      now,
    ),
    "learning",
  );
  assert.equal(
    conceptStatus(
      [attempt("a", now - day), attempt("b", now)],
      "python-bucles",
      now,
    ),
    "mastered",
  );
  assert.equal(
    conceptStatus(
      [attempt("a", now - day, 3, 1), attempt("b", now)],
      "python-bucles",
      now,
    ),
    "learning",
  );
  assert.equal(
    conceptStatus(
      [attempt("a", now - day), attempt("b", now, 0)],
      "python-bucles",
      now,
    ),
    "practice",
  );
});
test("repeating an identical exercise cannot farm XP", () => {
  assert.equal(xpFor([attempt("a", now), attempt("b", now + 1)]), 30);
});
test("review queue prioritizes failed older attempts, not unseen lessons", () => {
  assert.deepEqual(
    dueLessons(
      [attempt("a", now - day - 1, 1)],
      ["python-bucles", "cpp-inicio"],
      now,
    ),
    ["python-bucles"],
  );
});
test("streak handles yesterday and gaps", () => {
  assert.equal(
    studyStreak([attempt("a", now - day), attempt("b", now - 2 * day)], now),
    2,
  );
  assert.equal(studyStreak([attempt("a", now - 3 * day)], now), 0);
});
test("terminal normalizes aliases without executing shell commands", () => {
  assert.deepEqual(parseCommand("sintavra learn c++ bucles"), {
    name: "aprender",
    language: "cpp",
    topic: "bucles",
  });
  assert.equal(parseCommand("rm -rf /").name, "rm");
});
test("all seven content modules have unique IDs and valid prerequisites", () => {
  const modules = fs
    .readdirSync("content/languages")
    .map((f) => JSON.parse(fs.readFileSync("content/languages/" + f)));
  assert.equal(modules.length, 7);
  const lessons = modules.flatMap((m) => m.lessons);
  const ids = new Set(lessons.map((l) => l.id));
  assert.equal(ids.size, 42);
  for (const l of lessons) {
    assert.ok(l.body.length > 80);
    assert.ok(l.bodyEn.length > 80);
    assert.ok(l.code.length > 20);
    for (const p of l.prerequisites) assert.ok(ids.has(p));
  }
});
