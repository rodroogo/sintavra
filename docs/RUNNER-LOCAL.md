# Ejecutar C, C++, C#, Java y Lua sin API de pago

Adaptador personal incluido. Requiere Python 3 y Docker en tu ordenador. No se ha probado Docker en el entorno de construcción; requiere validación en el equipo final. No es un servicio público multiusuario. Docker Desktop tiene condiciones de licencia propias; revisa su elegibilidad para uso personal, o usa Docker Engine.

Descarga y descomprime el código desde Ajustes. Desde su carpeta:

```sh
docker pull gcc:14
docker pull mono:6.12
docker pull eclipse-temurin:21-jdk
docker build -t sintavra-lua:5.4 runners/lua
python3 scripts/local-runner.py --origin https://sintavra.flowy-vine-8159.chatgpt.site
```

Copia el token mostrado por tu terminal al campo «Token local» del editor. Solo se conserva durante la sesión del navegador. No lo envíes por chat. Si usas un servidor local, añade su origen exacto con otro argumento `--origin`. El adaptador solo escucha en 127.0.0.1:8765. El navegador puede requerir permiso de acceso a la red local; algunos navegadores bloquean esta conexión. En ese caso descarga el archivo y ejecútalo en tu entorno local.

Cada ejecución crea un contenedor: sin red, sin capacidades Linux, usuario no root, raíz de solo lectura, entrada montada de solo lectura, 512 MB RAM, 1 CPU, 64 procesos, 20 s y salida limitada. El host no ejecuta el código del estudiante. Los comandos son fijos y el código no se interpola en el shell. Mantén Docker actualizado: los contenedores no equivalen a máquinas virtuales ni son una garantía absoluta frente a código hostil. Detén el servidor con Ctrl+C al terminar. Las imágenes se descargan antes de ejecutar, nunca automáticamente al pulsar Ejecutar.

Python y JavaScript no necesitan este adaptador: funcionan en el navegador. Python requiere descargar su runtime en la primera ejecución. No hay un compilador remoto gratuito ilimitado contratado.
