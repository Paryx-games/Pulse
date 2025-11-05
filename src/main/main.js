const path = require('path');
const fs = require('fs');

let app, BrowserWindow, ipcMain;

try {
    const electron = require('electron');
    app = electron.app;
    BrowserWindow = electron.BrowserWindow;
    ipcMain = electron.ipcMain;

    if (!app) {
        throw new Error('Electron app not available');
    }
} catch (error) {
    console.error('Failed to load Electron:', error.message);
    process.exit(1);
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 720,
        minWidth: 800,
        minHeight: 600,
        frame: false,
        transparent: true,
        backgroundColor: '#00000000',
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            sandbox: true,
            webSecurity: true,
            preload: path.join(__dirname, '../renderer/js/preload.js')
        }
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

ipcMain.on('minimize-window', () => {
    if (mainWindow) mainWindow.minimize();
});

ipcMain.on('maximize-window', () => {
    if (mainWindow) {
        if (mainWindow.isMaximized()) {
            mainWindow.unmaximize();
        } else {
            mainWindow.maximize();
        }
    }
});

ipcMain.on('close-window', () => {
    if (mainWindow) mainWindow.close();
});

ipcMain.handle('get-maximize-state', () => {
    if (mainWindow) return mainWindow.isMaximized();
    return false;
});

ipcMain.handle('get-version', () => {
    try {
        const versionFile = path.join(__dirname, '../../version.txt');
        const version = fs.readFileSync(versionFile, 'utf8').trim();
        return version;
    } catch (error) {
        console.error('Failed to read version file:', error.message);
        return 'unknown';
    }
});

if (app.isReady && app.isReady()) {
    createWindow();
} else if (app.on) {
    app.on('ready', createWindow);
}

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});