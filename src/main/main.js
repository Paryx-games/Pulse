const path = require('path');
const fs = require('fs');
const { dialog } = require('electron');
const { execFile } = require('child_process');

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

const SUPPORTED_FORMATS = ['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.m4a', '.mp3', '.wav', '.aac', '.ogg', '.flac'];

function isMediaFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return SUPPORTED_FORMATS.includes(ext);
}

ipcMain.handle('get-directory-contents', async (event, dirPath) => {
    try {
        const files = await fs.promises.readdir(dirPath, { withFileTypes: true });
        const items = [];

        for (const file of files) {
            try {
                const fullPath = path.join(dirPath, file.name);
                const stat = await fs.promises.stat(fullPath);

                if (file.isDirectory()) {
                    items.push({
                        name: file.name,
                        path: fullPath,
                        isDirectory: true,
                        size: 0,
                        modified: stat.mtime.toISOString()
                    });
                } else if (isMediaFile(fullPath)) {
                    items.push({
                        name: file.name,
                        path: fullPath,
                        isDirectory: false,
                        size: stat.size,
                        modified: stat.mtime.toISOString(),
                        ext: path.extname(file.name).toLowerCase()
                    });
                }
            } catch (error) {
                logger.logError(`Error reading file ${file.name}`, error);
            }
        }

        items.sort((a, b) => {
            if (a.isDirectory !== b.isDirectory) return b.isDirectory - a.isDirectory;
            return a.name.localeCompare(b.name);
        });

        return items;
    } catch (error) {
        logger.logError('Failed to read directory', error);
        throw error;
    }
});

ipcMain.handle('select-directory', async (event) => {
    const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory']
    });

    if (result.canceled) return null;
    return result.filePaths[0];
});

ipcMain.handle('get-file-metadata', async (event, filePath) => {
    try {
        const stat = await fs.promises.stat(filePath);
        return {
            filePath,
            size: stat.size,
            created: stat.birthtime.toISOString(),
            modified: stat.mtime.toISOString(),
            ext: path.extname(filePath).toLowerCase()
        };
    } catch (error) {
        logger.logError(`Failed to get metadata for ${filePath}`, error);
        throw error;
    }
});

ipcMain.handle('generate-thumbnail', async (event, filePath, timestamp = 5) => {
    try {
        const outputPath = path.join(path.dirname(filePath), `.${path.basename(filePath)}.thumb.jpg`);

        return new Promise((resolve, reject) => {
            execFile('ffmpeg', [
                '-i', filePath,
                '-ss', timestamp.toString(),
                '-vf', 'scale=320:180',
                '-frames:v', '1',
                '-y',
                outputPath
            ], { timeout: 30000 }, (error) => {
                if (error) {
                    logger.logError(`Failed to generate thumbnail for ${filePath}`, error);
                    reject(error);
                } else {
                    const data = fs.readFileSync(outputPath);
                    fs.unlinkSync(outputPath);
                    resolve(Buffer.from(data).toString('base64'));
                }
            });
        });
    } catch (error) {
        logger.logError('Thumbnail generation error', error);
        throw error;
    }
});

ipcMain.handle('capture-screenshot', async (event, filePath, timestamp) => {
    try {
        const now = Date.now();
        const outputPath = path.join(path.dirname(filePath), `screenshot-${now}.jpg`);

        return new Promise((resolve, reject) => {
            execFile('ffmpeg', [
                '-i', filePath,
                '-ss', timestamp.toString(),
                '-vf', 'scale=1920:1080',
                '-frames:v', '1',
                '-y',
                outputPath
            ], { timeout: 30000 }, (error) => {
                if (error) {
                    logger.logError(`Failed to capture screenshot from ${filePath}`, error);
                    reject(error);
                } else {
                    resolve(outputPath);
                }
            });
        });
    } catch (error) {
        logger.logError('Screenshot capture error', error);
        throw error;
    }
});

ipcMain.handle('start-transcoding', async (event, inputPath, outputPath, options) => {
    try {
        const args = [
            '-i', inputPath,
            '-c:v', options.videoCodec || 'libx264',
            '-preset', options.preset || 'medium',
            '-crf', (options.crf || 23).toString(),
            '-c:a', options.audioCodec || 'aac',
            '-b:a', options.audioBitrate || '128k',
            '-y',
            outputPath
        ];

        return new Promise((resolve, reject) => {
            const child = execFile('ffmpeg', args, { timeout: 0 }, (error) => {
                if (error) {
                    logger.logError(`Transcoding failed for ${inputPath}`, error);
                    reject(error);
                } else {
                    resolve(outputPath);
                }
            });

            child.stdout.on('data', (data) => {
                logger.log('INFO', `Transcoding: ${data.toString().trim()}`);
            });

            child.stderr.on('data', (data) => {
                logger.log('INFO', `Transcoding progress: ${data.toString().trim()}`);
            });
        });
    } catch (error) {
        logger.logError('Transcoding error', error);
        throw error;
    }
});

ipcMain.handle('parse-subtitle-file', async (event, filePath) => {
    try {
        const content = await fs.promises.readFile(filePath, 'utf-8');
        const ext = path.extname(filePath).toLowerCase();
        let subtitles = [];

        if (ext === '.srt') {
            const blocks = content.split('\n\n').filter(block => block.trim());
            subtitles = blocks.map(block => {
                const lines = block.trim().split('\n');
                const timings = lines[1].split(' --> ');
                return {
                    start: timeToSeconds(timings[0].trim()),
                    end: timeToSeconds(timings[1].trim()),
                    text: lines.slice(2).join('\n')
                };
            });
        } else if (ext === '.vtt') {
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('-->')) {
                    const timings = lines[i].split('-->');
                    subtitles.push({
                        start: timeToSeconds(timings[0].trim()),
                        end: timeToSeconds(timings[1].trim()),
                        text: lines[i + 1] || ''
                    });
                }
            }
        }

        return subtitles;
    } catch (error) {
        logger.logError(`Failed to parse subtitle file ${filePath}`, error);
        throw error;
    }
});

ipcMain.handle('get-audio-tracks', async (event, filePath) => {
    try {
        return new Promise((resolve, reject) => {
            execFile('ffprobe', [
                '-v', 'quiet',
                '-print_format', 'json',
                '-show_streams',
                '-select_streams', 'a',
                filePath
            ], { timeout: 10000 }, (error, stdout) => {
                if (error) {
                    logger.logError(`Failed to get audio tracks from ${filePath}`, error);
                    resolve([]);
                    return;
                }

                try {
                    const data = JSON.parse(stdout);
                    const audioTracks = data.streams.map((stream, index) => ({
                        id: stream.index,
                        title: stream.tags?.title || `Audio Track ${index + 1}`,
                        language: stream.tags?.language || 'unknown',
                        codec: stream.codec_name
                    }));
                    resolve(audioTracks);
                } catch (e) {
                    logger.logError('Failed to parse ffprobe output', e);
                    resolve([]);
                }
            });
        });
    } catch (error) {
        logger.logError('Audio track detection error', error);
        throw error;
    }
});

function timeToSeconds(timeStr) {
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseFloat(parts[2]);
}