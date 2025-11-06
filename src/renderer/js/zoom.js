class ZoomPanManager {
    constructor() {
        this.videoElement = null;
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupEventListeners();
        this.setupUI();
    }

    setupUI() {
        const playbackControlsGroup = document.querySelector('.controls-group.tertiary');
        if (playbackControlsGroup) {
            const zoomInBtn = document.createElement('button');
            zoomInBtn.className = 'icon-btn';
            zoomInBtn.id = 'zoom-in-btn';
            zoomInBtn.title = 'Zoom in (Ctrl/Cmd + Scroll)';
            zoomInBtn.innerHTML = '<i class="fas fa-magnifying-glass-plus"></i>';
            zoomInBtn.addEventListener('click', () => this.zoomIn());

            const zoomOutBtn = document.createElement('button');
            zoomOutBtn.className = 'icon-btn';
            zoomOutBtn.id = 'zoom-out-btn';
            zoomOutBtn.title = 'Zoom out';
            zoomOutBtn.innerHTML = '<i class="fas fa-magnifying-glass-minus"></i>';
            zoomOutBtn.addEventListener('click', () => this.zoomOut());

            const zoomResetBtn = document.createElement('button');
            zoomResetBtn.className = 'icon-btn';
            zoomResetBtn.id = 'zoom-reset-btn';
            zoomResetBtn.title = 'Reset zoom';
            zoomResetBtn.innerHTML = '<i class="fas fa-magnifying-glass"></i>';
            zoomResetBtn.addEventListener('click', () => this.resetZoom());

            playbackControlsGroup.appendChild(zoomInBtn);
            playbackControlsGroup.appendChild(zoomOutBtn);
            playbackControlsGroup.appendChild(zoomResetBtn);
        }
    }

    setupEventListeners() {
        if (!this.videoElement) return;

        this.videoElement.addEventListener('wheel', (e) => {
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                if (e.deltaY < 0) {
                    this.zoomIn();
                } else {
                    this.zoomOut();
                }
            }
        });

        this.videoElement.addEventListener('mousedown', (e) => {
            if (this.zoomLevel > 1) {
                this.isDragging = true;
                this.dragStart = { x: e.clientX, y: e.clientY };
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.zoomLevel > 1) {
                const deltaX = e.clientX - this.dragStart.x;
                const deltaY = e.clientY - this.dragStart.y;

                this.panX += deltaX * 0.5;
                this.panY += deltaY * 0.5;

                this.dragStart = { x: e.clientX, y: e.clientY };
                this.applyTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    zoomIn() {
        this.zoomLevel = Math.min(this.zoomLevel + 0.2, 3);
        this.applyTransform();
    }

    zoomOut() {
        this.zoomLevel = Math.max(this.zoomLevel - 0.2, 1);
        if (this.zoomLevel === 1) {
            this.panX = 0;
            this.panY = 0;
        }
        this.applyTransform();
    }

    resetZoom() {
        this.zoomLevel = 1;
        this.panX = 0;
        this.panY = 0;
        this.applyTransform();
    }

    applyTransform() {
        if (!this.videoElement) return;
        this.videoElement.style.transform = `scale(${this.zoomLevel}) translate(${this.panX}px, ${this.panY}px)`;
        this.videoElement.style.transformOrigin = 'center center';
    }
}

const zoomPanManager = new ZoomPanManager();
