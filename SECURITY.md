# Seguridad

No incluir contraseñas, claves ni código privado en incidencias. Antes de abrir el servicio al público, revisar límites, dependencia de identidad del proxy, protección frente a consumo excesivo y backups. Esta versión no ha pasado una auditoría externa.

- El Worker no ejecuta código del estudiante.
- D1 usa statements preparados y filtro de usuario.
- La calificación se calcula en servidor. La salida del runner es no confiable.
- API sin caché compartida; origen verificado en escrituras de navegador.
- La identidad de desarrollo no es válida para internet. La app alojada requiere el proxy autenticador de Sites.
- Ninguna credencial de servicio se entrega al navegador.
- El borrado elimina perfiles, pruebas y resultados del usuario, sin afectar otras cuentas.
- WebLLM descarga dependencias/modelos externos al activarlo. No enviar secretos al tutor.

Dependencias: ejecutar `pnpm audit --prod` y evaluar los hallazgos antes de cada publicación. Las actualizaciones deben respetar el lockfile y pasar las pruebas.
