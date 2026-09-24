$ErrorActionPreference = "Stop"

function Step($text) {
    Write-Host ""
    Write-Host "==> $text" -ForegroundColor Cyan
}

function Require-File($path) {
    if (-not (Test-Path $path)) {
        throw "No encuentro '$path'. Ejecuta este archivo desde la carpeta raiz de Sintavra."
    }
}

Step "Comprobando que estas en la raiz de Sintavra"
Require-File "package.json"
Require-File "components/sintavra/app.tsx"
Require-File "app/globals.css"
Require-File ".gitignore"

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backup = ".sintavra-backup-$timestamp"
New-Item -ItemType Directory -Force -Path $backup | Out-Null
Copy-Item "components/sintavra/app.tsx" "$backup/app.tsx"
Copy-Item "app/globals.css" "$backup/globals.css"
Copy-Item "README.md" "$backup/README.md" -ErrorAction SilentlyContinue
Copy-Item ".gitignore" "$backup/.gitignore"

Step "Mejorando la interfaz y anadiendo botones de Releases/GitHub"
$appPath = "components/sintavra/app.tsx"
$app = Get-Content $appPath -Raw

if ($app -notmatch 'DownloadCloud') {
    $pattern = '  Monitor,\r?\n\} from "lucide-react";'
    $replacement = @'
  Monitor,
  Github,
  DownloadCloud,
} from "lucide-react";
'@
    $new = [regex]::Replace($app, $pattern, $replacement, 1)
    if ($new -eq $app) {
        throw "No pude localizar el bloque de imports de lucide-react. No se modifico app.tsx."
    }
    $app = $new
}

if ($app -notmatch 'className="release-button"') {
    $pattern = '          <div className="topbar-actions">\r?\n            <button'
    $replacement = @'
          <div className="topbar-actions">
            <a
              className="release-button"
              href="https://github.com/rodroogo/sintavra/releases/latest"
              target="_blank"
              rel="noreferrer"
              title={en ? "Download the latest Sintavra release" : "Descargar la ultima version de Sintavra"}
            >
              <DownloadCloud size={16} />
              <span>{en ? "Download" : "Descargar"}</span>
            </a>
            <a
              className="github-button"
              href="https://github.com/rodroogo/sintavra"
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              title="GitHub"
            >
              <Github size={17} />
            </a>
            <button
'@
    $new = [regex]::Replace($app, $pattern, $replacement, 1)
    if ($new -eq $app) {
        throw "No pude localizar topbar-actions. No se modifico app.tsx."
    }
    $app = $new
}

if ($app -notmatch 'release-welcome') {
    $needle = @'
            <button
              className="text-button"
'@
    $insert = @'
            <a
              className="btn secondary release-welcome"
              href="https://github.com/rodroogo/sintavra/releases/latest"
              target="_blank"
              rel="noreferrer"
            >
              <DownloadCloud size={16} />
              Descargar Sintavra
            </a>
            <button
              className="text-button"
'@
    if ($app.Contains($needle)) {
        $app = $app.Replace($needle, $insert)
    }
}

Set-Content $appPath $app -Encoding UTF8

$cssPath = "app/globals.css"
$css = Get-Content $cssPath -Raw

if ($css -notmatch 'SINTAVRA-UI-REFRESH-2026') {
$css += @'

/* SINTAVRA-UI-REFRESH-2026
   Compact developer-tool visual language. Keeps existing layout/functions intact. */
:root {
  --background: #f7f8fa;
  --foreground: #171a1f;
  --card: #ffffff;
  --sidebar: #f3f4f6;
  --secondary: #eceef1;
  --border: #dfe2e7;
  --muted: #68707c;
  --primary: #4f7cff;
  --primary-foreground: #ffffff;
  --subtle: #f4f6fa;
}
:root.dark {
  --background: #0d1117;
  --foreground: #e6edf3;
  --card: #161b22;
  --sidebar: #0d1117;
  --secondary: #21262d;
  --border: #30363d;
  --muted: #8b949e;
  --primary: #7aa2ff;
  --primary-foreground: #0d1117;
  --subtle: #161b22;
  --code: #0d1117;
}
body {
  font-family: Inter, ui-sans-serif, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  letter-spacing: -0.006em;
}
h1, h2, h3, h4 {
  letter-spacing: -0.028em;
}
.app-sidebar [data-slot="sidebar-inner"] {
  border-right: 1px solid var(--border);
  background: var(--sidebar);
}
.app-sidebar [data-slot="sidebar-header"] {
  padding: 22px 18px 16px;
}
.app-sidebar [data-slot="sidebar-content"] {
  padding: 0 10px;
  gap: 20px;
}
.app-sidebar [data-slot="sidebar-footer"] {
  padding: 10px 14px 16px;
}
.wordmark {
  font-size: 1.22rem;
  letter-spacing: -0.045em;
  gap: 10px;
}
.brand-symbol {
  width: 30px;
  height: 30px;
  border-radius: 8px;
  font-size: 1rem;
  letter-spacing: -2px;
  box-shadow: inset 0 0 0 1px rgba(255,255,255,.12);
}
.workspace-label {
  margin-top: 11px;
  font-size: .64rem;
  letter-spacing: .095em;
}
.nav-button {
  height: 38px !important;
  border-radius: 7px !important;
  gap: 11px !important;
  padding: 0 11px !important;
  font-size: .84rem !important;
  font-weight: 500 !important;
}
.nav-button[data-active="true"] {
  color: var(--foreground) !important;
  background: var(--secondary) !important;
}
.nav-active {
  width: 3px;
  height: 18px;
  border-radius: 4px;
}
.sidebar-note {
  margin: auto 10px 10px;
  padding-top: 18px;
}
.sidebar-note p {
  margin: 9px 0 15px;
  font-size: .8rem;
}
.topbar {
  height: 60px;
  padding: 0 28px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  backdrop-filter: blur(14px);
  position: sticky;
  top: 0;
  z-index: 30;
}
.topbar-actions {
  gap: 9px;
}
.page-content {
  max-width: 1380px;
  padding: 32px 36px 48px;
}
.btn {
  border-radius: 7px;
  padding: 9px 14px;
  box-shadow: none;
}
.btn:hover {
  transform: none;
}
.continue-card,
.mode-card,
.language-card,
.project-card,
.settings-card,
.explorer,
.tutor-config,
.conversation {
  border-radius: 10px;
  box-shadow: 0 1px 0 rgba(0,0,0,.03);
}
.continue-card {
  min-height: 260px;
}
.continue-copy {
  padding: 25px;
}
.language-card,
.mode-card,
.project-card {
  transition: border-color .15s ease, background .15s ease;
}
.language-card:hover,
.project-card:hover {
  border-color: color-mix(in srgb, var(--border) 65%, var(--foreground));
}
.release-button,
.github-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  height: 34px;
  border: 1px solid var(--border);
  border-radius: 7px;
  background: var(--card);
  color: var(--foreground);
  font-size: .77rem;
  font-weight: 600;
  padding: 0 11px;
  transition: background .15s, border-color .15s;
}
.github-button {
  width: 34px;
  padding: 0;
}
.release-button:hover,
.github-button:hover {
  background: var(--secondary);
  border-color: color-mix(in srgb, var(--border) 65%, var(--foreground));
}
.welcome-screen {
  background:
    radial-gradient(circle at 75% 20%, color-mix(in srgb, var(--primary) 12%, transparent), transparent 36%),
    #0d1117;
}
.welcome-card {
  width: min(680px,100%);
}
.welcome-card h1 {
  letter-spacing: -0.055em;
}
.welcome-code {
  background: #0b0f14;
  border-color: #30363d;
  border-radius: 10px;
}
.release-welcome {
  text-decoration: none;
}
.code-preview,
.terminal-workspace,
.interactive-code {
  background: #0d1117;
}
@media (max-width: 767px) {
  .release-button span { display: none; }
  .release-button { width: 34px; padding: 0; }
  .github-button { display: none; }
  .page-content { padding: 22px 16px 36px; }
  .topbar { padding: 0 14px; }
}
'@
    Set-Content $cssPath $css -Encoding UTF8
}

Step "Creando shell Desktop de Windows"
New-Item -ItemType Directory -Force -Path "desktop" | Out-Null
$mainCjs = @'
const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

let serverProcess = null;

function runtimeRoot() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "runtime")
    : path.resolve(__dirname, "..");
}

function runtimeEnv() {
  return {
    ...process.env,
    ELECTRON_RUN_AS_NODE: "1",
    SITES_RUNTIME_ROOT: path.join(app.getPath("userData"), "sites-runtime"),
    WRANGLER_SEND_METRICS: "false",
    WRANGLER_WRITE_LOGS: "false",
  };
}

function runNode(args, cwd) {
  return spawnSync(process.execPath, args, {
    cwd,
    env: runtimeEnv(),
    encoding: "utf8",
    windowsHide: true,
  });
}

function ensureDatabase(root) {
  const stateRoot = path.join(app.getPath("userData"), "wrangler-state");
  const sentinel = path.join(stateRoot, ".sintavra-db-v1");
  fs.mkdirSync(stateRoot, { recursive: true });
  if (fs.existsSync(sentinel)) return stateRoot;

  const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  const envLoader = path.join(root, "scripts", "sites-env.mjs");
  const config = path.join(root, "dist", "server", "wrangler.json");
  const migrations = [
    path.join(root, "drizzle", "0000_light_gressill.sql"),
    path.join(root, "drizzle", "0001_soft_mastermind.sql"),
  ];

  for (const file of migrations) {
    const result = runNode(
      [
        "--import", envLoader,
        wrangler,
        "d1", "execute", "DB",
        "--local",
        "--config", config,
        "--persist-to", stateRoot,
        "--file", file,
      ],
      root,
    );

    if (result.status !== 0) {
      const log = `${result.stdout || ""}\n${result.stderr || ""}`;
      if (!/already exists|duplicate/i.test(log)) {
        throw new Error(`No se pudo preparar la base local.\n${log}`);
      }
    }
  }

  fs.writeFileSync(sentinel, new Date().toISOString(), "utf8");
  return stateRoot;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
  });
}

async function waitUntilReady(url, timeoutMs = 45000) {
  const started = Date.now();
  let lastError;
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status > 0) return;
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 450));
  }
  throw new Error(`Sintavra no inicio a tiempo. ${lastError ? String(lastError) : ""}`);
}

function stopServer() {
  if (!serverProcess || serverProcess.killed) return;
  const pid = serverProcess.pid;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(pid), "/T", "/F"], { windowsHide: true });
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {}
  serverProcess = null;
}

async function startSintavra() {
  const root = runtimeRoot();
  const stateRoot = ensureDatabase(root);
  const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
  const envLoader = path.join(root, "scripts", "sites-env.mjs");
  const config = path.join(root, "dist", "server", "wrangler.json");
  const port = await freePort();

  serverProcess = spawn(
    process.execPath,
    [
      "--import", envLoader,
      wrangler,
      "dev",
      "--config", config,
      "--local",
      "--persist-to", stateRoot,
      "--ip", "127.0.0.1",
      "--port", String(port),
      "--inspector-port", "0",
    ],
    {
      cwd: root,
      env: runtimeEnv(),
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );

  let serverLog = "";
  serverProcess.stdout?.on("data", (data) => { serverLog += data.toString(); });
  serverProcess.stderr?.on("data", (data) => { serverLog += data.toString(); });

  serverProcess.on("exit", (code) => {
    if (code && code !== 0) {
      console.error("Sintavra local server exited:", code, serverLog);
    }
  });

  const url = `http://127.0.0.1:${port}`;
  await waitUntilReady(url);

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    backgroundColor: "#0d1117",
    title: "Sintavra",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (target.startsWith(url)) return { action: "allow" };
    shell.openExternal(target);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, target) => {
    if (!target.startsWith(url)) {
      event.preventDefault();
      shell.openExternal(target);
    }
  });

  await win.loadURL(url);
}

app.whenReady().then(async () => {
  try {
    await startSintavra();
  } catch (error) {
    dialog.showErrorBox(
      "Sintavra no pudo iniciar",
      error instanceof Error ? error.message : String(error),
    );
    app.quit();
  }
});

app.on("before-quit", stopServer);
app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});
'@
Set-Content "desktop/main.cjs" $mainCjs -Encoding UTF8

$builder = @'
appId: com.rodroogo.sintavra
productName: Sintavra
electronVersion: 38.2.0
asar: true
directories:
  output: release
files:
  - desktop/main.cjs
  - package.json
extraMetadata:
  main: desktop/main.cjs
extraResources:
  - from: .desktop-runtime
    to: runtime
artifactName: Sintavra-Setup-${version}-${arch}.${ext}
win:
  target:
    - target: nsis
      arch:
        - x64
nsis:
  oneClick: false
  perMachine: false
  allowToChangeInstallationDirectory: true
  createDesktopShortcut: true
  createStartMenuShortcut: true
  shortcutName: Sintavra
'@
Set-Content "electron-builder.yml" $builder -Encoding UTF8

Step "Creando GitHub Action: push a main -> .exe -> Release"
New-Item -ItemType Directory -Force -Path ".github/workflows" | Out-Null
$workflow = @'
name: Build Sintavra Windows Release

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: write

concurrency:
  group: sintavra-windows-release
  cancel-in-progress: true

jobs:
  windows:
    runs-on: windows-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 11

      - name: Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Bundle browser runtimes
        run: pnpm bundle:runtimes

      - name: Verify TypeScript
        run: pnpm typecheck

      - name: Run core tests
        run: pnpm test

      - name: Build Sintavra
        run: pnpm build

      - name: Create portable desktop runtime
        shell: pwsh
        run: |
          Remove-Item .desktop-runtime -Recurse -Force -ErrorAction SilentlyContinue
          New-Item -ItemType Directory .desktop-runtime | Out-Null

          Copy-Item dist .desktop-runtime/dist -Recurse -Force
          Copy-Item scripts .desktop-runtime/scripts -Recurse -Force
          Copy-Item drizzle .desktop-runtime/drizzle -Recurse -Force
          Copy-Item public .desktop-runtime/public -Recurse -Force
          Copy-Item package.json .desktop-runtime/package.json -Force

          node -e "const fs=require('fs');const f='.desktop-runtime/package.json';const p=JSON.parse(fs.readFileSync(f));p.dependencies={...(p.dependencies||{}),wrangler:'4.92.0'};p.devDependencies={};p.scripts={};delete p.packageManager;fs.writeFileSync(f,JSON.stringify(p,null,2));"

          npm install --prefix .desktop-runtime --omit=dev --no-audit --no-fund

      - name: Give this automatic build a unique version
        shell: pwsh
        run: |
          node -e "const fs=require('fs');const f='package.json';const p=JSON.parse(fs.readFileSync(f));p.version='0.1.${{ github.run_number }}';fs.writeFileSync(f,JSON.stringify(p,null,2)+'\n');"

      - name: Build Windows installer
        run: npx --yes electron-builder@26.0.12 --win nsis --x64

      - name: Upload build artifact
        uses: actions/upload-artifact@v4
        with:
          name: Sintavra-Windows-v0.1.${{ github.run_number }}
          path: release/*.exe
          if-no-files-found: error

      - name: Create GitHub Release
        shell: pwsh
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          $tag = "v0.1.${{ github.run_number }}"
          $notes = @"
          Automatic Sintavra Windows build.

          - Windows x64 installer included.
          - This build wraps Sintavra with its local runtime.
          - Python/JavaScript/Lua browser runtimes are bundled by the existing project pipeline.
          - C/C++/C#/Java execution remains limited by the current Sintavra engine status until those engines are implemented.
          "@
          gh release create $tag release/*.exe --title "Sintavra $tag" --notes $notes
'@
Set-Content ".github/workflows/release-windows.yml" $workflow -Encoding UTF8

Step "Anadiendo documentacion de instalacion"
New-Item -ItemType Directory -Force -Path "docs" | Out-Null
$installDoc = @'
# Instalar Sintavra

## Windows

La forma rapida es abrir:

https://github.com/rodroogo/sintavra/releases/latest

y descargar el archivo `Sintavra-Setup-...-x64.exe`.

El instalador se genera automaticamente con GitHub Actions cada vez que se actualiza `main`, siempre que las pruebas y la compilacion terminen correctamente.

> Nota: mientras el ejecutable no este firmado con un certificado de firma de codigo, Windows SmartScreen puede mostrar una advertencia de editor desconocido. Eso no equivale a que el archivo este firmado o verificado por Microsoft.

## Android

La version web de Sintavra ya incluye manifest y service worker para funcionar como PWA.

Cuando Sintavra este publicado mediante HTTPS:

1. Abre la web en Chrome.
2. Abre el menu del navegador.
3. Pulsa **Instalar aplicacion** o **Anadir a pantalla de inicio**.
4. Una vez que los recursos offline se hayan descargado, las partes compatibles podran seguir funcionando sin red.

El `.exe` de Windows no funciona en Android.

Todavia no se publica un `.apk` porque la arquitectura actual usa un servidor local/Worker y necesita una adaptacion movil real; no se debe renombrar o disfrazar otro archivo como APK.

## iPhone/iPad

Cuando la web este publicada mediante HTTPS:

1. Abre Sintavra en Safari.
2. Pulsa Compartir.
3. Pulsa **Anadir a pantalla de inicio**.

Una app iOS nativa requiere empaquetado y firma de Apple por separado.

## Releases

Dentro de Sintavra, el boton **Descargar** abre siempre:

https://github.com/rodroogo/sintavra/releases/latest

Por eso no hace falta cambiar la URL cada vez que salga una version nueva.
'@
Set-Content "docs/INSTALAR.md" $installDoc -Encoding UTF8

Step "Actualizando README y .gitignore"
$readmePath = "README.md"
if (Test-Path $readmePath) {
    $readme = Get-Content $readmePath -Raw
    if ($readme -notmatch 'releases/latest') {
        $marker = "Aprende. Programa. Comprende."
        $download = @'

[**Descargar la ultima version de Sintavra**](https://github.com/rodroogo/sintavra/releases/latest) · [Guia de instalacion](docs/INSTALAR.md)
'@
        if ($readme.Contains($marker)) {
            $readme = $readme.Replace($marker, $marker + $download)
        } else {
            $readme = $download + "`r`n" + $readme
        }
        Set-Content $readmePath $readme -Encoding UTF8
    }
}

$gitignore = Get-Content ".gitignore" -Raw
$ignoreBlock = @'

# Sintavra desktop build output
release/
.desktop-runtime/
.sintavra-backup-*/
'@
if ($gitignore -notmatch '\.desktop-runtime/') {
    Add-Content ".gitignore" $ignoreBlock
}

Step "Mostrando cambios"
git status --short

Step "Commit y push"
git add components/sintavra/app.tsx app/globals.css desktop/main.cjs electron-builder.yml .github/workflows/release-windows.yml docs/INSTALAR.md README.md .gitignore

$pending = git status --porcelain
if (-not $pending) {
    Write-Host "No habia cambios nuevos que guardar." -ForegroundColor Yellow
} else {
    git commit -m "Rediseñar UI y automatizar Releases de Windows"
    git push origin main
}

Write-Host ""
Write-Host "LISTO." -ForegroundColor Green
Write-Host "GitHub Actions empezara a construir el .exe despues del push."
Write-Host "Releases: https://github.com/rodroogo/sintavra/releases"
Write-Host "Actions:  https://github.com/rodroogo/sintavra/actions"
Write-Host ""
Write-Host "Si el build falla, no se publicara una Release falsa: revisa el log de Actions."
