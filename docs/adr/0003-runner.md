# ADR 0003 — Código en una superficie aislada

Decisión: iframe de origen opaco (sandbox allow-scripts), CSP y Worker desechable. El controlador padre verifica source y nonce de sesión, limita tiempo y termina el iframe. JS sin red; Pyodide con acceso solo a la ruta de su distribución en CDN. El código nunca recibe tokens y su salida solo sirve de feedback local.

Límites: no es una microVM ni un límite duro de RAM. Un programa puede consumir memoria de la pestaña. El usuario no debe ejecutar programas ajenos no confiables esperando aislamiento equivalente a un servicio multiusuario. No se pueden conceder calificaciones de dominio basadas en mensajes del runner. La API puntúa preguntas de forma independiente.
