function sanitizeNumber(val) {
    const n = parseInt(val, 10);
    if (isNaN(n) || n < 0 || n > 100) return '0';
    return String(n);
}

if (!window.playerInitialized) {
    window.playerInitialized = true;


    const videoPlayer = document.getElementById('video-player');
    const playBtn = document.getElementById('play-btn');
    const stopBtn = document.getElementById('stop-btn');
    const rewindBtn = document.getElementById('rewind-btn');
    const forwardBtn = document.getElementById('forward-btn');
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
    const pipBtn = document.getElementById('pip-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const infoBtn = document.getElementById('info-btn');
    const fileInput = document.getElementById('file-input');
    const centerPlayBtn = document.getElementById('center-play-btn');
    const loopBtn = document.getElementById('loop-btn');
    const shuffleBtn = document.getElementById('shuffle-btn');
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
    let isShuffle = false;
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
        window.logger.info('Renderer process initialized');
        setupEventListeners();
        setupSidebar();
        setupDeveloperTab();
        loadPlaylistFromStorage();
        setDefaultVolume();
        updatePlayButtonState();
        showEmptyState();
        setupMouseControl();
        setupSmartTooltips();
        applySettings();
        loadVersion();
        setupVisualizer();
        checkDefaultStartPage();
        window.logger.info('Player initialization complete');
    }


    function setupEventListeners() {
        playBtn.addEventListener('click', togglePlayPause);
        centerPlayBtn.addEventListener('click', togglePlayPause);
        videoPlayer.addEventListener('dblclick', handleDoublClick);

        stopBtn.addEventListener('click', stopVideo);

        rewindBtn.addEventListener('click', skipBackward);
        forwardBtn.addEventListener('click', skipForward);

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
        pipBtn.addEventListener('click', togglePictureInPicture);

        playlistBtn.addEventListener('click', togglePlaylist);
        closePlaylistBtn.addEventListener('click', () => playlistSidebar.classList.remove('active'));
        
        document.addEventListener('click', (e) => {
            if (playlistSidebar.classList.contains('active') && 
                !playlistSidebar.contains(e.target) && 
                e.target !== playlistBtn && 
                !playlistBtn.contains(e.target)) {
                playlistSidebar.classList.remove('active');
            }
        });

        shuffleBtn.addEventListener('click', toggleShuffle);

        settingsBtn.addEventListener('click', openSettings);
        settingsCloseBtn.addEventListener('click', closeSettings);

        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
                tab.classList.add('active');
                document.querySelector(`[data-tab="${tabName}"].settings-section`)?.classList.add('active');
            });
        });

        infoBtn.addEventListener('click', openInfo);
        infoCloseBtn.addEventListener('click', closeInfo);

        loopBtn.addEventListener('click', toggleLoop);

        speedBtn.addEventListener('click', changeSpeed);

        setupMoreOptionsMenu();
        setupContextMenu();

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
            window.logger.debug('Playback paused');
        } else {
            videoPlayer.play();
            window.logger.debug('Playback started');
        }
    }

    function stopVideo() {
        videoPlayer.pause();
        videoPlayer.currentTime = 0;
        isPlaying = false;
        updatePlayButtonState();
        window.logger.debug('Playback stopped');
    }

    function playPrevious() {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
        window.logger.debug(`Playing previous item (index: ${currentIndex})`);
        loadPlaylistItem(currentIndex);
    }

    function playNext() {
        if (playlist.length === 0) return;
        currentIndex = (currentIndex + 1) % playlist.length;
        window.logger.debug(`Playing next item (index: ${currentIndex})`);
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
        window.logger.debug(`Loop mode ${isLooping ? 'enabled' : 'disabled'}`);
    }

    function changeSpeed() {
        currentSpeedIndex = (currentSpeedIndex + 1) % playbackSpeeds.length;
        const speed = playbackSpeeds[currentSpeedIndex];
        videoPlayer.playbackRate = speed;
        speedBtn.textContent = speed + 'x';
        speedBtn.setAttribute('data-speed', speed);
        window.logger.debug(`Playback speed changed to ${speed}x`);
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
        window.logger.trace(`Volume changed to ${sanitizeNumber(volumeSlider.value)}%`);
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
            window.logger.debug('Audio muted');
        } else {
            volumeSlider.value = previousVolume;
            isMuted = false;
            window.logger.debug('Audio unmuted');
        }
        updateVolume();
    }


    function seekVideo() {
        const percent = progressBar.value;
        const newTime = (percent / 100) * videoPlayer.duration;
        videoPlayer.currentTime = newTime;
        window.logger.trace(`Seeked to ${formatTime(newTime)}`);
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
        window.logger.info(`${files.length} file(s) selected`);
        files.forEach(file => addToPlaylist(file));
        fileInput.value = '';
    }

    function handleDragOver(e) {
        e.preventDefault();
        playerWrapper.style.background = 'rgba(59, 130, 246, 0.08)';
        window.logger.trace('File drag over detected');
    }

    function handleDragLeave() {
        playerWrapper.style.background = '';
    }

    function handleDrop(e) {
        e.preventDefault();
        playerWrapper.style.background = '';
        const files = Array.from(e.dataTransfer.files);
        window.logger.info(`${files.length} file(s) dropped`);
        files.forEach(file => addToPlaylist(file));
    }

    function addToPlaylist(file) {
        if (!file.type.startsWith('video/') && !file.type.startsWith('audio/')) {
            window.logger.warning(`Skipped unsupported file type: ${file.type}`);
            return;
        }

        const url = URL.createObjectURL(file);
        playlist.push({
            name: file.name,
            url: url,
            type: file.type,
        });

        window.logger.debug(`Added to playlist: ${file.name}`);
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
        window.logger.info(`Loading: ${item.name}`);
        updatePlaylistUI();
        updateControlsVisibility();
        
        if (window.bookmarkManager) {
            window.bookmarkManager.loadBookmarks(item.url);
        }
        if (window.audioTrackManager) {
            window.audioTrackManager.loadAudioTracks(item.url);
        }
        if (window.database) {
            window.database.getMetadata(item.url);
        }
        
        videoPlayer.play().catch(() => { });
    }

    function updatePlaylistUI() {
        const playlistItems = document.getElementById('playlist-items');
        playlistItems.innerHTML = '';
        
        if (playlist.length === 0) {
            const empty = document.createElement('div');
            empty.className = 'empty-playlist';
            empty.innerHTML = '<p>Queue is empty</p>';
            playlistItems.appendChild(empty);
            return;
        }

        playlist.forEach((item, index) => {
            const itemEl = document.createElement('div');
            itemEl.className = `playlist-item ${index === currentIndex ? 'active' : ''}`;
            itemEl.dataset.index = index;
            itemEl.textContent = item.name;
            itemEl.addEventListener('click', () => loadPlaylistItem(index));
            playlistItems.appendChild(itemEl);
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
            window.logger.debug(`Playlist saved to storage (${playlist.length} items)`);
        } catch (e) {
            window.logger.error(`Could not save playlist: ${e.message}`);
        }
    }

    function loadPlaylistFromStorage() {
        try {
            const saved = localStorage.getItem('pulsePlaylist');
            if (saved && saved !== '[]') {
                window.logger.debug('Playlist loaded from storage');
            }
        } catch (e) {
            window.logger.warning(`Could not load playlist: ${e.message}`);
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
        window.logger.debug('Settings modal opened');
    }

    function closeSettings() {
        settingsModal.classList.remove('active');
        window.logger.debug('Settings modal closed');
    }

    function openInfo() {
        updateMediaInfo();
        infoModal.classList.add('active');
        window.logger.debug('Media info modal opened');
    }

    function closeInfo() {
        infoModal.classList.remove('active');
        window.logger.debug('Media info modal closed');
    }

    function updateMediaInfo() {
        const content = document.getElementById('media-info-content');
        content.innerHTML = '';
        
        if (!videoPlayer.src) {
            const p = document.createElement('p');
            p.textContent = 'No media loaded';
            content.appendChild(p);
            return;
        }

        const grid = document.createElement('div');
        grid.className = 'info-grid';

        const infoData = [
            { label: 'File Name', value: fileName.textContent },
            { label: 'Duration', value: formatTime(videoPlayer.duration) },
            { label: 'Current Time', value: formatTime(videoPlayer.currentTime) },
            { label: 'Playback Speed', value: speedBtn.textContent },
            { label: 'Volume', value: `${sanitizeNumber(volumeSlider.value)}%` },
            { label: 'Status', value: isPlaying ? 'Playing' : 'Paused' }
        ];

        infoData.forEach(info => {
            const item = document.createElement('div');
            item.className = 'info-item';
            
            const label = document.createElement('label');
            label.textContent = info.label;
            
            const value = document.createElement('span');
            value.textContent = info.value;
            
            item.appendChild(label);
            item.appendChild(value);
            grid.appendChild(item);
        });

        content.appendChild(grid);

        if (window.performanceMetrics) {
            window.performanceMetrics.displayMetrics(infoModal);
        }
    }


    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            playerWrapper.requestFullscreen().catch(err => {
                window.logger.error(`Fullscreen error: ${err.message}`);
            });
            window.logger.debug('Fullscreen entered');
        } else {
            document.exitFullscreen();
            window.logger.debug('Fullscreen exited');
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

    function skipBackward() {
        if (videoPlayer.currentTime >= 10) {
            videoPlayer.currentTime -= 10;
        } else {
            videoPlayer.currentTime = 0;
        }
        window.logger.debug(`Skipped backward to ${formatTime(videoPlayer.currentTime)}`);
    }

    function skipForward() {
        videoPlayer.currentTime = Math.min(videoPlayer.currentTime + 10, videoPlayer.duration);
        window.logger.debug(`Skipped forward to ${formatTime(videoPlayer.currentTime)}`);
    }

    function togglePictureInPicture() {
        if (document.pictureInPictureElement) {
            document.exitPictureInPicture().catch(error => window.logger.error('Error exiting PiP:', error));
        } else {
            videoPlayer.requestPictureInPicture().catch(error => window.logger.error('Error entering PiP:', error));
        }
        pipBtn.classList.toggle('active');
        const isPiP = document.pictureInPictureElement !== null;
        window.logger.debug(`Picture-in-picture ${isPiP ? 'enabled' : 'disabled'}`);
    }

    function toggleShuffle() {
        isShuffle = !isShuffle;
        shuffleBtn.classList.toggle('active', isShuffle);
        window.logger.debug(`Shuffle mode ${isShuffle ? 'enabled' : 'disabled'}`);
    }

    function setupMoreOptionsMenu() {
        const moreOptionsBtn = document.getElementById('more-options-btn');
        const moreOptionsMenu = document.getElementById('more-options-menu');
        const menuSpeed = document.getElementById('menu-speed');
        const menuLoop = document.getElementById('menu-loop');
        const menuShuffle = document.getElementById('menu-shuffle');
        const menuPip = document.getElementById('menu-pip');
        const menuPlaylist = document.getElementById('menu-playlist');
        const menuOpenFile = document.getElementById('menu-open-file');

        moreOptionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moreOptionsMenu.classList.toggle('active');
            updateMoreOptionsMenuValues();
            document.getElementById('context-menu').classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!moreOptionsBtn.contains(e.target) && !moreOptionsMenu.contains(e.target)) {
                moreOptionsMenu.classList.remove('active');
            }
        });

        menuSpeed.addEventListener('click', () => {
            changeSpeed();
            updateMoreOptionsMenuValues();
        });

        menuLoop.addEventListener('click', () => {
            toggleLoop();
            updateMoreOptionsMenuValues();
        });

        menuShuffle.addEventListener('click', () => {
            toggleShuffle();
            updateMoreOptionsMenuValues();
        });

        menuPip.addEventListener('click', () => {
            togglePictureInPicture();
            moreOptionsMenu.classList.remove('active');
        });

        menuPlaylist.addEventListener('click', () => {
            togglePlaylist();
            moreOptionsMenu.classList.remove('active');
        });

        menuOpenFile.addEventListener('click', () => {
            fileInput.click();
            moreOptionsMenu.classList.remove('active');
        });
    }

    function updateMoreOptionsMenuValues() {
        const menuSpeed = document.getElementById('menu-speed');
        const menuLoop = document.getElementById('menu-loop');
        const menuShuffle = document.getElementById('menu-shuffle');

        const speedValue = playbackSpeeds[currentSpeedIndex];
        menuSpeed.querySelector('.menu-value').textContent = speedValue + 'x';

        menuLoop.querySelector('.menu-value').textContent = isLooping ? 'All' : 'Off';

        menuShuffle.querySelector('.menu-value').textContent = isShuffle ? 'On' : 'Off';
    }

    function setupContextMenu() {
        const contextMenu = document.getElementById('context-menu');
        const ctxSpeed = document.getElementById('ctx-speed');
        const ctxLoop = document.getElementById('ctx-loop');
        const ctxShuffle = document.getElementById('ctx-shuffle');
        const ctxPip = document.getElementById('ctx-pip');
        const ctxPlaylist = document.getElementById('ctx-playlist');
        const ctxOpenFile = document.getElementById('ctx-open-file');

        playerWrapper.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            contextMenu.style.left = e.clientX + 'px';
            contextMenu.style.top = e.clientY + 'px';
            contextMenu.classList.add('active');
            updateContextMenuValues();
            document.getElementById('more-options-menu').classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!contextMenu.contains(e.target) && e.target !== playerWrapper) {
                contextMenu.classList.remove('active');
            }
        });

        ctxSpeed.addEventListener('click', () => {
            changeSpeed();
            updateContextMenuValues();
        });

        ctxLoop.addEventListener('click', () => {
            toggleLoop();
            updateContextMenuValues();
        });

        ctxShuffle.addEventListener('click', () => {
            toggleShuffle();
            updateContextMenuValues();
        });

        ctxPip.addEventListener('click', () => {
            togglePictureInPicture();
            contextMenu.classList.remove('active');
        });

        ctxPlaylist.addEventListener('click', () => {
            togglePlaylist();
            contextMenu.classList.remove('active');
        });

        ctxOpenFile.addEventListener('click', () => {
            fileInput.click();
            contextMenu.classList.remove('active');
        });
    }

    function updateContextMenuValues() {
        const ctxSpeed = document.getElementById('ctx-speed');
        const ctxLoop = document.getElementById('ctx-loop');
        const ctxShuffle = document.getElementById('ctx-shuffle');

        const speedValue = playbackSpeeds[currentSpeedIndex];
        ctxSpeed.querySelector('.ctx-value').textContent = speedValue + 'x';

        ctxLoop.querySelector('.ctx-value').textContent = isLooping ? 'All' : 'Off';

        ctxShuffle.querySelector('.ctx-value').textContent = isShuffle ? 'On' : 'Off';
    }

    let audioContext = null;
    let analyser = null;
    let dataArray = null;
    let animationId = null;
    let smoothedBars = [];
    let isAudioOnly = false;

    function isMediaAudioOnly() {
        return videoPlayer.videoTracks && videoPlayer.videoTracks.length === 0;
    }

    function setupVisualizer() {
        const canvas = document.getElementById('visualizer-canvas');
        const container = document.getElementById('visualizer-container');
        
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
        const bars = 40;
        smoothedBars = new Array(bars).fill(0);

        function initAudioContext() {
            if (audioContext) return;
            
            try {
                const audioContextClass = window.AudioContext || window.webkitAudioContext;
                audioContext = new audioContextClass();
                analyser = audioContext.createAnalyser();
                analyser.fftSize = 512;
                analyser.smoothingTimeConstant = 0.7;
                
                const source = audioContext.createMediaElementAudioSource(videoPlayer);
                source.connect(analyser);
                analyser.connect(audioContext.destination);
                
                dataArray = new Uint8Array(analyser.frequencyBinCount);
            } catch (e) {
                console.warn('Audio context error:', e);
            }
        }

        function drawVisualizer() {
            if (!analyser || !dataArray || !isAudioOnly) return;

            analyser.getByteFrequencyData(dataArray);
            
            const barWidth = (canvas.width - (bars * 1.5)) / bars;
            const gap = 1.5;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < bars; i++) {
                const index = Math.floor((i / bars) * (dataArray.length * 0.8));
                const value = dataArray[index] / 255;
                const boost = 1 + Math.sin(Date.now() / 200 + i * 0.2) * 0.15;
                
                smoothedBars[i] = smoothedBars[i] * 0.7 + value * 0.3;
                const targetHeight = smoothedBars[i] * boost * canvas.height * 0.95;
                
                const barHeight = targetHeight;
                const x = i * (barWidth + gap);
                const y = canvas.height - barHeight;

                const hue = (i / bars) * 280 + 200;
                const saturation = 60 + smoothedBars[i] * 40;
                const lightness = 50 + smoothedBars[i] * 20;
                
                const gradient = ctx.createLinearGradient(0, y, 0, canvas.height);
                gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
                gradient.addColorStop(1, `hsl(${hue}, ${saturation}%, ${Math.max(30, lightness - 20)}%)`);
                
                ctx.fillStyle = gradient;
                ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
                ctx.shadowBlur = 8;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 2;
                
                ctx.fillRect(x, y, barWidth, barHeight);
                
                ctx.shadowBlur = 0;
                ctx.strokeStyle = `hsl(${hue}, ${saturation}%, ${lightness + 10}%)`;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, barWidth, barHeight);
            }

            if (isPlaying && isAudioOnly) {
                animationId = requestAnimationFrame(drawVisualizer);
            }
        }

        videoPlayer.addEventListener('play', () => {
            isAudioOnly = isMediaAudioOnly();
            
            if (isAudioOnly) {
                if (!audioContext) {
                    initAudioContext();
                }
                if (audioContext && audioContext.state === 'suspended') {
                    audioContext.resume();
                }
                container.classList.add('active');
                drawVisualizer();
            }
        });

        videoPlayer.addEventListener('loadedmetadata', () => {
            isAudioOnly = isMediaAudioOnly();
        });

        videoPlayer.addEventListener('pause', () => {
            container.classList.remove('active');
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        });

        window.addEventListener('resize', () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        });
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

    function updateControlsVisibility() {
        const hasMedia = playlist.length > 0;
        const infoBar = document.querySelector('.info-bar');
        const playbackControls = document.querySelector('.playback-controls');
        
        if (infoBar) {
            infoBar.style.display = hasMedia ? 'flex' : 'none';
        }
        if (playbackControls) {
            playbackControls.style.display = hasMedia ? 'flex' : 'none';
        }
    }

    window.goToPlayer = function(filePath) {
        const homePage = document.getElementById('home-page');
        const playerWrapper = document.querySelector('.player-wrapper');
        
        if (homePage) homePage.classList.add('hidden');
        if (playerWrapper) playerWrapper.classList.add('show');
        
        loadFile(filePath);
    };

    window.goToHome = function() {
        const homePage = document.getElementById('home-page');
        const playerWrapper = document.querySelector('.player-wrapper');
        
        if (homePage) homePage.classList.remove('hidden');
        if (playerWrapper) playerWrapper.classList.remove('show');
    };

    async function trackPlayback() {
        if (playlist.length > 0 && currentIndex < playlist.length) {
            const currentFile = playlist[currentIndex];
            try {
                await database.addToHistory(currentFile, { name: currentFile }, videoPlayer.currentTime);
            } catch (error) {
                console.error('Failed to track playback:', error);
            }
        }
    }

    const originalHandleVideoEnd = handleVideoEnd;
    handleVideoEnd = function() {
        trackPlayback();
        originalHandleVideoEnd();
    };

    function setupSidebar() {
        const hamburgerBtn = document.getElementById('hamburger-btn');
        const sidebar = document.getElementById('sidebar');
        const sidebarOverlay = document.getElementById('sidebar-overlay');
        const sidebarItems = document.querySelectorAll('.sidebar-item');

        if (!hamburgerBtn) return;

        hamburgerBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
            window.logger.debug('Sidebar opened');
        });

        sidebarOverlay.addEventListener('click', () => {
            closeSidebar();
        });

        sidebarItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                sidebarItems.forEach(i => i.classList.remove('active'));
                item.classList.add('active');

                window.logger.info(`Navigating to: ${page}`);

                if (page === 'home') {
                    window.goToHome();
                } else if (page === 'player') {
                    const homePage = document.getElementById('home-page');
                    const playerWrapper = document.querySelector('.player-wrapper');
                    if (homePage) homePage.classList.add('hidden');
                    if (playerWrapper) playerWrapper.classList.add('show');
                }

                closeSidebar();
            });
        });

        function closeSidebar() {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
            window.logger.debug('Sidebar closed');
        }
    }

    function setupDeveloperTab() {
        const logLevelSelect = document.getElementById('log-level');
        const clearLogsBtn = document.getElementById('clear-logs-btn');
        const exportLogsBtn = document.getElementById('export-logs-btn');
        const enableLoggingCheckbox = document.getElementById('enable-logging');
        const logTimestampsCheckbox = document.getElementById('log-timestamps');
        const cacheSizeInput = document.getElementById('cache-size');
        const clearCacheBtn = document.getElementById('clear-cache-btn');
        const defaultStartPageCheckbox = document.getElementById('default-start-page');

        if (logLevelSelect) {
            logLevelSelect.addEventListener('change', (e) => {
                const level = e.target.value;
                window.logger.setLogLevel(level);
                window.settingsManager.setSetting('logLevel', level);
            });
        }

        if (clearLogsBtn) {
            clearLogsBtn.addEventListener('click', () => {
                window.logger.clearLogs();
                window.logger.info('Developer cleared logs');
            });
        }

        if (exportLogsBtn) {
            exportLogsBtn.addEventListener('click', () => {
                window.logger.exportLogs();
                window.logger.info('Developer exported logs');
            });
        }

        if (enableLoggingCheckbox) {
            enableLoggingCheckbox.addEventListener('change', (e) => {
                window.logger.enableFileLogging = e.target.checked;
                window.settingsManager.setSetting('enableLogging', e.target.checked);
                window.logger.info(`File logging ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        }

        if (logTimestampsCheckbox) {
            logTimestampsCheckbox.addEventListener('change', (e) => {
                window.logger.showTimestamps = e.target.checked;
                window.settingsManager.setSetting('logTimestamps', e.target.checked);
                window.logger.info(`Log timestamps ${e.target.checked ? 'enabled' : 'disabled'}`);
            });
        }

        if (cacheSizeInput) {
            cacheSizeInput.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                const sizeValue = document.getElementById('cache-size-value');
                if (sizeValue) {
                    sizeValue.textContent = `${size} MB`;
                }
                window.settingsManager.setSetting('cacheSize', size);
                window.logger.debug(`Cache size set to ${size} MB`);
            });
        }

        if (clearCacheBtn) {
            clearCacheBtn.addEventListener('click', () => {
                window.logger.info('Cache cleared by user');
                window.settingsManager.setSetting('cacheCleared', Date.now());
            });
        }

        if (defaultStartPageCheckbox) {
            defaultStartPageCheckbox.addEventListener('change', (e) => {
                window.settingsManager.setSetting('defaultStartPage', e.target.checked ? 'player' : 'home');
                window.logger.info(`Default start page set to: ${e.target.checked ? 'player' : 'home'}`);
            });
        }

        const savedLogLevel = window.settingsManager.getSetting('logLevel') || 'INFO';
        if (logLevelSelect) {
            logLevelSelect.value = savedLogLevel;
            window.logger.setLogLevel(savedLogLevel);
        }

        const enabledLogging = window.settingsManager.getSetting('enableLogging') !== false;
        if (enableLoggingCheckbox) {
            enableLoggingCheckbox.checked = enabledLogging;
            window.logger.enableFileLogging = enabledLogging;
        }

        const showTimestamps = window.settingsManager.getSetting('logTimestamps') !== false;
        if (logTimestampsCheckbox) {
            logTimestampsCheckbox.checked = showTimestamps;
            window.logger.showTimestamps = showTimestamps;
        }
    }

    function checkDefaultStartPage() {
        const startPage = window.settingsManager.getSetting('defaultStartPage') || 'player';
        const homePage = document.getElementById('home-page');
        const playerWrapper = document.querySelector('.player-wrapper');

        if (startPage === 'home') {
            if (homePage) homePage.classList.remove('hidden');
            if (playerWrapper) playerWrapper.classList.remove('show');
            const homeItem = document.querySelector('.sidebar-item[data-page="home"]');
            const playerItem = document.querySelector('.sidebar-item[data-page="player"]');
            if (homeItem) homeItem.classList.add('active');
            if (playerItem) playerItem.classList.remove('active');
            window.logger.info('Starting with Home page');
        } else {
            if (homePage) homePage.classList.add('hidden');
            if (playerWrapper) playerWrapper.classList.add('show');
            window.logger.info('Starting with Media Player');
        }
    }

    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            const logDisplay = document.getElementById('log-display');
            if (logDisplay) {
                const modal = document.getElementById('settings-modal');
                if (modal) {
                    modal.classList.add('active');
                    const devTab = document.querySelector('[data-tab="developer"]');
                    if (devTab) {
                        devTab.click();
                    }
                }
            }
            window.logger.debug('Developer console opened');
        }
    });
}