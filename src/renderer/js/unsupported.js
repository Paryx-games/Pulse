if (!window.UnsupportedFileHandler) {
    class UnsupportedFileHandler {
    constructor() {
        this.init();
    }

    init() {
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('error', (e) => this.handleVideoError(e));
        }
    }

    handleVideoError(event) {
        const videoElement = event.target;
        const errorCode = videoElement.error?.code;
        const errorMessage = this.getErrorMessage(errorCode);

        this.showUnsupportedScreen(videoElement.src, errorCode, errorMessage);
    }

    getErrorMessage(errorCode) {
        const messages = {
            1: 'Loading was aborted',
            2: 'Network error occurred',
            3: 'File could not be decoded',
            4: 'File format not supported'
        };
        return messages[errorCode] || 'Unknown error occurred';
    }

    showUnsupportedScreen(filePath, errorCode, errorMessage) {
        const playerWrapper = document.querySelector('.player-wrapper');
        if (!playerWrapper) return;

        const existingScreen = document.getElementById('unsupported-screen');
        if (existingScreen) existingScreen.remove();

        const screen = document.createElement('div');
        screen.id = 'unsupported-screen';
        screen.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(30,30,30,0.9) 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            gap: 20px;
            z-index: 50;
        `;

        const fileName = filePath ? filePath.split('/').pop() : 'Unknown file';
        const ext = fileName.split('.').pop().toUpperCase();

        screen.innerHTML = `
            <div style="text-align: center; color: #ef4444; font-size: 48px;">
                <i class="fas fa-triangle-exclamation"></i>
            </div>
            <div style="text-align: center; max-width: 400px;">
                <h2 style="color: #ef4444; font-size: 20px; margin-bottom: 8px;">File Not Supported</h2>
                <p style="color: #999; font-size: 14px; margin-bottom: 12px;">
                    <strong>File:</strong> ${this.escapeHtml(fileName)}<br>
                    <strong>Format:</strong> ${this.escapeHtml(ext)}<br>
                    <strong>Error:</strong> ${this.escapeHtml(errorMessage)}
                </p>
                <div style="background: rgba(255,255,255,0.05); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 12px; color: #ccc; text-align: left;">
                    <strong>Supported Formats:</strong><br>
                    <strong>Video:</strong> MP4, WebM, MKV, AVI, MOV, FLV, WMV<br>
                    <strong>Audio:</strong> MP3, WAV, M4A, AAC, OGG, FLAC
                </div>
                <div style="display: flex; gap: 8px; justify-content: center;">
                    <button id="convert-btn" style="padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        <i class="fas fa-wand-magic-sparkles"></i> Try Converting
                    </button>
                    <button id="back-btn" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px;">
                        <i class="fas fa-arrow-left"></i> Go Back
                    </button>
                </div>
            </div>
        `;

        playerWrapper.appendChild(screen);

        document.getElementById('back-btn')?.addEventListener('click', () => {
            screen.remove();
            window.goToHome?.();
        });

        document.getElementById('convert-btn')?.addEventListener('click', () => {
            this.showTranscodingOption(filePath);
            screen.remove();
        });
    }

    showTranscodingOption(filePath) {
        const settingsModal = document.getElementById('settings-modal');
        if (settingsModal) {
            settingsModal.classList.add('active');
            const transcodingTab = document.querySelector('[data-tab="transcoding"].settings-tab');
            if (transcodingTab) transcodingTab.click();
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    }

    window.UnsupportedFileHandler = UnsupportedFileHandler;
    const unsupportedFileHandler = new UnsupportedFileHandler();
    window.unsupportedFileHandler = unsupportedFileHandler;
}
