export type Attempt = {
  local?: boolean;
  responses?: { id: string; choice: string }[];
  id: string;
  lessonId: string;
  score: number;
  total: number;
  hints: number;
  createdAt: number;
  kind: string;
};
export function conceptStatus(
  attempts: Attempt[],
  lessonId: string,
  now = Date.now(),
) {
  const relevant = attempts
    .filter((a) => a.lessonId === lessonId)
    .sort((a, b) => a.createdAt - b.createdAt);
  if (!relevant.length) return "pending";
  const recent = relevant[relevant.length - 1];
  if (recent.score / recent.total < 0.67) return "practice";
  const independent = relevant.filter(
    (a) => a.score === a.total && a.hints === 0,
  );
  const distinctDays = new Set(
    independent.map((a) => new Date(a.createdAt).toISOString().slice(0, 10)),
  );
  if (distinctDays.size >= 2 && now - recent.createdAt < 14 * 86400000)
    return "mastered";
  return "learning";
}
export function xpFor(attempts: Attempt[]) {
  const byLesson = new Map<string, number>();
  for (const a of attempts)
    byLesson.set(
      a.lessonId,
      Math.max(
        byLesson.get(a.lessonId) || 0,
        Math.round((30 * a.score) / a.total),
      ),
    );
  return [...byLesson.values()].reduce((a, b) => a + b, 0);
}
export function dueLessons(
  attempts: Attempt[],
  ids: string[],
  now = Date.now(),
) {
  return ids.filter((id) => {
    const aa = attempts
      .filter((a) => a.lessonId === id)
      .sort((a, b) => b.createdAt - a.createdAt);
    if (!aa.length) return false;
    const a = aa[0];
    const days =
      a.score / a.total < 0.67
        ? 1
        : conceptStatus(attempts, id, now) === "mastered"
          ? 7
          : 3;
    return now - a.createdAt >= days * 86400000;
  });
}
export function studyStreak(attempts: Attempt[], now = Date.now()) {
  const dates = new Set(
    attempts.map((a) => new Date(a.createdAt).toISOString().slice(0, 10)),
  );
  let d = new Date(now);
  let n = 0;
  if (!dates.has(d.toISOString().slice(0, 10)))
    d = new Date(d.getTime() - 86400000);
  while (dates.has(d.toISOString().slice(0, 10))) {
    n++;
    d = new Date(d.getTime() - 86400000);
  }
  return n;
}
