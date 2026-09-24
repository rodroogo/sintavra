# SINTAVRA — PLAN DE CONSTRUCCIÓN

Decisión del usuario: no contratar servicios de pago; avanzar autónomamente. Fecha: 2026-09-24.

## Objetivo
Aprender a programar mediante explicaciones, experimentación y evidencia de comprensión. Se prioriza una aplicación utilizable sobre cantidad de líneas. Esta entrega es la versión inicial 0.1.0, no la totalidad de la visión avanzada.

## Stack final de esta entrega
React 19, TypeScript, Vinext/Vite, Workers, D1 (SQLite), Monaco, Pyodide y WebLLM. Se conserva el starter de Sites porque entrega hosting y autenticación integrados sin pedir nuevas cuentas ni secretos al usuario. Sustituye la propuesta inicial de Supabase y una API de IA comercial. La interfaz, las reglas educativas, los módulos de contenido y el acceso a datos están separados.

## Costo y límites
No se contrata ninguna API, dominio, máquina virtual, correo transaccional o suscripción. La ejecución en navegador no genera facturas de cómputo remoto. No hay tarjeta ni claves de pago en este proyecto. La electricidad, conexión, almacenamiento y hardware del usuario no son gratuitos por definición.

La URL gestionada depende del servicio de alojamiento de Sites y sus políticas; no se promete su disponibilidad gratuita perpetua ni independiente del plan de ChatGPT. Para independencia se entrega todo el código y un manual HTML offline. El código puede desarrollarse localmente, con base D1 emulada y autenticación de desarrollo del starter; esa identidad local NO se debe exponer a internet.

Como alternativa de despliegue externo investigada, Cloudflare Workers Free ofrece cuota de peticiones dinámica y D1 Free tiene límites diarios de 5 millones de filas leídas y 100 000 escritas, y 5 GB de almacenamiento total. Alcanzar límites puede interrumpir el servicio. No activamos facturación. Migrar a ese despliegue exige reemplazar la identidad de Sites por autenticación real independiente; el repositorio no finge que bastaría con copiar las cabeceras.

Fuentes consultadas:
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://pyodide.org/en/stable/usage/webworker.html
- https://webllm.mlc.ai/docs/user/get_started.html
- https://tauri.app/concept/process-model/

## Arquitectura
- app: UI y API versionada.
- components/sintavra: superficies de producto.
- content/languages: siete módulos JSON versionados.
- lib/core: progreso y parser de terminal sin React.
- lib/server: banco de preguntas, identidad y D1.
- lib/runner: controlador de ejecución aislada en navegador.
- db y drizzle: esquema y migraciones.
- tests: reglas de aprendizaje y API real en Miniflare.
- docs/adr: decisiones y consecuencias.

No se fuerza un monorepo con paquetes vacíos. El núcleo podrá extraerse cuando exista un segundo cliente instalable que lo necesite.

## Identidad y datos
La edición alojada usa inicio de sesión con ChatGPT. La contraseña, recuperación y sesiones pertenecen al proveedor de identidad; Sintavra no almacena contraseñas ni implementa formularios falsos de registro. Persistimos únicamente identificador de usuario, preferencias, borradores, proyectos y evaluaciones. El nombre mostrado puede personalizarse. Cada consulta se limita al usuario autenticado.

Tablas: profiles (estado y revisión optimista), attempts (resultados por concepto), quizzes (prueba pendiente del modo online), backups (copia previa a reemplazo local). La API crea pruebas, evalúa elecciones, rechaza envíos repetidos y ofrece exportación y eliminación. Al borrar datos de Sintavra no se elimina la cuenta de ChatGPT.

## Educación
Seis conceptos iniciales por lenguaje: programa, variables, condiciones, bucles, funciones y colecciones. Las explicaciones respetan diferencias como la indexación de Lua, range en Python y los contenedores de C/C++/Java/C#. Cada lección tiene tres preguntas; el examen usa dos por concepto. Es un banco pequeño y fijo, con orden de respuestas barajado, no un banco ilimitado. Los resultados sirven para aprendizaje personal, no para certificaciones antitrampas.

Dominio inicial: aciertos completos independientes en al menos dos días UTC distintos, último resultado satisfactorio y actividad reciente. Fallos recientes llevan a práctica. XP usa el mejor resultado por concepto; repetir no acumula XP sin límite. Repasos a 1, 3 o 7 días según evidencia. Son heurísticas transparentes, no un diagnóstico educativo validado.

## Runner
Python y JavaScript se ejecutan realmente en el navegador. Código arbitrario nunca se ejecuta en el Worker principal. Iframe sandbox de origen opaco + Worker desechable + CSP, timeout y tamaño máximo de salida. JavaScript no tiene red; Python permite únicamente la ruta del CDN del runtime. El código no recibe credenciales de usuario. No existe un límite de RAM duro portable del navegador: es una limitación explícita. Se usa para práctica personal; no se acepta su salida como prueba segura de dominio.

C, C++, C#, Java y Lua tienen manuales, pruebas, editor y adaptador Docker local personal; este adaptador requiere instalación y validación en el ordenador final. No se envía código a compiladores públicos sin permiso ni se presentan respuestas simuladas.

## Tutor
Guía editorial disponible sin IA. Modelo local opcional con WebLLM, descargado explícitamente por el usuario y ejecutado con WebGPU. Aproximadamente 1 GB de descarga, variable por modelo; requiere memoria y navegador compatible. Modo estricto/guiado/asistencia define instrucciones, pero no garantiza obediencia perfecta de un modelo pequeño. La pantalla de examen desmonta el tutor y no ofrece pistas. No existe tutor remoto que pueda responder a exámenes.

## Offline
Manual HTML independiente totalmente offline. IndexedDB conserva borradores pendientes y preferencias; la base de datos sigue siendo la autoridad para resultados. Los cambios de otro dispositivo se detectan con revisión optimista y se conserva la copia local para exportar. Se añadió shell offline con Service Worker, pruebas locales y sincronización con elección de combinar, conservar cuenta o conservar local. El servidor recalcula resultados importados; el banco también existe en el cliente para funcionar offline. La caché cubre recursos ya visitados y no garantiza Python/IA sin descargar. Las trazas son ejemplos anotados, no un depurador de código arbitrario.

## Desktop y CLI
Tauri es la opción futura preferida: WebView del sistema y permisos mínimos. Electron facilita uniformidad de Chromium a costa de distribuirlo. No se entrega un ejecutable Tauri ni un CLI instalable en 0.1.0. Terminal Mode sí está implementado y comparte contenido/progreso con UI Mode. No abre una shell real.

## Seguridad y pruebas
Validación Zod, consultas preparadas, identificación en cada endpoint, comprobación Origin y Content-Type para escrituras, límites de entrada, cuotas de creación de pruebas, resultados del lado servidor, eliminación por usuario, logs mínimos sin contenido. Se probaron reglas de progreso, contratos de contenido y API; ver VERIFICACION.md. No se declara auditoría de seguridad independiente.

## Siguientes fases
1. Más ejercicios distintos por concepto y evaluación estructural del código.
2. Runner adicional por lenguaje, preferentemente WebAssembly; si requiere infraestructura, deberá mantener uso local opcional y no contratar servicios.
3. PWA completa con sincronización por operación y conflictos por archivo.
4. Autenticación independiente para distribución pública fuera de Sites.
5. Tauri y CLI sobre contratos existentes.
6. Contenido intermedio/avanzado revisado y accesibilidad ampliada.

No hay decisiones pendientes que requieran respuesta del usuario para utilizar esta entrega.
