import python from "@/content/languages/python.json";
import cpp from "@/content/languages/cpp.json";
import c from "@/content/languages/c.json";
import javascript from "@/content/languages/javascript.json";
import java from "@/content/languages/java.json";
import csharp from "@/content/languages/csharp.json";
import lua from "@/content/languages/lua.json";
export type Lesson = (typeof python.lessons)[number];
export type Language = Omit<typeof python, "runner"> & {
  runner: string | null;
};
export const languages: Language[] = [
  python,
  cpp,
  c,
  javascript,
  java,
  csharp,
  lua,
];
export const lessons = languages.flatMap((l) => l.lessons);
export const getLesson = (id: string) => lessons.find((l) => l.id === id);
export const getLanguage = (id: string) => languages.find((l) => l.id === id);
export const textFor = (es: string, en: string, locale: string) =>
  locale === "en" ? en : es;
