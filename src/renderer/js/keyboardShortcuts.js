class KeyboardShortcutsManager {
    constructor() {
        this.shortcuts = {
            'play-pause': { keys: 'Space', action: 'Toggle play/pause' },
            'mute': { keys: 'M', action: 'Toggle mute' },
            'fullscreen': { keys: 'F', action: 'Toggle fullscreen' },
            'skip-forward': { keys: 'Right', action: 'Skip forward 10s' },
            'skip-backward': { keys: 'Left', action: 'Skip backward 10s' },
            'volume-up': { keys: 'ArrowUp', action: 'Increase volume' },
            'volume-down': { keys: 'ArrowDown', action: 'Decrease volume' },
            'next-track': { keys: 'N', action: 'Next track' },
            'prev-track': { keys: 'P', action: 'Previous track' },
            'subtitle-toggle': { keys: 'S', action: 'Toggle subtitles' },
            'bookmark': { keys: 'B', action: 'Add bookmark' },
            'screenshot': { keys: 'C', action: 'Capture screenshot' }
        };
        this.init();
    }

    async init() {
        await this.loadShortcuts();
        this.setupUI();
        this.setupKeyboardListener();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const shortcutsSection = document.createElement('div');
        shortcutsSection.className = 'settings-section';
        shortcutsSection.dataset.tab = 'shortcuts';
        shortcutsSection.innerHTML = `
            <h3>Keyboard Shortcuts</h3>
            <div class="shortcuts-list" id="shortcuts-list"></div>
            <div class="setting-item">
                <button class="btn btn-secondary" id="reset-shortcuts-btn">
                    <i class="fas fa-redo"></i>
                    Reset to Defaults
                </button>
            </div>
        `;
        settingsContent.appendChild(shortcutsSection);

        this.renderShortcuts();

        document.getElementById('reset-shortcuts-btn')?.addEventListener('click', () => this.resetShortcuts());
    }

    renderShortcuts() {
        const list = document.getElementById('shortcuts-list');
        if (!list) return;

        list.innerHTML = '';
        Object.entries(this.shortcuts).forEach(([id, shortcut]) => {
            const item = document.createElement('div');
            item.className = 'shortcut-item';
            item.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 12px;
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: 4px;
                margin-bottom: 8px;
            `;

            item.innerHTML = `
                <div>
                    <div style="font-weight: 500; color: var(--text-primary);">${shortcut.action}</div>
                    <div style="font-size: 11px; color: var(--text-tertiary);">ID: ${id}</div>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <input type="text" class="shortcut-input" value="${shortcut.keys}" data-id="${id}" 
                        style="width: 100px; padding: 6px 8px; background: var(--bg-tertiary); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);">
                    <button class="icon-btn" data-id="${id}" title="Record new shortcut">
                        <i class="fas fa-microphone"></i>
                    </button>
                </div>
            `;

            const recordBtn = item.querySelector('[title="Record new shortcut"]');
            recordBtn?.addEventListener('click', () => this.recordShortcut(id));

            const input = item.querySelector('.shortcut-input');
            input?.addEventListener('change', () => this.saveShortcut(id, input.value));

            list.appendChild(item);
        });
    }

    recordShortcut(id) {
        const input = document.querySelector(`input[data-id="${id}"]`);
        if (!input) return;

        input.value = 'Press keys...';
        input.disabled = true;

        const handleKeyDown = (e) => {
            e.preventDefault();
            const keys = [];
            if (e.ctrlKey) keys.push('Ctrl');
            if (e.shiftKey) keys.push('Shift');
            if (e.altKey) keys.push('Alt');
            if (e.metaKey) keys.push('Cmd');
            if (e.key !== 'Control' && e.key !== 'Shift' && e.key !== 'Alt' && e.key !== 'Meta') {
                keys.push(e.key.charAt(0).toUpperCase() + e.key.slice(1));
            }

            const shortcutStr = keys.join('+');
            if (shortcutStr.split('+').length > 1) {
                input.value = shortcutStr;
                this.saveShortcut(id, shortcutStr);
                input.disabled = false;
                document.removeEventListener('keydown', handleKeyDown);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
    }

    async saveShortcut(id, keys) {
        try {
            this.shortcuts[id].keys = keys;
            await database.saveKeyboardShortcut(id, keys);
        } catch (error) {
            console.error('Failed to save shortcut:', error);
        }
    }

    async loadShortcuts() {
        try {
            const saved = await database.getAllKeyboardShortcuts();
            saved.forEach(item => {
                if (this.shortcuts[item.action]) {
                    this.shortcuts[item.action].keys = item.keys;
                }
            });
        } catch (error) {
            console.error('Failed to load shortcuts:', error);
        }
    }

    async resetShortcuts() {
        if (!confirm('Reset all shortcuts to default?')) return;

        const defaults = {
            'play-pause': 'Space',
            'mute': 'M',
            'fullscreen': 'F',
            'skip-forward': 'Right',
            'skip-backward': 'Left',
            'volume-up': 'ArrowUp',
            'volume-down': 'ArrowDown',
            'next-track': 'N',
            'prev-track': 'P',
            'subtitle-toggle': 'S',
            'bookmark': 'B',
            'screenshot': 'C'
        };

        Object.entries(defaults).forEach(([id, keys]) => {
            this.shortcuts[id].keys = keys;
        });

        this.renderShortcuts();
    }

    setupKeyboardListener() {
        document.addEventListener('keydown', (e) => {
            const keys = [];
            if (e.ctrlKey) keys.push('Ctrl');
            if (e.shiftKey) keys.push('Shift');
            if (e.altKey) keys.push('Alt');
            if (e.metaKey) keys.push('Cmd');
            keys.push(e.key.charAt(0).toUpperCase() + e.key.slice(1));

            const shortcutStr = keys.join('+');

            for (const [id, shortcut] of Object.entries(this.shortcuts)) {
                if (shortcut.keys === shortcutStr) {
                    this.executeShortcut(id);
                    break;
                }
            }
        });
    }

    executeShortcut(id) {
        switch (id) {
            case 'play-pause':
                document.getElementById('play-btn')?.click();
                break;
            case 'fullscreen':
                document.getElementById('fullscreen-btn')?.click();
                break;
            case 'mute':
                document.getElementById('volume-btn')?.click();
                break;
            case 'skip-forward':
                document.getElementById('forward-btn')?.click();
                break;
            case 'skip-backward':
                document.getElementById('rewind-btn')?.click();
                break;
            case 'next-track':
                document.getElementById('next-btn')?.click();
                break;
            case 'prev-track':
                document.getElementById('prev-btn')?.click();
                break;
            case 'bookmark':
                document.getElementById('bookmark-btn')?.click();
                break;
            case 'screenshot':
                document.getElementById('screenshot-btn')?.click();
                break;
        }
    }
}

const keyboardShortcutsManager = new KeyboardShortcutsManager();
