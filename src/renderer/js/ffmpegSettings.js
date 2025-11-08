if (!window.FFmpegSettingsManager) {
    class FFmpegSettingsManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupUI();
    }

    setupUI() {
        const settingsContent = document.querySelector('.settings-content');
        if (!settingsContent) return;

        const ffmpegSection = document.createElement('div');
        ffmpegSection.className = 'settings-section';
        ffmpegSection.dataset.tab = 'ffmpeg';
        ffmpegSection.innerHTML = `
            <h3>FFmpeg Settings</h3>
            <div class="setting-item" style="background: #ef4444; color: white; padding: 12px; border-radius: 6px; margin-bottom: 16px;">
                <strong>⚠️ Warning:</strong> Advanced settings below. Incorrect configuration may cause transcoding failures.
            </div>
            <div class="setting-item">
                <label>Video Codec</label>
                <select id="ffmpeg-video-codec" class="select-input">
                    <option value="libx264">libx264 (H.264)</option>
                    <option value="libx265">libx265 (H.265)</option>
                    <option value="libvpx">libvpx (VP8)</option>
                    <option value="libvpx-vp9">libvpx-vp9 (VP9)</option>
                    <option value="libaom-av1">libaom-av1 (AV1)</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Encoding Preset</label>
                <select id="ffmpeg-preset" class="select-input">
                    <option value="ultrafast">Ultrafast (fastest)</option>
                    <option value="superfast">Superfast</option>
                    <option value="veryfast">Veryfast</option>
                    <option value="faster">Faster</option>
                    <option value="fast">Fast</option>
                    <option value="medium" selected>Medium (default)</option>
                    <option value="slow">Slow</option>
                    <option value="slower">Slower</option>
                    <option value="veryslow">Veryslow (best quality)</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Quality (CRF: 0-51)</label>
                <div class="slider-container">
                    <input type="range" id="ffmpeg-crf" class="slider-input" min="0" max="51" value="23" step="1">
                    <span class="slider-value" id="ffmpeg-crf-value">23 (default)</span>
                </div>
            </div>
            <div class="setting-item">
                <label>Audio Codec</label>
                <select id="ffmpeg-audio-codec" class="select-input">
                    <option value="aac" selected>AAC</option>
                    <option value="libmp3lame">MP3</option>
                    <option value="libvorbis">Vorbis</option>
                    <option value="libopus">Opus</option>
                    <option value="flac">FLAC</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Audio Bitrate</label>
                <select id="ffmpeg-audio-bitrate" class="select-input">
                    <option value="64k">64 kbps</option>
                    <option value="128k">128 kbps</option>
                    <option value="192k">192 kbps</option>
                    <option value="256k" selected>256 kbps</option>
                    <option value="320k">320 kbps</option>
                </select>
            </div>
            <div class="setting-item">
                <label>Container Format</label>
                <select id="ffmpeg-container" class="select-input">
                    <option value="mp4" selected>MP4</option>
                    <option value="mkv">Matroska (MKV)</option>
                    <option value="webm">WebM</option>
                    <option value="avi">AVI</option>
                    <option value="mov">MOV</option>
                </select>
            </div>
            <div class="setting-item checkbox">
                <input type="checkbox" id="ffmpeg-hardware-accel" class="checkbox-input">
                <label for="ffmpeg-hardware-accel">Enable Hardware Acceleration (if available)</label>
            </div>
            <div class="setting-item">
                <small style="color: var(--text-tertiary);">
                    • Faster presets = larger files<br>
                    • Lower CRF = better quality (0 = lossless, 51 = worst)<br>
                    • Hardware acceleration can speed up encoding
                </small>
            </div>
        `;
        settingsContent.appendChild(ffmpegSection);

        document.getElementById('ffmpeg-crf')?.addEventListener('input', (e) => {
            const crfValue = parseInt(e.target.value);
            let quality = 'Unknown';
            if (crfValue < 16) quality = 'Very High';
            else if (crfValue < 20) quality = 'High';
            else if (crfValue < 25) quality = 'Medium';
            else if (crfValue < 32) quality = 'Low';
            else quality = 'Very Low';

            document.getElementById('ffmpeg-crf-value').textContent = `${crfValue} (${quality})`;
        });
    }

    getFFmpegOptions() {
        return {
            videoCodec: document.getElementById('ffmpeg-video-codec')?.value || 'libx264',
            preset: document.getElementById('ffmpeg-preset')?.value || 'medium',
            crf: parseInt(document.getElementById('ffmpeg-crf')?.value || 23),
            audioCodec: document.getElementById('ffmpeg-audio-codec')?.value || 'aac',
            audioBitrate: document.getElementById('ffmpeg-audio-bitrate')?.value || '256k',
            container: document.getElementById('ffmpeg-container')?.value || 'mp4',
            hardwareAccel: document.getElementById('ffmpeg-hardware-accel')?.checked || false
        };
    }
    }

    window.FFmpegSettingsManager = FFmpegSettingsManager;
    const ffmpegSettingsManager = new FFmpegSettingsManager();
    window.ffmpegSettingsManager = ffmpegSettingsManager;
}
