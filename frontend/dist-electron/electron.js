import { app, BrowserWindow } from 'electron';
const isDev = !app.isPackaged;
function createWindow() {
    const win = new BrowserWindow({
        width: 1280,
        height: 800,
        webPreferences: {
            contextIsolation: true
        }
    });
    if (isDev) {
        loadWithRetry(win, 'http://localhost:5173');
    }
    else {
        win.loadURL('http://localhost:5173');
    }
}
function loadWithRetry(win, url, attempt = 1) {
    win.loadURL(url).catch(() => {
        if (attempt < 20) {
            setTimeout(() => loadWithRetry(win, url, attempt + 1), 300);
        }
        else {
            console.error('Não foi possível conectar ao servidor Vite.');
        }
    });
}
app.whenReady().then(createWindow);
