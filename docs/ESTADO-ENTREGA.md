# Estado de entrega

Este paquete permite continuar sobre código funcional. No equivale a la plataforma completa solicitada.

| Parte | Estado real |
|---|---|
| Siete lenguajes | 42 lecciones introductorias; contenido avanzado pendiente |
| Código interactivo | Tokens, líneas, explicación conjunta, trazas anotadas y seis fases |
| `#include` | Explica directiva, cabecera y delimitadores; detecta `#includd` como error |
| Acceso invitado | Pruebas, borradores, preferencias y progreso en IndexedDB |
| Cuenta | Identidad de Sites/ChatGPT, datos separados y revisiones optimistas |
| Fusión de progreso | Elección explícita, reevaluación de respuestas y copias previas |
| Ejecución | JavaScript y Python probados en navegador; Lua integrado y probado en su worker |
| C/C++/C#/Java | Editor, contenido y pruebas; motor integrado pendiente |
| Proyectos | Calculadora guiada para cada lenguaje; gestor multiarchivo pendiente |
| Terminal | Comandos educativos propios; no es Bash ni Git reales |
| Tutor | Pistas editoriales y WebLLM opcional; modelo no incluido en el instalador |
| Offline | Datos locales y shell con caché; instalación offline completa no verificada |
| Categorías ampliadas | Pendientes; no se inventaron cursos HTML/CSS/Linux/SQL |
| Perfil/estadísticas | Progreso y actividad derivada de pruebas; perfil ampliado y tiempo activo pendientes |
| GitHub | Sin OAuth, publicación, importación ni sincronización implementados |
| App única PC/móvil | Sin instaladores nativos verificados; pendiente empaquetado y pruebas por plataforma |

## Migración progresiva del último documento

Se conserva intacto en `REQUISITOS-EXPANSION.txt`. Se debe ampliar la base actual, manteniendo la exportación de datos existentes:

1. Migrar cursos/categorías a entidades relacionadas; mantener IDs de lecciones. Añadir perfil, actividad y sesiones de estudio reales. No convertir duración estimada de una lección en horas estudiadas.
2. Añadir `projects` y `project_files` separados: árbol, edición, renombrado, duplicado, borrado reversible y exportación. Importar los borradores actuales sin perderlos.
3. Implementar GitHub con una GitHub App u OAuth oficialmente registrado. Credenciales exclusivamente en servidor o almacén seguro del sistema; acceso a repositorios seleccionados. Detectar conflictos por SHA base antes de escribir. Los permisos y la integración no se sustituyen con botones.
4. Derivar estadísticas y logros de eventos verificados; distinguir autocomprobación de evaluación.
5. Empaquetar y probar la app con todos sus motores y tutor en equipos limpios sin red.

No se ha creado un repositorio `sintavra` en GitHub: la integración disponible no expone creación autorizada de repositorios. El paquete incluye `.gitignore`, README, `.env.example` y CI; no incluye credenciales.
