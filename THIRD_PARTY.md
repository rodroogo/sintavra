# Componentes externos

Conservar los avisos de las dependencias al distribuir builds. Consultar las licencias incluidas en las versiones fijadas en pnpm-lock.yaml.

- React, Monaco, Tailwind, Radix y componentes del starter: licencias de sus respectivos paquetes.
- Pyodide 0.27.7: distribución cargada desde jsDelivr; consultar https://github.com/pyodide/pyodide.
- WebLLM 0.2.79: https://github.com/mlc-ai/web-llm.
- Llama 3.2 1B: modelo descargado por el navegador al activarlo, sujeto a su propia licencia y política de uso; https://huggingface.co/mlc-ai/Llama-3.2-1B-Instruct-q4f32_1-MLC.

Los pesos del modelo no se incluyen en el ZIP del código. No se afirma propiedad de dependencias, modelos ni herramientas del starter.

## Bundled execution assets

- Pyodide 0.27.7: MPL-2.0; unmodified runtime files from the npm `pyodide` package. Source and license: https://github.com/pyodide/pyodide/tree/0.27.7 . Includes CPython and its standard library, covered by Python's license and notices. The upstream release's third-party license notices apply: https://docs.python.org/3/license.html .
- Fengari 0.1.4: MIT; source https://github.com/fengari-lua/fengari . Bundled from the exact pnpm-lock dependency with `scripts/bundle-lua.mjs`. License copied to `public/runtime/licenses/FENGARI.txt`. Implements Lua 5.3 semantics with documented differences; it is not a Lua 5.4 native executable.
- sprintf-js (transitive Fengari dependency) retains its upstream BSD license.

The local Docker development images are not included or automatically downloaded. They are not part of the installed-app product requirement.
