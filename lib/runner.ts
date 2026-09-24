const pythonFiles = [
  "pyodide.js",
  "pyodide.asm.js",
  "pyodide.asm.wasm",
  "pyodide-lock.json",
  "python_stdlib.zip",
];
let pythonAssets: Promise<Record<string, ArrayBuffer>> | undefined;
function loadPythonAssets() {
  return (pythonAssets ||= Promise.all(
    pythonFiles.map(async (name) => {
      const response = await fetch("/runtime/python/" + name);
      if (!response.ok) throw new Error("No se pudo cargar Python incluido.");
      return [name, await response.arrayBuffer()] as const;
    }),
  )
    .then((entries) => Object.fromEntries(entries))
    .catch((error) => {
      pythonAssets = undefined;
      throw error;
    }));
}
export type RunMessage = {
  type: "loading" | "output" | "done" | "error";
  text?: string;
};
export function runCode(
  language: string,
  code: string,
  stdin: string,
  notify: (m: RunMessage) => void,
) {
  if (!["python", "javascript", "lua"].includes(language))
    throw new Error("El motor integrado de este lenguaje está pendiente.");
  if (code.length > 30000) throw new Error("Maximum code size: 30 KB");
  const frame = document.createElement("iframe");
  frame.hidden = true;
  frame.title = "Isolated code runner";
  frame.sandbox.add("allow-scripts");
  frame.src = "/api/runner?version=2&language=" + language;
  const session = Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) =>
    b.toString(16).padStart(2, "0"),
  ).join("");
  let finished = false;
  let timer: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timer);
    window.removeEventListener("message", listen);
    frame.remove();
  };
  const timeout = (ms: number) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      notify({
        type: "error",
        text:
          language === "python"
            ? "Tiempo agotado. Si era la primera carga de Python, comprueba tu conexión."
            : "Tiempo agotado (5 segundos). Revisa la condición del bucle.",
      });
      cleanup();
    }, ms);
  };
  const listen = (e: MessageEvent) => {
    if (e.source !== frame.contentWindow || !e.data) return;
    const m = e.data;
    if (m.type === "frame-ready") {
      void (
        language === "python"
          ? loadPythonAssets()
          : language === "lua"
            ? fetch("/runtime/lua.js").then(async (r) => {
                if (!r.ok) throw new Error("No se pudo cargar Lua");
                return { "lua.js": await r.arrayBuffer() };
              })
            : Promise.resolve(undefined)
      )
        .then((assets) => {
          if (!finished)
            frame.contentWindow?.postMessage(
              { type: "start", session, code, stdin, assets },
              "*",
            );
        })
        .catch((e) => {
          notify({ type: "error", text: String(e) });
          cleanup();
        });
      return;
    }
    if (m.session !== session) return;
    if (m.type === "ready") {
      timeout(5000);
      return;
    }
    if (m.type === "output" && typeof m.text === "string")
      notify({ type: "output", text: m.text.slice(0, 64000) });
    if (m.type === "done" || m.type === "error") {
      notify({
        type: m.type,
        text: typeof m.text === "string" ? m.text : undefined,
      });
      cleanup();
    }
  };
  window.addEventListener("message", listen);
  document.body.appendChild(frame);
  timeout(language === "python" ? 90000 : 15000);
  notify({ type: "loading" });
  return cleanup;
}
