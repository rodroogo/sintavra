# Verificación de esta entrega · 24 de septiembre de 2026

- TypeScript: sin errores. ESLint de código propio: sin errores. Formato Prettier: correcto.
- Seis pruebas automáticas de dominio, XP sin acumulación artificial, repaso, rachas UTC, comandos y coherencia de los siete módulos: correctas.
- API contra Worker real en Miniflare y SQLite temporal: identidad obligatoria, aislamiento entre usuarios, persistencia, revisiones obsoletas, Origin, evaluación, reenvíos, exámenes y borrado: correctos.
- Sincronización local: recalcula puntuación ignorando el score enviado, acepta respuestas de los dos idiomas, evita duplicados y guarda copia antes de reemplazar. Probada con datos sintéticos.
- Navegador de escritorio: bienvenida, acceso invitado, inspección de print con significado y contexto, prueba local 3/3 y 30 XP conservados después de recargar. Python ejecutó «Hola, Ada» con el runtime incluido en los archivos de la aplicación. JavaScript devolvió la misma salida. Se corrigió la selección del worker de Monaco para JavaScript. Lua pasó una ejecución de bucle en su worker empaquetado. Monaco carga en navegador.

## Límites comprobables

No se ha ejecutado el adaptador Docker en este entorno. La descarga grande del modelo WebLLM no se probó; requiere dispositivo compatible con WebGPU. No se verificó un dispositivo móvil real. El shell offline y su Service Worker requieren HTTPS y recursos previamente abiertos; el navegador de previsualización HTTP no permite verificar la instalación completa offline. El modo sin cuenta y su almacenamiento local sí se probaron.

Las trazas explican los ejemplos del curso y no depuran código arbitrario. Los proyectos comprueban salida, no la estructura interna del programa. Las explicaciones del diccionario contextual están inicialmente en español aunque el resto del recorrido puede cambiar a inglés. La adaptación usa resultados y nivel declarado, no un modelo educativo validado. El catálogo es introductorio; no se presenta como cobertura avanzada completa.

No se ha creado un repositorio en GitHub: se conserva el código en el repositorio de publicación y en un ZIP descargable. No hay instaladores desktop firmados ni CLI de sistema. No se declara una auditoría independiente de seguridad ni una garantía de alojamiento gratuito perpetuo.
