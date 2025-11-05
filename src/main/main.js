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

const logger = require('./logger');

let mainWindow;

function createWindow() {
    logger.log('INFO', 'Creating application window');

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

    logger.log('INFO', 'Window loaded successfully');

    if (process.env.NODE_ENV === 'development') {
        mainWindow.webContents.openDevTools();
        logger.log('INFO', 'DevTools opened (development mode)');
    }

    mainWindow.on('closed', () => {
        logger.log('INFO', 'Application window closed');
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
        logger.log('INFO', `Version retrieved: ${version}`);
        return version;
    } catch (error) {
        logger.logError('Failed to read version file', error);
        return 'unknown';
    }
});

ipcMain.handle('log-message', (event, type, message, ms) => {
    logger.log(type, message, ms);
});

logger.initializeLogger();

if (app.isReady && app.isReady()) {
    createWindow();
} else if (app.on) {
    app.on('ready', createWindow);
}

app.on('activate', () => {
    logger.log('INFO', 'Application activated');
    if (mainWindow === null) {
        createWindow();
    }
});

app.on('window-all-closed', () => {
    logger.log('INFO', 'All windows closed, quitting application');
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

process.on('uncaughtException', (error) => {
    logger.logError('Uncaught exception', error);
});