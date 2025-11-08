if (!window.PerformanceMetrics) {
    class PerformanceMetrics {
    constructor() {
        this.videoElement = null;
        this.startTime = Date.now();
        this.metrics = {
            fps: 0,
            cpuUsage: 0,
            memoryUsage: 0,
            bytesLoaded: 0,
            totalBytes: 0
        };
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.startMonitoring();
    }

    startMonitoring() {
        if (this.videoElement) {
            this.videoElement.addEventListener('loadedmetadata', () => {
                this.totalBytes = this.videoElement.buffered.length > 0 ? 
                    this.videoElement.duration * 1024 * 1024 : 0;
            });
        }

        setInterval(() => this.updateMetrics(), 1000);
    }

    updateMetrics() {
        if (this.videoElement) {
            if (this.videoElement.buffered.length > 0) {
                this.metrics.bytesLoaded = this.videoElement.buffered.end(this.videoElement.buffered.length - 1) * 1024;
            }
        }

        if (performance.memory) {
            this.metrics.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576);
            this.metrics.totalMemory = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
        }
    }

    getMetrics() {
        return {
            ...this.metrics,
            uptime: Math.round((Date.now() - this.startTime) / 1000),
            bufferLength: this.videoElement?.buffered.length || 0,
            playbackRate: this.videoElement?.playbackRate || 1,
            volume: this.videoElement?.volume || 0
        };
    }

    displayMetrics(modal) {
        if (!modal) return;

        const metricsContent = modal.querySelector('#media-info-content');
        if (!metricsContent) return;

        const perf = this.getMetrics();
        const section = document.createElement('div');
        section.className = 'info-grid';
        section.innerHTML = `
            <div class="info-item">
                <label>Memory Usage</label>
                <span>${perf.memoryUsage}MB / ${perf.totalMemory || '?'}MB</span>
            </div>
            <div class="info-item">
                <label>Buffered</label>
                <span>${this.formatBytes(perf.bytesLoaded)} / ${this.formatBytes(perf.totalBytes)}</span>
            </div>
            <div class="info-item">
                <label>Playback Rate</label>
                <span>${perf.playbackRate}x</span>
            </div>
            <div class="info-item">
                <label>Volume</label>
                <span>${Math.round(perf.volume * 100)}%</span>
            </div>
            <div class="info-item">
                <label>Uptime</label>
                <span>${this.formatTime(perf.uptime)}</span>
            </div>
            <div class="info-item">
                <label>Buffer Count</label>
                <span>${perf.bufferLength} segments</span>
            </div>
        `;

        metricsContent.appendChild(section);
    }

    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours}h ${minutes}m ${secs}s`;
    }
    }

    window.PerformanceMetrics = PerformanceMetrics;
    const performanceMetrics = new PerformanceMetrics();
    window.performanceMetrics = performanceMetrics;
}
