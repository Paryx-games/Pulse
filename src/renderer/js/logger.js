class Logger {
    constructor() {
        this.logs = [];
        this.maxLogs = 500;
        this.logLevel = 'INFO';
        this.enableFileLogging = true;
        this.showTimestamps = true;
        this.logDisplay = null;

        const levels = ['TRACE', 'DEBUG', 'INFO', 'WARNING', 'ERROR'];
        this.levelIndex = {
            'TRACE': 0,
            'DEBUG': 1,
            'INFO': 2,
            'WARNING': 3,
            'ERROR': 4
        };

        window.logger = this;
        this.init();
    }

    init() {
        this.info('Logger initialized');
    }

    shouldLog(level) {
        return this.levelIndex[level] >= this.levelIndex[this.logLevel];
    }

    formatTime() {
        const now = new Date();
        return now.toLocaleTimeString('en-US', { hour12: false });
    }

    formatMessage(level, message) {
        const timestamp = this.showTimestamps ? this.formatTime() : '';
        return { level, message, timestamp };
    }

    addLogEntry(level, message) {
        if (!this.shouldLog(level)) return;

        const entry = this.formatMessage(level, message);
        this.logs.push(entry);

        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }

        this.displayLog(entry);
        this.logToConsole(level, message);
    }

    displayLog(entry) {
        this.logDisplay = document.getElementById('log-display');
        if (!this.logDisplay) return;

        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${entry.level.toLowerCase()}`;
        logEntry.innerHTML = `
            <span class="log-level">${entry.level}</span>
            <span class="log-time">${entry.timestamp}</span>
            <span class="log-message">${this.escapeHtml(entry.message)}</span>
        `;

        this.logDisplay.appendChild(logEntry);
        this.logDisplay.scrollTop = this.logDisplay.scrollHeight;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    logToConsole(level, message) {
        const timestamp = this.showTimestamps ? `[${this.formatTime()}]` : '';
        const prefix = `[${level}] ${timestamp}`;

        switch (level) {
            case 'ERROR':
                console.error(prefix, message);
                break;
            case 'WARNING':
                console.warn(prefix, message);
                break;
            case 'DEBUG':
            case 'TRACE':
                console.log(prefix, message);
                break;
            case 'INFO':
            default:
                console.log(prefix, message);
        }
    }

    trace(message) {
        this.addLogEntry('TRACE', message);
    }

    debug(message) {
        this.addLogEntry('DEBUG', message);
    }

    info(message) {
        this.addLogEntry('INFO', message);
    }

    warning(message) {
        this.addLogEntry('WARNING', message);
    }

    error(message) {
        this.addLogEntry('ERROR', message);
    }

    setLogLevel(level) {
        if (this.levelIndex.hasOwnProperty(level)) {
            this.logLevel = level;
            this.info(`Log level set to ${level}`);
        }
    }

    clearLogs() {
        this.logs = [];
        this.logDisplay = document.getElementById('log-display');
        if (this.logDisplay) {
            this.logDisplay.innerHTML = '';
            this.addLogEntry('INFO', 'Logs cleared');
        }
    }

    exportLogs() {
        const logsText = this.logs.map(entry => {
            const timestamp = entry.timestamp ? `[${entry.timestamp}]` : '';
            return `[${entry.level}] ${timestamp} ${entry.message}`;
        }).join('\n');

        const element = document.createElement('a');
        element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logsText));
        element.setAttribute('download', `pulse-logs-${Date.now()}.txt`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);

        this.info('Logs exported');
    }

    getLogs() {
        return [...this.logs];
    }

    getLevelIndex(level) {
        return this.levelIndex[level] || this.levelIndex['INFO'];
    }
}

if (!window.logger) {
    window.logger = new Logger();
}
