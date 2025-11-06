class AspectRatioManager {
    constructor() {
        this.videoElement = null;
        this.currentAspectRatio = 'auto';
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupUI();
    }

    setupUI() {
        const playbackControlsGroup = document.querySelector('.controls-group.tertiary');
        if (!playbackControlsGroup) return;

        const aspectRatioBtn = document.createElement('button');
        aspectRatioBtn.className = 'icon-btn';
        aspectRatioBtn.id = 'aspect-ratio-btn';
        aspectRatioBtn.title = 'Change aspect ratio (auto, fit, fill, stretch, 16:9, 4:3)';
        aspectRatioBtn.innerHTML = '<i class="fas fa-expand"></i>';

        playbackControlsGroup.appendChild(aspectRatioBtn);

        aspectRatioBtn.addEventListener('click', () => this.showAspectRatioMenu());

        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            const aspectSection = document.createElement('div');
            aspectSection.className = 'settings-section';
            aspectSection.dataset.tab = 'aspect';
            aspectSection.innerHTML = `
                <h3>Aspect Ratio</h3>
                <div class="setting-item">
                    <label>Display Mode</label>
                    <select id="aspect-ratio-select" class="select-input">
                        <option value="auto">Auto (Default)</option>
                        <option value="16:9">16:9</option>
                        <option value="4:3">4:3</option>
                        <option value="21:9">21:9</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="fit">Fit to Window</option>
                        <option value="fill">Fill Window</option>
                        <option value="stretch">Stretch</option>
                    </select>
                </div>
            `;
            settingsContent.appendChild(aspectSection);

            document.getElementById('aspect-ratio-select')?.addEventListener('change', (e) => {
                this.setAspectRatio(e.target.value);
            });
        }
    }

    showAspectRatioMenu() {
        const existingMenu = document.getElementById('aspect-ratio-menu');
        if (existingMenu) existingMenu.remove();

        const menu = document.createElement('div');
        menu.id = 'aspect-ratio-menu';
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 4px 0;
            z-index: 1000;
            min-width: 150px;
        `;

        const ratios = [
            { label: 'Auto', value: 'auto' },
            { label: '16:9', value: '16:9' },
            { label: '4:3', value: '4:3' },
            { label: '21:9', value: '21:9' },
            { label: '1:1', value: '1:1' },
            { label: 'Fit', value: 'fit' },
            { label: 'Fill', value: 'fill' },
            { label: 'Stretch', value: 'stretch' }
        ];

        ratios.forEach(ratio => {
            const item = document.createElement('div');
            item.style.cssText = `
                padding: 8px 12px;
                cursor: pointer;
                transition: background-color 0.2s;
                ${this.currentAspectRatio === ratio.value ? 'background: var(--bg-tertiary); color: var(--text-primary);' : 'color: var(--text-secondary);'}
            `;
            item.textContent = ratio.label;
            item.onmouseover = () => item.style.background = 'var(--bg-tertiary)';
            item.onmouseout = () => {
                if (this.currentAspectRatio !== ratio.value) {
                    item.style.background = 'transparent';
                }
            };
            item.addEventListener('click', () => {
                this.setAspectRatio(ratio.value);
                menu.remove();
            });
            menu.appendChild(item);
        });

        document.body.appendChild(menu);

        const btn = document.getElementById('aspect-ratio-btn');
        const rect = btn?.getBoundingClientRect();
        if (rect) {
            menu.style.top = `${rect.bottom + 4}px`;
            menu.style.left = `${rect.left}px`;
        }

        document.addEventListener('click', (e) => {
            if (!menu.contains(e.target) && e.target !== btn && !btn?.contains(e.target)) {
                menu.remove();
            }
        }, { once: true });
    }

    setAspectRatio(ratio) {
        this.currentAspectRatio = ratio;
        if (!this.videoElement) return;

        const playerWrapper = document.querySelector('.player-wrapper');
        if (!playerWrapper) return;

        switch (ratio) {
            case 'auto':
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'contain';
                playerWrapper.style.aspectRatio = 'auto';
                break;
            case '16:9':
                playerWrapper.style.aspectRatio = '16 / 9';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'fill';
                break;
            case '4:3':
                playerWrapper.style.aspectRatio = '4 / 3';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'fill';
                break;
            case '21:9':
                playerWrapper.style.aspectRatio = '21 / 9';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'fill';
                break;
            case '1:1':
                playerWrapper.style.aspectRatio = '1 / 1';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'fill';
                break;
            case 'fit':
                playerWrapper.style.aspectRatio = 'auto';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'contain';
                break;
            case 'fill':
                playerWrapper.style.aspectRatio = 'auto';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'cover';
                break;
            case 'stretch':
                playerWrapper.style.aspectRatio = 'auto';
                this.videoElement.style.width = '100%';
                this.videoElement.style.height = '100%';
                this.videoElement.style.objectFit = 'fill';
                break;
        }

        const select = document.getElementById('aspect-ratio-select');
        if (select) select.value = ratio;
    }
}

const aspectRatioManager = new AspectRatioManager();
