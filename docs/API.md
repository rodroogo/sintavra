# API v1

Todas las respuestas de estado y evaluación usan `Cache-Control: private, no-store`. La identidad proviene del proxy de Sites, nunca de un userId enviado en JSON. Las escrituras requieren `application/json` y Origin del propio sitio cuando está presente. Los clientes nativos futuros necesitarán un esquema de autenticación propio.

| Ruta | Método | Función |
|---|---|---|
| /api/v1/state | GET | Perfil, borradores, proyectos, revisión y hasta 5000 intentos por usuario |
| /api/v1/state | PUT | Guarda estado con revisión optimista; 409 en conflictos |
| /api/v1/quiz | POST | Crea prueba por lessonId o examen por languageId; devuelve preguntas sin respuestas |
| /api/v1/attempts | POST | Evalúa quizId y answers; rechaza pruebas ajenas, vencidas o ya entregadas |
| /api/v1/account | DELETE | Elimina todos los datos de Sintavra del usuario actual |
| /api/runner | GET | Devuelve documento de sandbox del navegador; nunca recibe código del estudiante |

Una prueba expira en 24 horas. Las pruebas antiguas se limpian por usuario al crear una nueva. El límite inicial es 15 creaciones por minuto por usuario. El banco es educativo, no secreto frente a quien lea el repositorio. Las respuestas no se incluyen en el bundle cliente.

Una entrega de examen genera resultados por concepto. El identificador del intento deriva de la prueba y concepto para impedir duplicados. El resultado viene de las respuestas, no de un score aportado por el navegador.

Errores: 400 validación, 401 identidad ausente, 403 origen, 404 recurso ajeno/inexistente, 409 revisión o entrega repetida, 410 prueba vencida, 413 tamaño, 415 formato, 429 cuota, 503 almacenamiento indisponible.

## Progreso local y fusión
`POST /api/v1/sync`: `{strategy: "combine"|"local",locale,state}`. Recalcula respuestas locales contra el banco versionado, evita duplicados y exige revisión actual. Un batch transaccional conserva copia antes de reemplazar resultados. `GET /api/v1/backups` descarga copias de la cuenta autenticada. El borrado elimina también esas copias.

El banco de preguntas está disponible en el cliente para pruebas offline. Los resultados educativos no son certificaciones resistentes a trampas. La cuenta identifica propiedad de los datos, no garantiza quién respondió.
