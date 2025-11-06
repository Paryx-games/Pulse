class ClipboardManager {
    constructor() {
        this.videoElement = null;
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
                this.handleCopyShortcut();
            }
        });
    }

    handleCopyShortcut() {
        if (!this.videoElement || !this.videoElement.src) return;

        const currentTime = this.videoElement.currentTime;
        const timestamp = this.formatTime(currentTime);

        let textToCopy = timestamp;

        const subtitleDisplay = document.getElementById('subtitle-display');
        if (subtitleDisplay && subtitleDisplay.textContent) {
            textToCopy = `[${timestamp}]\n${subtitleDisplay.textContent}`;
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            this.showCopyNotification(textToCopy);
        }).catch(err => {
            console.error('Failed to copy to clipboard:', err);
        });
    }

    showCopyNotification(text) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 16px;
            border-radius: 6px;
            font-size: 12px;
            z-index: 500;
            animation: slideIn 0.3s ease-out;
            max-width: 200px;
            word-break: break-word;
        `;
        notification.textContent = `Copied: ${text.split('\n')[0]}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    copyCurrentTimestamp() {
        if (!this.videoElement) return;
        const timestamp = this.formatTime(this.videoElement.currentTime);
        navigator.clipboard.writeText(timestamp);
        this.showCopyNotification(timestamp);
    }

    copySubtitle() {
        const subtitleDisplay = document.getElementById('subtitle-display');
        if (!subtitleDisplay || !subtitleDisplay.textContent) {
            alert('No subtitle to copy');
            return;
        }
        navigator.clipboard.writeText(subtitleDisplay.textContent);
        this.showCopyNotification(subtitleDisplay.textContent);
    }
}

const clipboardManager = new ClipboardManager();
