// Settings Management
class SettingsManager {
    constructor() {
        this.defaults = {
            // Appearance
            theme: 'dark',
            accentColor: '#a855f7',
            controlStyle: 'modern',
            autoHideControls: true,
            controlOpacity: 0.8,
            backdropBlur: true,
            overlayBlur: 1.0,
            animationsEnabled: true,
            uiDensity: 'comfortable', // compact, comfortable, spacious

            // Playback
            defaultVolume: 70,
            rememberPosition: true,
            autoPlay: false,
            smoothSeeking: true,

            // Behavior
            doubleClickAction: 'fullscreen',
            mouseWheelAction: 'volume',
            showTooltips: true,
            tooltipPosition: 'smart', // smart, above, below

            // Advanced
            keyboardShortcuts: true,
            loopPlaylist: true,
            shuffleMode: false,
            showControlsOnHover: true,
        };
        this.settings = { ...this.defaults };
        this.loadSettings();
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('pulseSettings');
            if (saved) {
                this.settings = { ...this.defaults, ...JSON.parse(saved) };
            }
        } catch (e) {
            console.error('Failed to load settings:', e);
            this.settings = { ...this.defaults };
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('pulseSettings', JSON.stringify(this.settings));
            this.applySettings();
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    }

    getSetting(key) {
        return this.settings[key] !== undefined ? this.settings[key] : this.defaults[key];
    }

    setSetting(key, value) {
        this.settings[key] = value;
        this.saveSettings();
    }

    applySettings() {
        // Apply theme
        document.body.classList.remove('dark-theme', 'light-theme', 'system-theme');
        const theme = this.settings.theme;
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'system') {
            document.body.classList.add('system-theme');
        }

        // Apply accent color with brightness adjustments
        document.documentElement.style.setProperty('--accent', this.settings.accentColor);
        const lighter = this.lightenColor(this.settings.accentColor, 15);
        const darker = this.darkenColor(this.settings.accentColor, 15);
        document.documentElement.style.setProperty('--accent-light', lighter);
        document.documentElement.style.setProperty('--accent-hover', darker);

        // Apply control opacity
        document.documentElement.style.setProperty('--control-opacity', this.settings.controlOpacity);

        // Apply backdrop blur
        document.documentElement.style.setProperty('--backdrop-blur',
            this.settings.backdropBlur ? '1' : '0');

        // Apply overlay blur
        document.documentElement.style.setProperty('--overlay-blur', this.settings.overlayBlur);

        // Apply animations
        document.documentElement.style.setProperty('--animations-enabled',
            this.settings.animationsEnabled ? '1' : '0');

        // Apply UI density
        document.documentElement.style.setProperty('--ui-density', this.settings.uiDensity);

        // Apply auto-hide controls
        document.documentElement.style.setProperty('--auto-hide-controls',
            this.settings.autoHideControls ? '1' : '0');

        // Apply tooltip position
        document.documentElement.style.setProperty('--tooltip-position', this.settings.tooltipPosition);

        // Apply show controls on hover
        document.documentElement.style.setProperty('--show-controls-on-hover',
            this.settings.showControlsOnHover ? '1' : '0');
    }

    resetToDefaults() {
        this.settings = { ...this.defaults };
        this.saveSettings();
        this.updateUI();
    }

    updateUI() {
        // Appearance Settings
        const themeSelect = document.getElementById('theme-select');
        const accentColor = document.getElementById('accent-color');
        const accentValue = document.getElementById('accent-color-value');
        const uiDensity = document.getElementById('ui-density');
        const controlOpacity = document.getElementById('control-opacity');
        const controlOpacityValue = document.getElementById('control-opacity-value');
        const backdropBlur = document.getElementById('backdrop-blur');
        const overlayBlur = document.getElementById('overlay-blur');
        const overlayBlurValue = document.getElementById('overlay-blur-value');
        const autoHideControls = document.getElementById('auto-hide-controls');
        const animationsEnabled = document.getElementById('animations-enabled');

        if (themeSelect) themeSelect.value = this.settings.theme;
        if (accentColor) {
            accentColor.value = this.settings.accentColor;
            if (accentValue) accentValue.textContent = this.settings.accentColor;
        }
        if (uiDensity) uiDensity.value = this.settings.uiDensity;
        if (controlOpacity) {
            controlOpacity.value = Math.round(this.settings.controlOpacity * 100);
            if (controlOpacityValue) controlOpacityValue.textContent = Math.round(this.settings.controlOpacity * 100) + '%';
        }
        if (backdropBlur) backdropBlur.checked = this.settings.backdropBlur;
        if (overlayBlur) {
            overlayBlur.value = Math.round(this.settings.overlayBlur * 100);
            if (overlayBlurValue) overlayBlurValue.textContent = Math.round(this.settings.overlayBlur * 100) + '%';
        }
        if (autoHideControls) autoHideControls.checked = this.settings.autoHideControls;
        if (animationsEnabled) animationsEnabled.checked = this.settings.animationsEnabled;

        // Playback Settings
        const defaultVolume = document.getElementById('default-volume');
        const defaultVolumeValue = document.getElementById('default-volume-value');
        const rememberPosition = document.getElementById('remember-position');
        const autoPlay = document.getElementById('auto-play');
        const smoothSeeking = document.getElementById('smooth-seeking');

        if (defaultVolume) {
            defaultVolume.value = this.settings.defaultVolume;
            if (defaultVolumeValue) defaultVolumeValue.textContent = this.settings.defaultVolume + '%';
        }
        if (rememberPosition) rememberPosition.checked = this.settings.rememberPosition;
        if (autoPlay) autoPlay.checked = this.settings.autoPlay;
        if (smoothSeeking) smoothSeeking.checked = this.settings.smoothSeeking;

        // Behavior Settings
        const doubleClickAction = document.getElementById('double-click-action');
        const mouseWheelAction = document.getElementById('mouse-wheel-action');
        const showTooltips = document.getElementById('show-tooltips');

        if (doubleClickAction) doubleClickAction.value = this.settings.doubleClickAction;
        if (mouseWheelAction) mouseWheelAction.value = this.settings.mouseWheelAction;
        if (showTooltips) showTooltips.checked = this.settings.showTooltips;

        // Advanced Settings
        const keyboardShortcuts = document.getElementById('keyboard-shortcuts');
        const loopPlaylist = document.getElementById('loop-playlist');
        const shuffleMode = document.getElementById('shuffle-mode');

        if (keyboardShortcuts) keyboardShortcuts.checked = this.settings.keyboardShortcuts;
        if (loopPlaylist) loopPlaylist.checked = this.settings.loopPlaylist;
        if (shuffleMode) shuffleMode.checked = this.settings.shuffleMode;
    }

    setupEventListeners() {
        // Appearance
        document.getElementById('theme-select')?.addEventListener('change', (e) => {
            this.setSetting('theme', e.target.value);
        });

        document.getElementById('accent-color')?.addEventListener('input', (e) => {
            const color = e.target.value;
            this.setSetting('accentColor', color);
            const accentValue = document.getElementById('accent-color-value');
            if (accentValue) accentValue.textContent = color;
        });

        document.getElementById('ui-density')?.addEventListener('change', (e) => {
            this.setSetting('uiDensity', e.target.value);
        });

        document.getElementById('control-opacity')?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.setSetting('controlOpacity', value);
            const valueDisplay = document.getElementById('control-opacity-value');
            if (valueDisplay) valueDisplay.textContent = e.target.value + '%';
            document.documentElement.style.setProperty('--control-opacity', value);
        });

        document.getElementById('backdrop-blur')?.addEventListener('change', (e) => {
            this.setSetting('backdropBlur', e.target.checked);
            document.documentElement.style.setProperty('--backdrop-blur', e.target.checked ? '1' : '0');
        });

        document.getElementById('overlay-blur')?.addEventListener('input', (e) => {
            const value = e.target.value / 100;
            this.setSetting('overlayBlur', value);
            const valueDisplay = document.getElementById('overlay-blur-value');
            if (valueDisplay) valueDisplay.textContent = e.target.value + '%';
            document.documentElement.style.setProperty('--overlay-blur', value);
        });

        document.getElementById('auto-hide-controls')?.addEventListener('change', (e) => {
            this.setSetting('autoHideControls', e.target.checked);
        });

        document.getElementById('animations-enabled')?.addEventListener('change', (e) => {
            this.setSetting('animationsEnabled', e.target.checked);
            document.documentElement.style.setProperty('--animations-enabled', e.target.checked ? '1' : '0');
        });

        // Playback
        document.getElementById('default-volume')?.addEventListener('input', (e) => {
            const value = e.target.value;
            this.setSetting('defaultVolume', parseInt(value));
            const valueDisplay = document.getElementById('default-volume-value');
            if (valueDisplay) valueDisplay.textContent = value + '%';
        });

        document.getElementById('remember-position')?.addEventListener('change', (e) => {
            this.setSetting('rememberPosition', e.target.checked);
        });

        document.getElementById('auto-play')?.addEventListener('change', (e) => {
            this.setSetting('autoPlay', e.target.checked);
        });

        document.getElementById('smooth-seeking')?.addEventListener('change', (e) => {
            this.setSetting('smoothSeeking', e.target.checked);
        });

        // Behavior
        document.getElementById('double-click-action')?.addEventListener('change', (e) => {
            this.setSetting('doubleClickAction', e.target.value);
        });

        document.getElementById('mouse-wheel-action')?.addEventListener('change', (e) => {
            this.setSetting('mouseWheelAction', e.target.value);
        });

        document.getElementById('show-tooltips')?.addEventListener('change', (e) => {
            this.setSetting('showTooltips', e.target.checked);
        });

        document.getElementById('tooltip-position')?.addEventListener('change', (e) => {
            this.setSetting('tooltipPosition', e.target.value);
        });

        document.getElementById('show-controls-on-hover')?.addEventListener('change', (e) => {
            this.setSetting('showControlsOnHover', e.target.checked);
        });

        // Advanced
        document.getElementById('keyboard-shortcuts')?.addEventListener('change', (e) => {
            this.setSetting('keyboardShortcuts', e.target.checked);
        });

        document.getElementById('loop-playlist')?.addEventListener('change', (e) => {
            this.setSetting('loopPlaylist', e.target.checked);
        });

        document.getElementById('shuffle-mode')?.addEventListener('change', (e) => {
            this.setSetting('shuffleMode', e.target.checked);
        });

        document.getElementById('reset-settings-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset all settings to defaults?')) {
                this.resetToDefaults();
            }
        });
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.min(255, Math.floor(num / 65536) + percent);
        const g = Math.min(255, Math.floor((num / 256) % 256) + percent);
        const b = Math.min(255, (num % 256) + percent);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const r = Math.max(0, Math.floor(num / 65536) - percent);
        const g = Math.max(0, Math.floor((num / 256) % 256) - percent);
        const b = Math.max(0, (num % 256) - percent);
        return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
    }
}

// Initialize settings globally
window.settingsManager = new SettingsManager();

// Wait for DOM and apply settings
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.settingsManager.applySettings();
        window.settingsManager.updateUI();
        window.settingsManager.setupEventListeners();
    });
} else {
    window.settingsManager.applySettings();
    window.settingsManager.updateUI();
    window.settingsManager.setupEventListeners();
}