class AudioTrackManager {
    constructor() {
        this.audioTracks = [];
        this.currentTrack = 0;
        this.videoElement = null;
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupUI();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const audioSection = document.createElement('div');
        audioSection.className = 'settings-section';
        audioSection.dataset.tab = 'audio';
        audioSection.innerHTML = `
            <h3>Audio</h3>
            <div class="setting-item">
                <label>Audio Track</label>
                <select id="audio-track-select" class="select-input">
                    <option value="default">Default</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Audio Enhancement</label>
                <select id="audio-enhancement" class="select-input">
                    <option value="none">None</option>
                    <option value="speech">Speech Enhancement</option>
                    <option value="music">Music Enhancement</option>
                    <option value="cinema">Cinema</option>
                    <option value="concert">Concert</option>
                </select>
            </div>
            <div class="setting-item checkbox">
                <input type="checkbox" id="audio-normalization" class="checkbox-input">
                <label for="audio-normalization">Audio Normalization</label>
            </div>
            <div class="setting-item">
                <label>Bass</label>
                <div class="slider-container">
                    <input type="range" id="audio-bass" class="slider-input" min="-20" max="20" value="0" step="1">
                    <span class="slider-value" id="audio-bass-value">0 dB</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Treble</label>
                <div class="slider-container">
                    <input type="range" id="audio-treble" class="slider-input" min="-20" max="20" value="0" step="1">
                    <span class="slider-value" id="audio-treble-value">0 dB</span>
                </div>
            </div>
        `;
        settingsContent.appendChild(audioSection);

        document.getElementById('audio-enhancement')?.addEventListener('change', (e) => this.applyAudioPreset(e.target.value));
        document.getElementById('audio-bass')?.addEventListener('input', (e) => this.setBass(e.target.value));
        document.getElementById('audio-treble')?.addEventListener('input', (e) => this.setTreble(e.target.value));
        document.getElementById('audio-normalization')?.addEventListener('change', (e) => this.toggleNormalization(e.target.checked));
    }

    async loadAudioTracks(filePath) {
        try {
            this.audioTracks = await window.electronAPI.getAudioTracks(filePath);

            const select = document.getElementById('audio-track-select');
            if (select && this.audioTracks.length > 0) {
                select.innerHTML = '';
                this.audioTracks.forEach((track, index) => {
                    const option = document.createElement('option');
                    option.value = index;
                    option.textContent = track.title || `Track ${index + 1}`;
                    if (track.language && track.language !== 'unknown') {
                        option.textContent += ` (${track.language})`;
                    }
                    select.appendChild(option);
                });

                select.addEventListener('change', (e) => this.selectTrack(parseInt(e.target.value)));
            }
        } catch (error) {
            console.error('Failed to load audio tracks:', error);
        }
    }

    selectTrack(trackIndex) {
        this.currentTrack = trackIndex;
        if (this.videoElement) {
            const audioTracks = this.videoElement.audioTracks;
            for (let i = 0; i < audioTracks.length; i++) {
                audioTracks[i].enabled = (i === trackIndex);
            }
        }
    }

    applyAudioPreset(preset) {
        switch (preset) {
            case 'speech':
                this.setBass(5);
                this.setTreble(10);
                break;
            case 'music':
                this.setBass(10);
                this.setTreble(10);
                break;
            case 'cinema':
                this.setBass(15);
                this.setTreble(5);
                break;
            case 'concert':
                this.setBass(5);
                this.setTreble(15);
                break;
            default:
                this.setBass(0);
                this.setTreble(0);
        }
    }

    setBass(value) {
        const val = parseInt(value);
        document.getElementById('audio-bass-value').textContent = `${val} dB`;
        if (this.videoElement) {
            this.applyAudioFilter();
        }
    }

    setTreble(value) {
        const val = parseInt(value);
        document.getElementById('audio-treble-value').textContent = `${val} dB`;
        if (this.videoElement) {
            this.applyAudioFilter();
        }
    }

    toggleNormalization(enabled) {
        if (this.videoElement) {
            this.applyAudioFilter();
        }
    }

    applyAudioFilter() {
        const bass = parseInt(document.getElementById('audio-bass')?.value || 0);
        const treble = parseInt(document.getElementById('audio-treble')?.value || 0);

        if (this.videoElement && this.videoElement.srcObject) {
            try {
                const context = new (window.AudioContext || window.webkitAudioContext)();
                const source = context.createMediaElementAudioSource(this.videoElement);

                const bassGain = context.createBiquadFilter();
                bassGain.type = 'lowshelf';
                bassGain.frequency.value = 200;
                bassGain.gain.value = bass;

                const trebleGain = context.createBiquadFilter();
                trebleGain.type = 'highshelf';
                trebleGain.frequency.value = 3000;
                trebleGain.gain.value = treble;

                source.connect(bassGain);
                bassGain.connect(trebleGain);
                trebleGain.connect(context.destination);
            } catch (error) {
                console.error('Failed to apply audio filter:', error);
            }
        }
    }
}

const audioTrackManager = new AudioTrackManager();
window.audioTrackManager = audioTrackManager;
