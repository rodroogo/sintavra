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
