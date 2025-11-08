if (!window.PlaybackProfileManager) {
    class PlaybackProfileManager {
    constructor() {
        this.currentProfile = null;
        this.init();
    }

    async init() {
        this.setupUI();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const profileSection = document.createElement('div');
        profileSection.className = 'settings-section';
        profileSection.dataset.tab = 'profiles';
        profileSection.innerHTML = `
            <h3>Playback Profiles</h3>
            <div class="setting-item">
                <label>Load Profile</label>
                <select id="profile-select" class="select-input">
                    <option value="">Create New...</option>
                </select>
            </div>
            <div class="setting-item">
                <input type="text" id="profile-name" placeholder="Profile name" style="width: 100%; padding: 8px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 4px; color: var(--text-primary);">
            </div>
            <div class="setting-item">
                <button class="btn btn-secondary" id="save-profile-btn">
                    <i class="fas fa-save"></i>
                    Save Current Settings
                </button>
                <button class="btn btn-secondary" id="delete-profile-btn">
                    <i class="fas fa-trash"></i>
                    Delete Profile
                </button>
            </div>
            <div class="setting-item">
                <small style="color: var(--text-tertiary);">Profiles save: volume, speed, filters, subtitles, audio track settings</small>
            </div>
        `;
        settingsContent.appendChild(profileSection);

        document.getElementById('save-profile-btn')?.addEventListener('click', () => this.saveProfile());
        document.getElementById('delete-profile-btn')?.addEventListener('click', () => this.deleteProfile());
        document.getElementById('profile-select')?.addEventListener('change', (e) => {
            if (e.target.value) {
                this.loadProfile(e.target.value);
            }
        });

        this.loadProfileList();
    }

    getCurrentSettings() {
        const videoPlayer = document.getElementById('video-player');
        const volumeSlider = document.getElementById('volume-slider');
        const speedBtn = document.getElementById('speed-btn');
        const brightnessSlider = document.getElementById('brightness-slider');
        const contrastSlider = document.getElementById('contrast-slider');
        const saturationSlider = document.getElementById('saturation-slider');

        return {
            volume: volumeSlider?.value || 70,
            speed: speedBtn?.dataset.speed || 1,
            brightness: brightnessSlider?.value || 100,
            contrast: contrastSlider?.value || 100,
            saturation: saturationSlider?.value || 100,
            subtitleFontSize: document.getElementById('subtitle-font-size')?.value || 16,
            subtitleOffset: document.getElementById('subtitle-offset')?.value || 0
        };
    }

    async saveProfile() {
        const profileName = document.getElementById('profile-name')?.value?.trim();
        if (!profileName) {
            alert('Please enter a profile name');
            return;
        }

        try {
            const settings = this.getCurrentSettings();
            await database.savePlaybackProfile(profileName, settings);
            document.getElementById('profile-name').value = '';
            this.loadProfileList();
            alert(`Profile "${profileName}" saved!`);
        } catch (error) {
            console.error('Failed to save profile:', error);
            alert('Failed to save profile');
        }
    }

    async loadProfile(profileName) {
        try {
            const profile = await database.getPlaybackProfile(profileName);
            if (!profile) return;

            const settings = profile.settings;
            if (settings.volume) {
                const volumeSlider = document.getElementById('volume-slider');
                if (volumeSlider) volumeSlider.value = settings.volume;
            }
            if (settings.speed) {
                const speedBtn = document.getElementById('speed-btn');
                if (speedBtn) speedBtn.click();
            }
            if (settings.brightness) {
                const slider = document.getElementById('brightness-slider');
                if (slider) slider.value = settings.brightness;
            }

            alert(`Profile "${profileName}" loaded!`);
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }

    async deleteProfile() {
        const select = document.getElementById('profile-select');
        const profileName = select?.value;

        if (!profileName) {
            alert('Please select a profile to delete');
            return;
        }

        if (!confirm(`Delete profile "${profileName}"?`)) return;

        try {
            await database.deletePlaybackProfile(profileName);
            this.loadProfileList();
            alert('Profile deleted!');
        } catch (error) {
            console.error('Failed to delete profile:', error);
        }
    }

    async loadProfileList() {
        try {
            const profiles = await database.getAllPlaybackProfiles();
            const select = document.getElementById('profile-select');
            if (!select) return;

            const currentValue = select.value;
            select.innerHTML = '<option value="">Create New...</option>';

            profiles.forEach(profile => {
                const option = document.createElement('option');
                option.value = profile.name;
                option.textContent = profile.name;
                select.appendChild(option);
            });

            if (currentValue && profiles.some(p => p.name === currentValue)) {
                select.value = currentValue;
            }
        } catch (error) {
            console.error('Failed to load profile list:', error);
        }
    }
    }

    window.PlaybackProfileManager = PlaybackProfileManager;
    const playbackProfileManager = new PlaybackProfileManager();
    window.playbackProfileManager = playbackProfileManager;
}
