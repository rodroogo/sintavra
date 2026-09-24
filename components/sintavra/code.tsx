"use client";
import { useEffect, useRef, useState } from "react";
import type { editor } from "monaco-editor";
export function Code({
  value,
  language,
  onChange,
  fontSize = 15,
}: {
  value: string;
  language: string;
  onChange?: (s: string) => void;
  fontSize?: number;
}) {
  const host = useRef<HTMLDivElement>(null);
  const instance = useRef<editor.IStandaloneCodeEditor | null>(null);
  const change = useRef(onChange);
  useEffect(() => {
    change.current = onChange;
  }, [onChange]);
  const initial = useRef({ value, fontSize });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let subscription: { dispose: () => void } | undefined;
    import("monaco-editor")
      .then(async (monaco) => {
        const Worker = (
          await import("monaco-editor/esm/vs/editor/editor.worker?worker")
        ).default;
        const TypeScriptWorker = (
          await import(
            "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
          )
        ).default;
        (
          globalThis as typeof globalThis & { MonacoEnvironment: unknown }
        ).MonacoEnvironment = {
          getWorker: (_module: string, label: string) =>
            label === "typescript" || label === "javascript"
              ? new TypeScriptWorker()
              : new Worker(),
        };
        if (disposed || !host.current) return;
        monaco.editor.defineTheme("sintavra", {
          base: "vs-dark",
          inherit: true,
          rules: [
            { token: "comment", foreground: "7D8998" },
            { token: "keyword", foreground: "BCA2EE" },
            { token: "string", foreground: "BADA90" },
            { token: "number", foreground: "EAC07D" },
          ],
          colors: {
            "editor.background": "#11161D",
            "editor.foreground": "#D5DCE5",
            "editorLineNumber.foreground": "#556174",
            "editorCursor.foreground": "#C8F48A",
            "editor.selectionBackground": "#344632",
            "editor.lineHighlightBackground": "#171E28",
          },
        });
        const ed = monaco.editor.create(host.current, {
          value: initial.current.value,
          language:
            language === "csharp"
              ? "csharp"
              : language === "cpp" || language === "c"
                ? "cpp"
                : language,
          theme: "sintavra",
          fontSize: initial.current.fontSize,
          fontFamily: '"Cascadia Code", "SFMono-Regular", Consolas, monospace',
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          readOnly: !change.current,
          padding: { top: 20 },
          tabSize: 4,
          wordWrap: "on",
          lineNumbersMinChars: 3,
          accessibilitySupport: "on",
        });
        instance.current = ed;
        subscription = ed.onDidChangeModelContent(() =>
          change.current?.(ed.getValue()),
        );
        setReady(true);
      })
      .catch(() => setError(true));
    return () => {
      disposed = true;
      subscription?.dispose();
      instance.current?.dispose();
      instance.current = null;
    };
  }, [language]);
  useEffect(() => {
    if (instance.current && instance.current.getValue() !== value)
      instance.current.setValue(value);
  }, [value]);
  useEffect(() => {
    instance.current?.updateOptions({ fontSize });
  }, [fontSize]);
  return (
    <div className="code-container">
      <div ref={host} className="monaco-host" />
      {!ready && (
        <textarea
          className="code-fallback"
          aria-label="Código / Code"
          spellCheck={false}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          readOnly={!onChange}
        />
      )}{" "}
      {error && (
        <small className="editor-note">
          Editor de texto disponible · Monaco no pudo cargarse.
        </small>
      )}
    </div>
  );
}
