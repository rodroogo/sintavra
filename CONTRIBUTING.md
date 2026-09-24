# Contribuir

Mantén contenido y lógica separados. Cada lenguaje vive en su JSON de `content/languages`, con ID estable, versión, ejemplos completos y prerrequisitos existentes. Cambiar ejercicios requiere revisar sus preguntas del servidor. Nunca inventar estadísticas ni marcar una función pendiente como completa.

Ejecuta tipos, lint, tests, build y pruebas API. Para cambios de datos, modifica `db/schema.ts` y genera una migración con `pnpm db:generate`; no edites migraciones ya aplicadas. Para contenido, regenera el manual offline. Los commits deben describir la intención del cambio.

No inflar el proyecto para cumplir un objetivo de líneas. Las dependencias, archivos exportados y builds no cuentan como código original.
