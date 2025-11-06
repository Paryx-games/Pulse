class SubtitleManager {
    constructor() {
        this.currentSubtitles = [];
        this.subtitleElement = null;
        this.currentSubtitleIndex = -1;
        this.subtitleTrack = null;
        this.offsetMs = 0;
        this.fontSize = 16;
        this.init();
    }

    init() {
        this.createSubtitleElement();
        this.setupUI();
        this.setupVideoListener();
    }

    setupVideoListener() {
        const videoPlayer = document.getElementById('video-player');
        if (videoPlayer) {
            videoPlayer.addEventListener('timeupdate', () => {
                this.updateSubtitle(videoPlayer.currentTime * 1000);
            });
        }
    }

    createSubtitleElement() {
        this.subtitleElement = document.createElement('div');
        this.subtitleElement.id = 'subtitle-display';
        this.subtitleElement.style.cssText = `
            position: absolute;
            bottom: 80px;
            left: 0;
            right: 0;
            text-align: center;
            color: #fff;
            font-size: ${this.fontSize}px;
            font-weight: 500;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.8);
            padding: 0 10px;
            pointer-events: none;
            z-index: 100;
        `;
        const playerWrapper = document.querySelector('.player-wrapper');
        if (playerWrapper) {
            playerWrapper.appendChild(this.subtitleElement);
        }
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const subtitleSection = document.createElement('div');
        subtitleSection.className = 'settings-section';
        subtitleSection.dataset.tab = 'subtitles';
        subtitleSection.innerHTML = `
            <h3>Subtitles</h3>
            <div class="setting-item">
                <button class="btn btn-secondary" id="load-subtitle-btn">
                    <i class="fas fa-upload"></i>
                    Load Subtitle File
                </button>
            </div>
            <div class="setting-item">
                <label>Font Size</label>
                <div class="slider-container">
                    <input type="range" id="subtitle-font-size" class="slider-input" min="10" max="32" value="16" step="1">
                    <span class="slider-value" id="subtitle-font-size-value">16px</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Time Offset (ms)</label>
                <div class="slider-container">
                    <input type="range" id="subtitle-offset" class="slider-input" min="-5000" max="5000" value="0" step="100">
                    <span class="slider-value" id="subtitle-offset-value">0ms</span>
                </div>
            </div>
            <div class="setting-item checkbox">
                <input type="checkbox" id="subtitle-enabled" class="checkbox-input" checked>
                <label for="subtitle-enabled">Show Subtitles</label>
            </div>
            <div class="setting-item">
                <label>Subtitle Color</label>
                <div class="color-picker-container">
                    <input type="color" id="subtitle-color" class="color-picker" value="#ffffff">
                </div>
            </div>
            <div class="setting-item">
                <label>Background Opacity</label>
                <div class="slider-container">
                    <input type="range" id="subtitle-bg-opacity" class="slider-input" min="0" max="100" value="80" step="5">
                    <span class="slider-value" id="subtitle-bg-opacity-value">80%</span>
                </div>
            </div>
            <div class="setting-item">
                <button class="btn btn-secondary" id="edit-subtitle-btn">
                    <i class="fas fa-edit"></i>
                    Edit Subtitle Timing
                </button>
            </div>
        `;
        settingsContent.appendChild(subtitleSection);

        document.getElementById('load-subtitle-btn')?.addEventListener('click', () => this.loadSubtitleFile());
        document.getElementById('subtitle-font-size')?.addEventListener('input', (e) => this.setFontSize(e.target.value));
        document.getElementById('subtitle-offset')?.addEventListener('input', (e) => this.setOffset(e.target.value));
        document.getElementById('subtitle-enabled')?.addEventListener('change', (e) => this.toggleSubtitles(e.target.checked));
        document.getElementById('subtitle-color')?.addEventListener('change', (e) => this.setColor(e.target.value));
        document.getElementById('subtitle-bg-opacity')?.addEventListener('input', (e) => this.setBackgroundOpacity(e.target.value));
        document.getElementById('edit-subtitle-btn')?.addEventListener('click', () => this.openSubtitleEditor());
    }

    async loadSubtitleFile() {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.srt,.vtt,.ass';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            try {
                const content = await file.text();
                const ext = file.name.split('.').pop().toLowerCase();
                this.parseSubtitles(content, ext);
                console.log(`Loaded ${this.currentSubtitles.length} subtitles from ${file.name}`);
            } catch (error) {
                console.error('Failed to load subtitle file:', error);
                alert('Failed to load subtitle file');
            }
        };
        fileInput.click();
    }

    parseSubtitles(content, format) {
        this.currentSubtitles = [];

        if (format === 'srt') {
            const blocks = content.split('\n\n').filter(block => block.trim());
            this.currentSubtitles = blocks.map(block => {
                const lines = block.trim().split('\n');
                const timing = lines[1] ? lines[1].split('-->') : ['', ''];
                return {
                    start: this.timeToMs(timing[0]?.trim() || '0:0:0'),
                    end: this.timeToMs(timing[1]?.trim() || '0:0:0'),
                    text: lines.slice(2).join('\n')
                };
            });
        } else if (format === 'vtt') {
            const lines = content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].includes('-->')) {
                    const timings = lines[i].split('-->');
                    this.currentSubtitles.push({
                        start: this.timeToMs(timings[0].trim()),
                        end: this.timeToMs(timings[1].trim()),
                        text: lines[i + 1] || ''
                    });
                }
            }
        }
    }

    timeToMs(timeStr) {
        const parts = timeStr.split(':');
        const hours = parseInt(parts[0]) || 0;
        const minutes = parseInt(parts[1]) || 0;
        const seconds = parseFloat(parts[2]) || 0;
        return (hours * 3600 + minutes * 60 + seconds) * 1000;
    }

    msToTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const millis = ms % 1000;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(3, '0')}`;
    }

    updateSubtitle(currentTimeMs) {
        if (!this.subtitleElement || this.currentSubtitles.length === 0) return;

        const adjustedTime = currentTimeMs + this.offsetMs;
        let found = false;

        for (let i = 0; i < this.currentSubtitles.length; i++) {
            const sub = this.currentSubtitles[i];
            if (adjustedTime >= sub.start && adjustedTime < sub.end) {
                this.subtitleElement.textContent = sub.text;
                this.subtitleElement.style.display = 'block';
                this.currentSubtitleIndex = i;
                found = true;
                break;
            }
        }

        if (!found) {
            this.subtitleElement.style.display = 'none';
            this.currentSubtitleIndex = -1;
        }
    }

    setFontSize(size) {
        this.fontSize = parseInt(size);
        if (this.subtitleElement) {
            this.subtitleElement.style.fontSize = `${this.fontSize}px`;
        }
        document.getElementById('subtitle-font-size-value').textContent = `${this.fontSize}px`;
    }

    setOffset(offset) {
        this.offsetMs = parseInt(offset);
        document.getElementById('subtitle-offset-value').textContent = `${this.offsetMs}ms`;
    }

    toggleSubtitles(enabled) {
        if (this.subtitleElement) {
            this.subtitleElement.style.display = enabled && this.currentSubtitleIndex >= 0 ? 'block' : 'none';
        }
    }

    setColor(color) {
        if (this.subtitleElement) {
            this.subtitleElement.style.color = color;
        }
    }

    setBackgroundOpacity(opacity) {
        const opacityValue = parseInt(opacity) / 100;
        if (this.subtitleElement) {
            this.subtitleElement.style.textShadow = `2px 2px 4px rgba(0,0,0,${Math.min(opacityValue + 0.2, 1)})`;
        }
        document.getElementById('subtitle-bg-opacity-value').textContent = `${opacity}%`;
    }

    openSubtitleEditor() {
        if (this.currentSubtitles.length === 0) {
            alert('No subtitles loaded');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.id = 'subtitle-editor-modal';
        modal.innerHTML = `
            <div class="modal-overlay"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Edit Subtitle Timing</h2>
                    <button class="icon-btn" id="subtitle-editor-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="subtitle-editor-list" id="subtitle-editor-list"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const list = document.getElementById('subtitle-editor-list');
        this.currentSubtitles.forEach((sub, i) => {
            const item = document.createElement('div');
            item.className = 'subtitle-editor-item';
            item.innerHTML = `
                <div class="subtitle-editor-text">${this.escapeHtml(sub.text.substring(0, 50))}</div>
                <div class="subtitle-editor-timings">
                    <input type="text" class="time-input" value="${this.msToTime(sub.start)}" data-index="${i}" data-type="start">
                    <span class="separator">→</span>
                    <input type="text" class="time-input" value="${this.msToTime(sub.end)}" data-index="${i}" data-type="end">
                </div>
            `;
            list.appendChild(item);
        });

        document.getElementById('subtitle-editor-close')?.addEventListener('click', () => modal.remove());
        modal.querySelector('.modal-overlay')?.addEventListener('click', () => modal.remove());

        document.querySelectorAll('.time-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const index = parseInt(e.target.dataset.index);
                const type = e.target.dataset.type;
                const ms = this.timeToMs(e.target.value);
                if (type === 'start') {
                    this.currentSubtitles[index].start = ms;
                } else {
                    this.currentSubtitles[index].end = ms;
                }
            });
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    exportSubtitles(format = 'srt') {
        let content = '';

        if (format === 'srt') {
            this.currentSubtitles.forEach((sub, i) => {
                content += `${i + 1}\n${this.msToTime(sub.start)} --> ${this.msToTime(sub.end)}\n${sub.text}\n\n`;
            });
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `subtitles.${format}`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

const subtitleManager = new SubtitleManager();
window.subtitleManager = subtitleManager;
