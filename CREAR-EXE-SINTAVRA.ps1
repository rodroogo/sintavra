$ErrorActionPreference = "Stop"

function Step($text) {
  Write-Host ""
  Write-Host "==> $text" -ForegroundColor Cyan
}

function Need($path) {
  if (-not (Test-Path $path)) {
    throw "No encuentro '$path'. Ejecuta este script desde la carpeta raiz de Sintavra."
  }
}

Step "Comprobando repo"
Need "package.json"
Need "app"
Need "components"
Need ".github"

# 1) Fix current CI pnpm setup conflict.
Step "Corrigiendo el error actual de pnpm en GitHub Actions"
$ci = ".github/workflows/ci.yml"
if (Test-Path $ci) {
  $txt = Get-Content $ci -Raw
  $txt = [regex]::Replace(
    $txt,
    '(\s*-\s*uses:\s*pnpm/action-setup@v4\s*\r?\n)\s*with:\s*\r?\n\s*version:\s*11\s*\r?\n',
    '$1'
  )
  Set-Content $ci $txt -Encoding UTF8
}

# 2) Desktop wrapper.
Step "Creando wrapper desktop"
New-Item -ItemType Directory -Force -Path "desktop" | Out-Null

$main = @'
const { app, BrowserWindow, shell, dialog } = require("electron");
const { spawn, spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const net = require("node:net");

let serverProcess = null;

function root() {
  return app.isPackaged
    ? path.join(process.resourcesPath, "runtime")
    : path.resolve(__dirname, "..");
}

function env() {
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
    env: env(),
    encoding: "utf8",
    windowsHide: true,
  });
}

function ensureDb(runtimeRoot) {
  const state = path.join(app.getPath("userData"), "wrangler-state");
  const ready = path.join(state, ".sintavra-db-v1");
  fs.mkdirSync(state, { recursive: true });
  if (fs.existsSync(ready)) return state;

  const wrangler = path.join(runtimeRoot, "node_modules", "wrangler", "bin", "wrangler.js");
  const loader = path.join(runtimeRoot, "scripts", "sites-env.mjs");
  const config = path.join(runtimeRoot, "dist", "server", "wrangler.json");
  const migrations = [
    path.join(runtimeRoot, "drizzle", "0000_light_gressill.sql"),
    path.join(runtimeRoot, "drizzle", "0001_soft_mastermind.sql"),
  ];

  for (const file of migrations) {
    const result = runNode([
      "--import", loader,
      wrangler,
      "d1", "execute", "DB",
      "--local",
      "--config", config,
      "--persist-to", state,
      "--file", file,
    ], runtimeRoot);

    if (result.status !== 0) {
      const log = `${result.stdout || ""}\n${result.stderr || ""}`;
      if (!/already exists|duplicate/i.test(log)) {
        throw new Error(`No se pudo preparar la base local.\n${log}`);
      }
    }
  }

  fs.writeFileSync(ready, new Date().toISOString(), "utf8");
  return state;
}

function freePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on("error", reject);
    s.listen(0, "127.0.0.1", () => {
      const p = s.address().port;
      s.close(() => resolve(p));
    });
  });
}

async function wait(url, timeout = 60000) {
  const start = Date.now();
  let last;
  while (Date.now() - start < timeout) {
    try {
      const r = await fetch(url);
      if (r.status) return;
    } catch (e) { last = e; }
    await new Promise(r => setTimeout(r, 500));
  }
  throw new Error(`Sintavra no inicio a tiempo. ${last || ""}`);
}

function stopServer() {
  if (!serverProcess || serverProcess.killed) return;
  try {
    if (process.platform === "win32") {
      spawnSync("taskkill", ["/pid", String(serverProcess.pid), "/T", "/F"], { windowsHide: true });
    } else {
      serverProcess.kill("SIGTERM");
    }
  } catch {}
  serverProcess = null;
}

async function boot() {
  const runtimeRoot = root();
  const state = ensureDb(runtimeRoot);
  const wrangler = path.join(runtimeRoot, "node_modules", "wrangler", "bin", "wrangler.js");
  const loader = path.join(runtimeRoot, "scripts", "sites-env.mjs");
  const config = path.join(runtimeRoot, "dist", "server", "wrangler.json");
  const port = await freePort();

  serverProcess = spawn(process.execPath, [
    "--import", loader,
    wrangler,
    "dev",
    "--config", config,
    "--local",
    "--persist-to", state,
    "--ip", "127.0.0.1",
    "--port", String(port),
    "--inspector-port", "0",
  ], {
    cwd: runtimeRoot,
    env: env(),
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });

  let log = "";
  serverProcess.stdout?.on("data", d => log += d.toString());
  serverProcess.stderr?.on("data", d => log += d.toString());

  const url = `http://127.0.0.1:${port}`;
  try {
    await wait(url);
  } catch (e) {
    throw new Error(`${e.message}\n\n${log.slice(-6000)}`);
  }

  const win = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 900,
    minHeight: 620,
    title: "Sintavra",
    backgroundColor: "#0d1117",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url: target }) => {
    if (!target.startsWith(url)) {
      shell.openExternal(target);
      return { action: "deny" };
    }
    return { action: "allow" };
  });

  await win.loadURL(url);
}

app.whenReady().then(async () => {
  try {
    await boot();
  } catch (e) {
    dialog.showErrorBox("Sintavra no pudo iniciar", e instanceof Error ? e.message : String(e));
    app.quit();
  }
});

app.on("before-quit", stopServer);
app.on("window-all-closed", () => {
  stopServer();
  if (process.platform !== "darwin") app.quit();
});
'@
Set-Content "desktop/main.cjs" $main -Encoding UTF8

$builder = @'
appId: com.rodroogo.sintavra
productName: Sintavra
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

# 3) Automatic Windows release workflow.
Step "Creando workflow automatico de .exe"
New-Item -ItemType Directory -Force -Path ".github/workflows" | Out-Null

$release = @'
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
  build-windows:
    runs-on: windows-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm

      - name: Install
        run: pnpm install --frozen-lockfile

      - name: Bundle browser runtimes
        run: pnpm bundle:runtimes

      - name: Typecheck
        run: pnpm typecheck

      - name: Tests
        run: pnpm test

      - name: Build web runtime
        run: pnpm build

      - name: Prepare packaged local runtime
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

      - name: Give build a unique version
        shell: pwsh
        run: |
          node -e "const fs=require('fs');const f='package.json';const p=JSON.parse(fs.readFileSync(f));p.version='0.1.${{ github.run_number }}';fs.writeFileSync(f,JSON.stringify(p,null,2)+'\n');"

      - name: Build Windows installer
        run: npx --yes electron-builder@26.0.12 --win nsis --x64

      - name: Upload Actions artifact
        uses: actions/upload-artifact@v4
        with:
          name: Sintavra-Windows-v0.1.${{ github.run_number }}
          path: release/*.exe
          if-no-files-found: error

      - name: Publish GitHub Release
        shell: pwsh
        env:
          GH_TOKEN: ${{ github.token }}
        run: |
          $tag = "v0.1.${{ github.run_number }}"
          $exe = Get-ChildItem release -Filter *.exe | Select-Object -First 1
          if (-not $exe) { throw "No se genero ningun .exe" }

          $notes = @"
          Automatic Sintavra Windows build.

          Windows x64 installer: $($exe.Name)

          This is an early Sintavra build. Features that do not yet have a real engine in the source project remain unavailable until implemented.
          "@

          gh release create $tag "$($exe.FullName)" --title "Sintavra $tag" --notes $notes
'@
Set-Content ".github/workflows/release-windows.yml" $release -Encoding UTF8

# 4) Ignore build output.
if (-not (Select-String -Path ".gitignore" -Pattern "^release/$" -Quiet -ErrorAction SilentlyContinue)) {
  Add-Content ".gitignore" @'

# Sintavra desktop build output
release/
.desktop-runtime/
'@
}

# 5) Commit and push.
Step "Guardando cambios y subiendo a GitHub"
git add .github/workflows/ci.yml .github/workflows/release-windows.yml desktop/main.cjs electron-builder.yml .gitignore

$changes = git status --porcelain
if ($changes) {
  git commit -m "Configurar instalador Windows y Releases automaticas"
  git push origin main
} else {
  Write-Host "No habia cambios nuevos que commitear." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Hecho." -ForegroundColor Green
Write-Host "Mira el build aqui:"
Write-Host "https://github.com/rodroogo/sintavra/actions"
Write-Host ""
Write-Host "Si termina en verde, el .exe aparecera aqui:"
Write-Host "https://github.com/rodroogo/sintavra/releases/latest"
