import { sqliteTable, text, integer, index } from "drizzle-orm/sqlite-core";
export const profiles = sqliteTable("profiles", {
  userId: text("user_id").primaryKey(),
  lessonProgress: text("lesson_progress").notNull().default("{}"),
  settings: text("settings").notNull().default("{}"),
  drafts: text("drafts").notNull().default("{}"),
  projects: text("projects").notNull().default("{}"),
  updatedAt: integer("updated_at").notNull(),
});
export const attempts = sqliteTable(
  "attempts",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    score: integer("score").notNull(),
    total: integer("total").notNull(),
    hints: integer("hints").notNull().default(0),
    kind: text("kind").notNull(),
    createdAt: integer("created_at").notNull(),
  },
  (t) => [index("attempt_owner_time").on(t.userId, t.createdAt)],
);
export const quizzes = sqliteTable(
  "quizzes",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull(),
    lessonId: text("lesson_id").notNull(),
    questions: text("questions").notNull(),
    kind: text("kind").notNull(),
    createdAt: integer("created_at").notNull(),
    submittedAt: integer("submitted_at"),
    hints: integer("hints").notNull().default(0),
  },
  (t) => [index("quiz_owner_time").on(t.userId, t.createdAt)],
);

export const backups = sqliteTable("backups", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  snapshot: text("snapshot").notNull(),
  createdAt: integer("created_at").notNull(),
});
