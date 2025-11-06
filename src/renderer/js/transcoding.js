class TranscodingManager {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.init();
    }

    async init() {
        this.setupUI();
        this.loadQueue();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const transcodingSection = document.createElement('div');
        transcodingSection.className = 'settings-section';
        transcodingSection.dataset.tab = 'transcoding';
        transcodingSection.innerHTML = `
            <h3>Transcoding</h3>
            <div class="setting-item">
                <button class="btn btn-secondary" id="add-transcode-btn">
                    <i class="fas fa-plus"></i>
                    Add File to Queue
                </button>
            </div>
            <div class="setting-item">
                <label>Video Codec</label>
                <select id="transcode-video-codec" class="select-input">
                    <option value="libx264">H.264 (MP4)</option>
                    <option value="libx265">H.265 (HEVC)</option>
                    <option value="libvpx">VP8 (WebM)</option>
                    <option value="libvpx-vp9">VP9 (WebM)</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Preset</label>
                <select id="transcode-preset" class="select-input">
                    <option value="fast">Fast (larger file)</option>
                    <option value="medium" selected>Medium</option>
                    <option value="slow">Slow (smaller file)</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Quality (CRF)</label>
                <div class="slider-container">
                    <input type="range" id="transcode-crf" class="slider-input" min="18" max="28" value="23" step="1">
                    <span class="slider-value" id="transcode-crf-value">23</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Audio Bitrate</label>
                <select id="transcode-audio-bitrate" class="select-input">
                    <option value="128k">128 kbps</option>
                    <option value="192k">192 kbps</option>
                    <option value="256k" selected>256 kbps</option>
                    <option value="320k">320 kbps</option>
                </select>
            </div>
            <div class="transcoding-queue" id="transcoding-queue">
                <div class="empty-message">Queue is empty</div>
            </div>
        `;
        settingsContent.appendChild(transcodingSection);

        document.getElementById('add-transcode-btn')?.addEventListener('click', () => this.showFileSelector());
        document.getElementById('transcode-crf')?.addEventListener('input', (e) => {
            document.getElementById('transcode-crf-value').textContent = e.target.value;
        });
    }

    showFileSelector() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'video/*,audio/*';
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.addToQueue(file.path || file.name);
            }
        };
        fileInput.click();
    }

    async addToQueue(filePath) {
        const item = {
            id: Date.now(),
            filePath,
            status: 'pending',
            progress: 0,
            error: null
        };

        this.queue.push(item);
        this.saveQueue();
        this.renderQueue();

        if (!this.isProcessing) {
            this.processQueue();
        }
    }

    async processQueue() {
        while (this.queue.length > 0 && this.isProcessing === false) {
            this.isProcessing = true;
            const item = this.queue.find(i => i.status === 'pending');

            if (!item) break;

            item.status = 'processing';
            this.renderQueue();

            try {
                const outputPath = item.filePath.replace(/\.[^.]+$/, '_converted.mp4');
                const options = {
                    videoCodec: document.getElementById('transcode-video-codec')?.value || 'libx264',
                    preset: document.getElementById('transcode-preset')?.value || 'medium',
                    crf: parseInt(document.getElementById('transcode-crf')?.value || 23),
                    audioCodec: 'aac',
                    audioBitrate: document.getElementById('transcode-audio-bitrate')?.value || '256k'
                };

                await window.electronAPI.startTranscoding(item.filePath, outputPath, options);

                item.status = 'completed';
                item.progress = 100;
            } catch (error) {
                item.status = 'error';
                item.error = error.message;
            }

            this.renderQueue();
        }

        this.isProcessing = false;
    }

    renderQueue() {
        const queueEl = document.getElementById('transcoding-queue');
        if (!queueEl) return;

        if (this.queue.length === 0) {
            queueEl.innerHTML = '<div class="empty-message">Queue is empty</div>';
            return;
        }

        queueEl.innerHTML = '';
        this.queue.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.style.cssText = `
                padding: 12px;
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: 4px;
                margin-bottom: 8px;
            `;

            const statusColor = item.status === 'completed' ? '#10b981' :
                               item.status === 'error' ? '#ef4444' :
                               item.status === 'processing' ? '#3b82f6' : '#6b7280';

            itemEl.innerHTML = `
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 12px; overflow: hidden; text-overflow: ellipsis; color: var(--text-primary);">${item.filePath.split('/').pop()}</span>
                    <span style="font-size: 12px; color: ${statusColor}; font-weight: 500;">${item.status.toUpperCase()}</span>
                </div>
                ${item.status === 'processing' ? `<div style="width: 100%; height: 4px; background: var(--bg-tertiary); border-radius: 2px; overflow: hidden;">
                    <div style="width: ${item.progress}%; height: 100%; background: #3b82f6; transition: width 0.3s;"></div>
                </div>` : ''}
                ${item.error ? `<div style="font-size: 11px; color: #ef4444; margin-top: 4px;">${this.escapeHtml(item.error)}</div>` : ''}
            `;

            queueEl.appendChild(itemEl);
        });
    }

    saveQueue() {
        localStorage.setItem('transcodingQueue', JSON.stringify(this.queue));
    }

    loadQueue() {
        const saved = localStorage.getItem('transcodingQueue');
        if (saved) {
            try {
                this.queue = JSON.parse(saved);
                this.renderQueue();
            } catch (e) {
                console.error('Failed to load transcoding queue:', e);
            }
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

const transcodingManager = new TranscodingManager();
