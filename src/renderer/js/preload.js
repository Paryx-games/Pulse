const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    getMaximizeState: () => ipcRenderer.invoke('get-maximize-state'),
    getVersion: () => ipcRenderer.invoke('get-version'),
    logMessage: (type, message, ms) => ipcRenderer.invoke('log-message', type, message, ms)
});

const startTime = Date.now();

const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const elapsed = Date.now() - startTime;
    ipcRenderer.invoke('log-message', 'INFO', message, elapsed);
    originalLog.apply(console, args);
};

console.error = function(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const elapsed = Date.now() - startTime;
    ipcRenderer.invoke('log-message', 'ERROR', message, elapsed);
    originalError.apply(console, args);
};

console.warn = function(...args) {
    const message = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : String(arg)).join(' ');
    const elapsed = Date.now() - startTime;
    ipcRenderer.invoke('log-message', 'WARNING', message, elapsed);
    originalWarn.apply(console, args);
};