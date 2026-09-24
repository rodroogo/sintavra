# ADR 0002 — Identidad delegada

Contexto: la plataforma ofrece identidad autenticada; no hace falta pedir contraseñas ni servicios de correo.

Decisión: Sites/ChatGPT identifica al usuario. El proxy de producción valida la sesión e inyecta cabeceras, y la API limita consultas por ese identificador. La app no inventa su propio registro.

Consecuencias: la edición alojada depende de esa identidad. La exportación local tiene identidad de desarrollo únicamente en loopback; un despliegue público fuera de Sites necesita reemplazarla. Eliminar datos de Sintavra no elimina la identidad del proveedor.
