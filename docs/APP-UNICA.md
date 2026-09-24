# Condición de entrega: solo instalar Sintavra

La instrucción final del usuario sustituye el planteamiento que exigía instalar Docker. El objetivo es una sola aplicación por plataforma, con todos los motores, lecciones, diccionario, ejercicios, datos y tutor local incluidos. El peso no es el límite principal: también hay que validar memoria, arquitectura CPU, permisos y licencias. No se añade relleno para aumentar el tamaño.

## Estado real

El prototipo es una aplicación web con manifest instalable y progreso local. El motor Python y su biblioteca estándar se incluyen en los recursos; JavaScript usa el motor del navegador. Los recursos offline deben almacenarse antes de desconectar. El adaptador Docker se conserva solo como herramienta de desarrollo en el código: no cumple la condición de producto y no se debe presentar como la solución final.

Todavía no hay instaladores nativos verificados para Windows, macOS, Linux, Android o iOS con los siete motores y un modelo local incluido. No hay un APK/EXE universal. La edición actual no cumple aún esta condición de aceptación.

## Requisitos para aprobar una versión nativa

- Cada plataforma debe incluir runtimes compatibles de los siete lenguajes; nunca ejecutar el código del estudiante en el proceso de la interfaz.
- Incluir compiladores y bibliotecas, no buscar ejecutables instalados por el usuario. Límites de CPU, memoria, salida y tiempo; sin acceso del código a cuentas, archivos personales o red.
- Incluir un modelo pequeño con licencia redistribuible y motor local; no depender de WebGPU exclusivamente: validar CPU y dispositivos de poca memoria. El modo de pistas editorial permanece disponible.
- Guardar progreso transaccionalmente en el dispositivo. Sincronización opcional y resoluble sin perder copias.
- Arranque tras instalación en dispositivo limpio y sin internet: abrir cada lenguaje, ejecutar ejercicios, pedir una pista, completar examen, cerrar y restaurar progreso.
- Pruebas en Windows/macOS/Linux y Android/iOS reales, con instaladores firmados cuando corresponda. Esas pruebas no se sustituyen por abrir la web.
- Inventario y avisos de licencia de motores/modelo, versiones fijadas y checksums. Bloquear la publicación como «completa» si falta cualquier componente.

Tauri 2 admite interfaces de escritorio y móvil, pero iOS requiere macOS y Xcode para construir. Este entorno es Linux y no dispone de esa cadena ni de identidades de firma. Referencias verificadas: https://v2.tauri.app/start/prerequisites/ y https://v2.tauri.app/distribute/sign/ios/ .

La distribución mediante tiendas puede tener requisitos y costes ajenos a la aplicación. No se promete distribución nativa universal gratuita ni publicación en tiendas sin comprobarlos. CheerpJ no se adopta como dependencia offline gratuita universal: sus condiciones distinguen uso personal y licencias comerciales/autohospedaje (https://cheerpj.com/docs/licensing).
