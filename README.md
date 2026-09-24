# Sintavra

Aprende. Programa. Comprende.

Aplicación educativa en español e inglés, sin API de pago. Versión inicial 0.1.0. Lee [el plan y los límites](docs/PLAN-DE-CONSTRUCCION.md) antes de desplegarla para público general.

Consulta primero [el estado real de entrega](docs/ESTADO-ENTREGA.md). El último documento de expansión está conservado completo en `docs/REQUISITOS-EXPANSION.txt`.

## Incluido
- 7 lenguajes, 42 lecciones iniciales y 126 preguntas conceptuales (banco fijo).
- Manual buscable y manual HTML descargable que funciona sin internet.
- Monaco, ejecución Python/JavaScript/Lua en navegador, entrada/salida, detener y descargar.
- Cuenta mediante identidad de Sites/ChatGPT y progreso D1 por usuario.
- Pruebas y exámenes evaluados en servidor; conceptos, XP, racha UTC y repaso.
- Proyectos de calculadora en siete lenguajes con autocomprobación de salida.
- Código explorable, diccionario contextual y seis fases por lección.
- Acceso sin cuenta, pruebas locales y combinación explícita del progreso.
- Terminal de comandos educativos que usa los mismos datos.
- Guía de estudio sin IA y WebLLM opcional sin API key.
- Preferencias, temas, exportación, eliminación y Developer Code `n-`.

C/C++/C#/Java no tienen todavía motor integrado. Existe un adaptador Docker exclusivamente de desarrollo: no cumple la condición de una sola app. No están terminados el contenido avanzado, ejecutable desktop, CLI instalable y autenticación independiente. La caché offline depende de haber abierto previamente la aplicación; no garantiza que Python o la IA estén disponibles sin sus descargas.

## Desarrollo local
Requisitos: Node.js 22.13 o posterior, pnpm 11 (o el instalador del starter), Python 3 solo para regenerar los archivos exportados. No hace falta una cuenta de pago ni una clave API.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

El starter portátil usa identidad de desarrollo para trabajo local. No exponer ese servidor a internet. La copia distribuida incluye perfil portátil. Para probar persistencia local después de instalar:

```sh
pnpm build
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_light_gressill.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_soft_mastermind.sql
pnpm dev
```

No vuelvas a aplicar una migración ya aplicada. Los datos locales viven en `.wrangler/state`, ignorados en Git. En Sites, el sistema aplica las migraciones al publicar.

## Verificación
```sh
pnpm typecheck
pnpm lint:app
pnpm test
pnpm build
pnpm test:api
```

Las pruebas API usan Miniflare, una base temporal y cuentas sintéticas. No tocan datos de producción. Las pruebas de navegador se documentan por separado.

## Empaquetar
```sh
python3 scripts/export-manual.py
python3 scripts/export-source.py
```

El ZIP excluye dependencias, builds, base local, credenciales e identidad de publicación. El manual exportado incluye contenido versionado, no respuestas generadas por IA.

## Estructura
La UI vive en `components/sintavra`, las reglas en `lib/core`, los datos en `content/languages` y las rutas en `app/api/v1`. Ver [arquitectura y decisiones](docs/PLAN-DE-CONSTRUCCION.md), [seguridad](SECURITY.md), [API](docs/API.md) y [costos](docs/adr/0001-zero-paid-services.md).

## Publicación
La edición actual usa Sites y sus cabeceras de identidad verificadas por el proxy. No confíes en cabeceras enviadas por clientes al desplegar el Worker directamente en otro servicio. Para una publicación externa, implementa una identidad verificable o coloca el Worker detrás de un proxy autenticado que elimine cabeceras del cliente e inyecte las verificadas. No se configura facturación automáticamente.

## Licencia
No se ha concedido una licencia pública al código original de Sintavra. El titular conserva los derechos y puede elegirla posteriormente. Las dependencias conservan sus propias licencias. Véase LICENSE y THIRD_PARTY.md.
