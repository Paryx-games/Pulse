if (!window.playerInitialized) {
    window.playerInitialized = true;


    const videoPlayer = document.getElementById('video-player');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const openFileBtn = document.getElementById('open-file-btn');
    const progressBar = document.getElementById('progress-bar');
    const currentTimeDisplay = document.getElementById('current-time');
    const totalTimeDisplay = document.getElementById('total-time');
    const volumeSlider = document.getElementById('volume-slider');
    const volumeBtn = document.getElementById('volume-btn');
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const playlistBtn = document.getElementById('playlist-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const infoBtn = document.getElementById('info-btn');
    const fileInput = document.getElementById('file-input');
    const centerPlayBtn = document.getElementById('center-play-btn');
    const loopBtn = document.getElementById('loop-btn');
    const speedBtn = document.getElementById('speed-btn');
    const playlistSidebar = document.getElementById('playlist-sidebar');
    const closePlaylistBtn = document.getElementById('close-playlist-btn');
    const settingsModal = document.getElementById('settings-modal');
    const infoModal = document.getElementById('info-modal');
    const settingsCloseBtn = document.getElementById('settings-close-btn');
    const infoCloseBtn = document.getElementById('info-close-btn');
    const loadingState = document.getElementById('loading-state');
    const emptyState = document.getElementById('empty-state');
    const emptyLoadBtn = document.getElementById('empty-load-btn');
    const fileName = document.getElementById('file-name');
    const playerWrapper = document.querySelector('.player-wrapper');
    const infoBar = document.querySelector('.info-bar');
    const playbackControls = document.querySelector('.playback-controls');


    let playlist = [];
    let currentIndex = 0;
    let isPlaying = false;
    let isLooping = false;
    let playbackSpeeds = [0.5, 0.75, 1, 1.25, 1.5, 2];
    let currentSpeedIndex = 2;
    let previousVolume = 70;
    let isMuted = false;
    let hideControlsTimeout = null;
    let mouseMoveTimeout = null;


    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePlayer);
    } else {
        initializePlayer();
    }

    function initializePlayer() {
        setupEventListeners();
        loadPlaylistFromStorage();
        setDefaultVolume();
        updatePlayButtonState();
        showEmptyState();
        setupMouseControl();
        setupSmartTooltips();
        applySettings();
        loadVersion();
    }


    function setupEventListeners() {
        playBtn.addEventListener('click', togglePlayPause);
        centerPlayBtn.addEventListener('click', togglePlayPause);
        videoPlayer.addEventListener('dblclick', handleDoublClick);

        stopBtn.addEventListener('click', stopVideo);

        prevBtn.addEventListener('click', playPrevious);
        nextBtn.addEventListener('click', playNext);

        openFileBtn.addEventListener('click', () => fileInput.click());
        emptyLoadBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);

        progressBar.addEventListener('input', seekVideo);

        volumeSlider.addEventListener('input', updateVolume);
        volumeBtn.addEventListener('click', toggleMute);

        videoPlayer.addEventListener('timeupdate', updateProgress);
        videoPlayer.addEventListener('loadedmetadata', updateTotalTime);
        videoPlayer.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButtonState();
        });
        videoPlayer.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButtonState();
        });
        videoPlayer.addEventListener('ended', handleVideoEnd);

        fullscreenBtn.addEventListener('click', toggleFullscreen);

        playlistBtn.addEventListener('click', togglePlaylist);
        closePlaylistBtn.addEventListener('click', () => playlistSidebar.classList.remove('active'));

        settingsBtn.addEventListener('click', openSettings);
        settingsCloseBtn.addEventListener('click', closeSettings);

        infoBtn.addEventListener('click', openInfo);
        infoCloseBtn.addEventListener('click', closeInfo);

        loopBtn.addEventListener('click', toggleLoop);

        speedBtn.addEventListener('click', changeSpeed);

        document.addEventListener('keydown', handleKeyboard);

        playerWrapper.addEventListener('dragover', handleDragOver);
        playerWrapper.addEventListener('dragleave', handleDragLeave);
        playerWrapper.addEventListener('drop', handleDrop);

        document.querySelectorAll('.modal-overlay').forEach(overlay => {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                    closeSettings();
                    closeInfo();
                }
            });
        });
    }

    function setupMouseControl() {
        playerWrapper.addEventListener('mousemove', () => {
            playerWrapper.classList.add('show-controls');
            clearTimeout(hideControlsTimeout);
            clearTimeout(mouseMoveTimeout);

            const autoHide = window.settingsManager.getSetting('autoHideControls');
            if (autoHide) {
                hideControlsTimeout = setTimeout(() => {
                    playerWrapper.classList.remove('show-controls');
                }, 3000);
            }
        });

        playerWrapper.addEventListener('mouseleave', () => {
            playerWrapper.classList.remove('show-controls');
            clearTimeout(hideControlsTimeout);
        });

        playerWrapper.addEventListener('wheel', handleMouseWheel, { passive: true });
    }

    function setupSmartTooltips() {

        document.querySelectorAll('[title]').forEach(btn => {
            btn.addEventListener('mouseenter', function () {
                const rect = this.getBoundingClientRect();

                const spaceAbove = rect.top;
                const spaceBelow = window.innerHeight - rect.bottom;
                const tooltipHeight = 40;
                const threshold = 120;

                if (spaceAbove < threshold) {
                    this.setAttribute('data-tooltip-position', 'below');
                } else {
                    this.setAttribute('data-tooltip-position', 'above');
                }
            });
        });


        const style = document.createElement('style');
        style.textContent = `
            .icon-btn[data-tooltip-position="below"][title]:hover::after {
                bottom: auto !important;
                top: 130% !important;
            }
            
            .icon-btn[data-tooltip-position="below"][title]:hover::before {
                bottom: auto !important;
                top: 120% !important;
                border-top-color: transparent !important;
                border-bottom-color: rgba(0, 0, 0, 0.8) !important;
            }
        `;
        document.head.appendChild(style);
    }


    function togglePlayPause() {
        if (!videoPlayer.src) return;
        if (isPlaying) {
            videoPlayer.pause();
        } else {
            videoPlayer.play();
        }
    }

    function stopVideo() {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        isPlaying = false;
        updatePlayButtonState();
    }

    function playPrevious() {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        loadPlaylistItem(currentIndex);
    }

    function playNext() {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        loadPlaylistItem(currentIndex);
    }

    function handleVideoEnd() {
        if (isLooping) {
            videoPlayer.currentTime = 0;
            videoPlayer.play();
        } else {
            const autoPlay = window.settingsManager.getSetting('autoPlay');
            const loopPlaylist = window.settingsManager.getSetting('loopPlaylist');

            if (autoPlay) {
                if (currentIndex < playlist.length - 1) {
                    playNext();
                } else if (loopPlaylist) {
                    currentIndex = 0;
                    loadPlaylistItem(0);
                }
            }
        }
    }

    function toggleLoop() {
        isLooping = !isLooping;
        loopBtn.classList.toggle('active', isLooping);
    }

    function changeSpeed() {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
        const speed = playbackSpeeds[currentSpeedIndex];
        videoPlayer.playbackRate = speed;
        speedBtn.textContent = speed + 'x';
        speedBtn.setAttribute('data-speed', speed);
    }


    function setDefaultVolume() {
        const defaultVol = window.settingsManager.getSetting('defaultVolume');
        volumeSlider.value = defaultVol;
        videoPlayer.volume = defaultVol / 100;
        updateVolumeSlider();
        updateVolumeIcon();
    }

    function updateVolume() {
        const volume = volumeSlider.value / 100;
        videoPlayer.volume = volume;
        updateVolumeSlider();
        previousVolume = volumeSlider.value;
        isMuted = false;
        updateVolumeIcon();
    }

    function updateVolumeSlider() {
        const percent = volumeSlider.value + '%';
        volumeSlider.style.setProperty('--volume-value', percent);
    }

    function updateVolumeIcon() {
        const volume = volumeSlider.value;
        if (isMuted || volume == 0) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-xmark"></i>';
        } else if (volume < 50) {
            volumeBtn.innerHTML = '<i class="fas fa-volume-low"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="fas fa-volume-high"></i>';
        }
    }

    function toggleMute() {
        if (!isMuted) {
            previousVolume = volumeSlider.value;
            volumeSlider.value = 0;
            isMuted = true;
        } else {
            volumeSlider.value = previousVolume;
            isMuted = false;
        }
        updateVolume();
    }


    function seekVideo() {
        const percent = progressBar.value;
        videoPlayer.currentTime = (percent / 100) * videoPlayer.duration;
    }

    function updateProgress() {
        if (videoPlayer.duration) {
            const percent = (videoPlayer.currentTime / videoPlayer.duration) * 100;
            progressBar.value = percent;
            progressBar.style.setProperty('--progress-value', percent + '%');
            updateTimeDisplay();
        }
    }

    function updateTotalTime() {
        totalTimeDisplay.textContent = formatTime(videoPlayer.duration);
        hideEmptyState();
    }

    function updateTimeDisplay() {
        currentTimeDisplay.textContent = formatTime(videoPlayer.currentTime);
    }

    function formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    function handleFileSelect(e) {
        const files = Array.from(e.target.files);
        files.forEach(file => addToPlaylist(file));
        fileInput.value = '';
    }

    function handleDragOver(e) {
        e.preventDefault();
        playerWrapper.style.background = 'rgba(59, 130, 246, 0.08)';
    }

    function handleDragLeave() {
        playerWrapper.style.background = '';
    }

    function handleDrop(e) {
        e.preventDefault();
        playerWrapper.style.background = '';
        const files = Array.from(e.dataTransfer.files);
        files.forEach(file => addToPlaylist(file));
    }

    function addToPlaylist(file) {
        if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) return;

        const url = URL.createObjectURL(file);
        playlist.push({
            name: file.name,
            url: url,
            type: file.type,
        });

        savePlaylistToStorage();
        updatePlaylistUI();

        if (playlist.length === 1) {
            loadPlaylistItem(0);
        }
    }

    function loadPlaylistItem(index) {
        if (index < 0 || index >= playlist.length) return;
        currentIndex = index;
        const item = playlist[index];
        videoPlayer.src = item.url;
        fileName.textContent = item.name;
        updatePlaylistUI();
        videoPlayer.play().catch(() => { });
    }

    function updatePlaylistUI() {
        const playlistItems = document.getElementById('playlist-items');
        if (playlist.length === 0) {
            playlistItems.innerHTML = '<div class="empty-playlist"><p>Queue is empty</p></div>';
            return;
        }

        playlistItems.innerHTML = playlist.map((item, index) => `
            <div class="playlist-item ${index === currentIndex ? 'active' : ''}" data-index="${index}">
                ${item.name}
            </div>
        `).join('');

        playlistItems.querySelectorAll('.playlist-item').forEach((el, index) => {
            el.addEventListener('click', () => loadPlaylistItem(index));
        });
    }

    function togglePlaylist() {
        playlistSidebar.classList.toggle('active');
    }

    function savePlaylistToStorage() {
        const playlistData = playlist.map(item => ({
            name: item.name,
            type: item.type,
        }));
        try {
            localStorage.setItem('pulsePlaylist', JSON.stringify(playlistData));
        } catch (e) {
            console.warn('Could not save playlist:', e);
        }
    }

    function loadPlaylistFromStorage() {
        try {
            const saved = localStorage.getItem('pulsePlaylist');
            if (saved && saved !== '[]') {

            }
        } catch (e) {
            console.warn('Could not load playlist:', e);
        }
    }


    function updatePlayButtonState() {
        const icon = isPlaying ? 'fas fa-pause' : 'fas fa-play';
        playBtn.innerHTML = `<i class="${icon}"></i>`;
        centerPlayBtn.innerHTML = `<i class="${icon}"></i>`;
    }

    function showEmptyState() {
        emptyState.classList.add('active');
    }

    function hideEmptyState() {
        emptyState.classList.remove('active');
    }


    function openSettings() {
        settingsModal.classList.add('active');
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
    }

    function openInfo() {
        updateMediaInfo();
        infoModal.classList.add('active');
    }

    function closeInfo() {
        infoModal.classList.remove('active');
    }

    function updateMediaInfo() {
        const content = document.getElementById('media-info-content');
        if (!videoPlayer.src) {
            content.innerHTML = '<p>No media loaded</p>';
            return;
        }

        const info = `
            <div class="info-grid">
                <div class="info-item">
                    <label>File Name</label>
                    <span>${fileName.textContent}</span>
                </div>
                <div class="info-item">
                    <label>Duration</label>
                    <span>${formatTime(videoPlayer.duration)}</span>
                </div>
                <div class="info-item">
                    <label>Current Time</label>
                    <span>${formatTime(videoPlayer.currentTime)}</span>
                </div>
                <div class="info-item">
                    <label>Playback Speed</label>
                    <span>${speedBtn.textContent}</span>
                </div>
                <div class="info-item">
                    <label>Volume</label>
                    <span>${volumeSlider.value}%</span>
                </div>
                <div class="info-item">
                    <label>Status</label>
                    <span>${isPlaying ? 'Playing' : 'Paused'}</span>
                </div>
            </div>
        `;
        content.innerHTML = info;
    }


    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            playerWrapper.requestFullscreen().catch(err => {
                console.log('Fullscreen error:', err);
            });
        } else {
            document.exitFullscreen();
        }
    }


    function handleKeyboard(e) {
        if (document.activeElement.tagName === 'INPUT') return;
        const keyboardEnabled = window.settingsManager.getSetting('keyboardShortcuts');
        if (!keyboardEnabled) return;

        switch (e.key.toLowerCase()) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
            case 'arrowleft':
                videoPlayer.currentTime = Math.max(0, videoPlayer.currentTime - 5);
                break;
            case 'arrowright':
                videoPlayer.currentTime = Math.min(videoPlayer.duration, videoPlayer.currentTime + 5);
                break;
            case 'arrowup':
                e.preventDefault();
                volumeSlider.value = Math.min(100, parseInt(volumeSlider.value) + 10);
                updateVolume();
                break;
            case 'arrowdown':
                e.preventDefault();
                volumeSlider.value = Math.max(0, parseInt(volumeSlider.value) - 10);
                updateVolume();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'm':
                toggleMute();
                break;
            case 'l':
                toggleLoop();
                break;
            case 'p':
                togglePlaylist();
                break;
            case '>':
                changeSpeed();
                break;
            case '<':
                currentSpeedIndex = (currentSpeedIndex - 1 + playbackSpeeds.length) % playbackSpeeds.length;
                const speed = playbackSpeeds[currentSpeedIndex];
                videoPlayer.playbackRate = speed;
                speedBtn.textContent = speed + 'x';
                break;
        }
    }

    function handleMouseWheel(e) {
        const wheelAction = window.settingsManager.getSetting('mouseWheelAction');
        if (wheelAction === 'disabled' || !videoPlayer.src) return;

        if (wheelAction === 'volume') {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            volumeSlider.value = Math.max(0, Math.min(100, parseInt(volumeSlider.value) + delta));
            updateVolume();
        } else if (wheelAction === 'seek') {
            e.preventDefault();
            const delta = e.deltaY > 0 ? -5 : 5;
            videoPlayer.currentTime = Math.max(0, Math.min(videoPlayer.duration, videoPlayer.currentTime + delta));
        }
    }

    function handleDoublClick() {
        const action = window.settingsManager.getSetting('doubleClickAction');
        if (action === 'fullscreen') {
            toggleFullscreen();
        } else if (action === 'play-pause') {
            togglePlayPause();
        } else if (action === 'mute') {
            toggleMute();
        }
    }


    function applySettings() {
        const theme = window.settingsManager.getSetting('theme');
        if (theme === 'light') {
            document.body.classList.add('light-theme');
        } else if (theme === 'system') {
            document.body.classList.add('system-theme');
        }

        const accentColor = window.settingsManager.getSetting('accentColor');
        if (accentColor) {
            document.documentElement.style.setProperty('--accent', accentColor);
            document.documentElement.style.setProperty('--accent-hover', adjustBrightness(accentColor, -10));
            document.documentElement.style.setProperty('--accent-light', adjustBrightness(accentColor, 20));
        }
    }

    function adjustBrightness(hex, percent) {
        const num = parseInt(hex.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, Math.min(255, (num >> 16) + amt));
        const G = Math.max(0, Math.min(255, (num >> 8 & 0x00FF) + amt));
        const B = Math.max(0, Math.min(255, (num & 0x0000FF) + amt));
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    async function loadVersion() {
        try {
            const version = await window.electronAPI.getVersion();
            const versionElement = document.getElementById('app-version');
            if (versionElement) {
                versionElement.textContent = version;
            }
        } catch (error) {
            console.error('Failed to load version:', error);
            const versionElement = document.getElementById('app-version');
            if (versionElement) {
                versionElement.textContent = 'unknown';
            }
        }
    }
}