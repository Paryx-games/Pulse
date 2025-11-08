const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    minimizeWindow: () => ipcRenderer.send('minimize-window'),
    maximizeWindow: () => ipcRenderer.send('maximize-window'),
    closeWindow: () => ipcRenderer.send('close-window'),
    getMaximizeState: () => ipcRenderer.invoke('get-maximize-state'),
    getVersion: () => ipcRenderer.invoke('get-version'),
    logMessage: (type, message, ms) => ipcRenderer.invoke('log-message', type, message, ms),
    getDirectoryContents: (dirPath) => ipcRenderer.invoke('get-directory-contents', dirPath),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    getFileMetadata: (filePath) => ipcRenderer.invoke('get-file-metadata', filePath),
    generateThumbnail: (filePath, timestamp = 5) => ipcRenderer.invoke('generate-thumbnail', filePath, timestamp),
    captureScreenshot: (filePath, timestamp) => ipcRenderer.invoke('capture-screenshot', filePath, timestamp),
    startTranscoding: (inputPath, outputPath, options) => ipcRenderer.invoke('start-transcoding', inputPath, outputPath, options),
    parseSubtitleFile: (filePath) => ipcRenderer.invoke('parse-subtitle-file', filePath),
    getAudioTracks: (filePath) => ipcRenderer.invoke('get-audio-tracks', filePath),
    openFile: () => ipcRenderer.invoke('dialog:openFile'),
    ipcRenderer: ipcRenderer
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