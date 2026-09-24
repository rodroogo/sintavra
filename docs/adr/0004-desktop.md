# ADR 0004 — Desktop diferido

Tauri reutiliza WebView del sistema y requiere Rust para integración nativa. Electron distribuye Chromium/Node y permite mayor uniformidad entre equipos. Se prefiere Tauri para una futura aplicación ligera, previa validación de Monaco, WebGPU y runtimes en los WebViews de destino.

La versión 0.1.0 no incluye ejecutable ni instalador, y no presenta un enlace falso de descarga. El núcleo, contenido y cliente React están separados para facilitar esa fase.
