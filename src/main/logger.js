const fs = require('fs');
const path = require('path');

let logFilePath = null;
let startTime = null;

function getLogsDirectory() {
    const appPath = path.join(__dirname, '../..');
    const logsDir = path.join(appPath, 'logs');

    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }

    return logsDir;
}

function getLogFilePath() {
    if (logFilePath) return logFilePath;

    const logsDir = getLogsDirectory();
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
    const filename = `LOG_${dateStr}_${timeStr}.log`;

    logFilePath = path.join(logsDir, filename);

    return logFilePath;
}

function getLatestLogPath() {
    const logsDir = getLogsDirectory();
    return path.join(logsDir, 'latest.log');
}

function getFormattedTime(ms) {
    if (ms === undefined || ms === null) {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    const seconds = Math.floor(ms / 1000);
    const milliseconds = ms % 1000;

    if (seconds > 0) {
        return `${seconds}s ${milliseconds}ms`;
    }

    return `${milliseconds}ms`;
}

function formatLog(type, message, ms) {
    const time = getFormattedTime(ms);
    const timestamp = new Date().toTimeString().split(' ')[0];

    return `[${type}] [${timestamp}] ${ms !== undefined ? `[${time}]` : ''} ${message}`;
}

function writeLog(logLine) {
    try {
        const filePath = getLogFilePath();
        const latestPath = getLatestLogPath();

        fs.appendFileSync(filePath, logLine + '\n', 'utf8');
        fs.appendFileSync(latestPath, logLine + '\n', 'utf8');
    } catch (error) {
        console.error('Failed to write to log file:', error);
    }
}

function initializeLogger() {
    const latestPath = getLatestLogPath();
    try {
        fs.writeFileSync(latestPath, '', 'utf8');
    } catch (error) {
        console.error('Failed to clear log file:', error);
    }
    
    startTime = Date.now();
    log('INFO', 'Logger initialized');
    logStartupTime();
}

function log(type, message, elapsedMs = undefined) {
    const logLine = formatLog(type, message, elapsedMs);

    console.log(logLine);

    writeLog(logLine);
}

function logStartupTime() {
    const elapsed = Date.now() - startTime;
    log('INFO', 'Application startup complete', elapsed);
}

function logError(message, error = null) {
    let fullMessage = message;

    if (error) {
        fullMessage = `${message} - ${error.message || error}`;
    }

    log('ERROR', fullMessage);
}

function logWarning(message) {
    log('WARNING', message);
}

function logDevConsole(message) {
    log('DEVCONSOLE', message);
}

module.exports = {
    initializeLogger,
    log,
    logError,
    logWarning,
    logDevConsole,
    getLogFilePath,
    getFormattedTime
};
