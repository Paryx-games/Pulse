class ScreenshotManager {
    constructor() {
        this.videoElement = null;
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupUI();
    }

    setupUI() {
        const playbackControlsGroup = document.querySelector('.controls-group.secondary');
        if (playbackControlsGroup) {
            const screenshotBtn = document.createElement('button');
            screenshotBtn.className = 'icon-btn';
            screenshotBtn.id = 'screenshot-btn';
            screenshotBtn.title = 'Capture screenshot';
            screenshotBtn.innerHTML = '<i class="fas fa-camera"></i>';
            screenshotBtn.addEventListener('click', () => this.captureScreenshot());
            playbackControlsGroup.appendChild(screenshotBtn);
        }

        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            const screenshotSection = document.createElement('div');
            screenshotSection.className = 'settings-section';
            screenshotSection.dataset.tab = 'screenshot';
            screenshotSection.innerHTML = `
                <h3>Screenshot</h3>
                <div class="setting-item">
                    <button class="btn btn-secondary" id="capture-screenshot-btn">
                        <i class="fas fa-camera"></i>
                        Capture Screenshot
                    </button>
                </div>
                <div class="setting-item">
                    <button class="btn btn-secondary" id="open-screenshots-folder-btn">
                        <i class="fas fa-folder-open"></i>
                        Open Screenshots Folder
                    </button>
                </div>
                <div id="screenshot-status" style="margin-top: 10px; font-size: 12px; color: var(--text-tertiary);"></div>
            `;
            settingsContent.appendChild(screenshotSection);

            document.getElementById('capture-screenshot-btn')?.addEventListener('click', () => this.captureScreenshot());
        }
    }

    async captureScreenshot() {
        if (!this.videoElement || !this.videoElement.src) {
            alert('No video loaded');
            return;
        }

        try {
            const timestamp = this.videoElement.currentTime;
            const screenshotPath = await window.electronAPI.captureScreenshot(
                this.videoElement.src,
                timestamp
            );

            const statusEl = document.getElementById('screenshot-status');
            if (statusEl) {
                statusEl.textContent = `✓ Screenshot saved: ${screenshotPath}`;
                statusEl.style.color = '#10b981';
                setTimeout(() => {
                    statusEl.textContent = '';
                }, 3000);
            }
        } catch (error) {
            console.error('Failed to capture screenshot:', error);
            alert('Failed to capture screenshot. Make sure FFmpeg is installed.');
        }
    }
}

const screenshotManager = new ScreenshotManager();
