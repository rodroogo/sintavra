import { z } from "zod";
export const settingsSchema = z.object({
  locale: z.enum(["es", "en"]),
  theme: z.enum(["dark", "light", "system"]),
  mode: z.enum(["strict", "guided", "assist"]),
  language: z.string().max(20),
  lastLesson: z.string().max(60),
  fontSize: z.number().min(14).max(24),
  displayName: z.string().max(40),
  level: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
});
export const learningStateSchema = z.object({
  settings: settingsSchema,
  drafts: z.record(z.string().max(100), z.string().max(30000)),
  projects: z.record(
    z.string().max(40),
    z.object({
      code: z.string().max(30000),
      step: z.number().int().min(0).max(10),
    }),
  ),
  lessonProgress: z
    .record(
      z.string().max(60),
      z.object({
        stage: z.number().int().min(0).max(5),
        completed: z.boolean(),
        touched: z.array(z.string().max(100)).max(80),
        updatedAt: z.number(),
      }),
    )
    .default({}),
  revision: z.number().int().nonnegative(),
});
