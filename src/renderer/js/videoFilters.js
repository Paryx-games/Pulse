class VideoFilterManager {
    constructor() {
        this.videoElement = null;
        this.brightness = 100;
        this.contrast = 100;
        this.saturation = 100;
        this.hue = 0;
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupUI();
        this.applyFilters();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const filterSection = document.createElement('div');
        filterSection.className = 'settings-section';
        filterSection.dataset.tab = 'filters';
        filterSection.innerHTML = `
            <h3>Video Filters</h3>
            <div class="setting-item">
                <label>Brightness</label>
                <div class="slider-container">
                    <input type="range" id="brightness-slider" class="slider-input" min="0" max="200" value="100" step="5">
                    <span class="slider-value" id="brightness-value">100%</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Contrast</label>
                <div class="slider-container">
                    <input type="range" id="contrast-slider" class="slider-input" min="0" max="200" value="100" step="5">
                    <span class="slider-value" id="contrast-value">100%</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Saturation</label>
                <div class="slider-container">
                    <input type="range" id="saturation-slider" class="slider-input" min="0" max="200" value="100" step="5">
                    <span class="slider-value" id="saturation-value">100%</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Hue</label>
                <div class="slider-container">
                    <input type="range" id="hue-slider" class="slider-input" min="-180" max="180" value="0" step="1">
                    <span class="slider-value" id="hue-value">0°</span>
                </div>
            </div>
            <div class="setting-item">
                <button class="btn btn-secondary" id="reset-filters-btn">
                    <i class="fas fa-redo"></i>
                    Reset Filters
                </button>
            </div>
        `;
        settingsContent.appendChild(filterSection);

        document.getElementById('brightness-slider')?.addEventListener('input', (e) => {
            this.brightness = parseInt(e.target.value);
            document.getElementById('brightness-value').textContent = `${this.brightness}%`;
            this.applyFilters();
        });

        document.getElementById('contrast-slider')?.addEventListener('input', (e) => {
            this.contrast = parseInt(e.target.value);
            document.getElementById('contrast-value').textContent = `${this.contrast}%`;
            this.applyFilters();
        });

        document.getElementById('saturation-slider')?.addEventListener('input', (e) => {
            this.saturation = parseInt(e.target.value);
            document.getElementById('saturation-value').textContent = `${this.saturation}%`;
            this.applyFilters();
        });

        document.getElementById('hue-slider')?.addEventListener('input', (e) => {
            this.hue = parseInt(e.target.value);
            document.getElementById('hue-value').textContent = `${this.hue}°`;
            this.applyFilters();
        });

        document.getElementById('reset-filters-btn')?.addEventListener('click', () => this.resetFilters());
    }

    applyFilters() {
        if (!this.videoElement) return;

        const filter = `brightness(${this.brightness}%) contrast(${this.contrast}%) saturate(${this.saturation}%) hue-rotate(${this.hue}deg)`;
        this.videoElement.style.filter = filter;
    }

    resetFilters() {
        this.brightness = 100;
        this.contrast = 100;
        this.saturation = 100;
        this.hue = 0;

        document.getElementById('brightness-slider').value = 100;
        document.getElementById('contrast-slider').value = 100;
        document.getElementById('saturation-slider').value = 100;
        document.getElementById('hue-slider').value = 0;

        document.getElementById('brightness-value').textContent = '100%';
        document.getElementById('contrast-value').textContent = '100%';
        document.getElementById('saturation-value').textContent = '100%';
        document.getElementById('hue-value').textContent = '0°';

        this.applyFilters();
    }

    saveFilterPreset(name) {
        const preset = {
            name,
            brightness: this.brightness,
            contrast: this.contrast,
            saturation: this.saturation,
            hue: this.hue
        };
        localStorage.setItem(`filterPreset_${name}`, JSON.stringify(preset));
    }

    loadFilterPreset(name) {
        const preset = localStorage.getItem(`filterPreset_${name}`);
        if (preset) {
            const data = JSON.parse(preset);
            this.brightness = data.brightness;
            this.contrast = data.contrast;
            this.saturation = data.saturation;
            this.hue = data.hue;

            document.getElementById('brightness-slider').value = this.brightness;
            document.getElementById('contrast-slider').value = this.contrast;
            document.getElementById('saturation-slider').value = this.saturation;
            document.getElementById('hue-slider').value = this.hue;

            this.applyFilters();
        }
    }
}

const videoFilterManager = new VideoFilterManager();
