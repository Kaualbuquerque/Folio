import { ChildProcess, spawn } from 'child_process';
import { app, BrowserWindow, dialog, ipcMain, shell } from 'electron';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const isDev = !app.isPackaged;

let backendProcess: ChildProcess | null = null;

function createWindow(): void {
    const preloadPath = join(__dirname, 'preload.js');
    console.log('Preload path:', preloadPath);

    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 500,
        frame: false,
        backgroundColor: '#1F1E1C',
        icon: join(__dirname, '../build/icon.png'),
        webPreferences: {
            contextIsolation: true,
            preload: join(__dirname, 'preload.js'),
        },
    });

    win.webContents.on('before-input-event', (event, input) => {
        const isDevToolsShortcut =
            input.key === 'F12' ||
            (input.control && input.shift && input.key.toUpperCase() === 'I') ||
            (input.meta && input.alt && input.key.toUpperCase() === 'I');

        if (isDevToolsShortcut) {
            event.preventDefault();
        }
    });

    win.webContents.on('devtools-opened', () => {
        win.webContents.closeDevTools();
    });

    if (isDev) {
        loadWithRetry(win, 'http://localhost:5173');
    } else {
        win.loadFile('dist/index.html');
    }

    ipcMain.on('window:minimize', () => win.minimize());
    ipcMain.on('window:maximize', () => {
        if (win.isMaximized()) {
            win.unmaximize();
        } else {
            win.maximize();
        }
    });
    ipcMain.on('window:close', () => win.close());
    ipcMain.on('shell:openExternal', (_event, url: string) => {
        shell.openExternal(url);
    });
    ipcMain.handle('dialog:selectFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory'],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });
}

function loadWithRetry(win: BrowserWindow, url: string, attempt = 1): void {
    win.loadURL(url).catch(() => {
        if (attempt < 20) {
            setTimeout(() => loadWithRetry(win, url, attempt + 1), 300);
        }
    });
}

function startBackend(): void {
    if (isDev) return;

    const backendPath = join(process.resourcesPath, 'backend-dist', 'folio-backend.exe');
    backendProcess = spawn(backendPath, [], {
        cwd: join(process.resourcesPath, 'backend-dist'),
    });

    backendProcess.stdout?.on('data', (data) => {
        console.log(`[backend] ${data}`);
    });

    backendProcess.stderr?.on('data', (data) => {
        console.error(`[backend] ${data}`);
    });
}

function stopBackend(): void {
    if (backendProcess) {
        backendProcess.kill();
        backendProcess = null;
    }
}

app.whenReady().then(() => {
    startBackend();
    createWindow();
});

app.on('window-all-closed', () => {
    stopBackend();
    if (process.platform !== 'darwin') {
        app.quit();
    }
});