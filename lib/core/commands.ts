export function parseCommand(input: string) {
  const parts = input.trim().split(/\s+/);
  if (parts[0] === "sintavra") parts.shift();
  const aliases: Record<string, string> = {
    help: "ayuda",
    learn: "aprender",
    manual: "manual",
    practice: "practicar",
    progress: "progreso",
    languages: "lenguajes",
    settings: "configuracion",
    clear: "limpiar",
    exam: "examen",
    projects: "proyectos",
  };
  const name = aliases[parts[0]] || parts[0];
  const language =
    parts[1] === "c++"
      ? "cpp"
      : parts[1] === "js"
        ? "javascript"
        : parts[1] === "c#"
          ? "csharp"
          : parts[1];
  return { name, language, topic: parts.slice(2).join(" ") };
}
