<template>
  <div class="app">
    <div class="video-container">
      <video 
        ref="videoPlayer" 
        class="video-player"
        @play="isPlaying = true"
        @pause="isPlaying = false"
        @timeupdate="updateTime"
        @loadedmetadata="onMetadataLoaded"
        @ended="onVideoEnded"
      ></video>

      <div class="empty-state" v-if="!currentFile">
        <div class="empty-content">
          <i class="fas fa-film"></i>
          <h2>No Media Loaded</h2>
          <p>Drop a file here or open one to start</p>
          <button class="btn btn-primary" @click="openFile">
            <i class="fas fa-folder-open"></i> Open File
          </button>
        </div>
      </div>

      <button 
        v-if="currentFile"
        class="center-play-btn" 
        @click="togglePlay"
        :class="{ hidden: !showCenterPlay }"
        @mouseenter="showCenterPlay = true"
        @mouseleave="showCenterPlay = !isPlaying"
      >
        <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
      </button>

      <div class="controls-overlay" @mousemove="resetHideTimer">
        <div class="visualizer-container">
          <canvas ref="visualizer" class="visualizer"></canvas>
        </div>

        <div class="bottom-controls">
          <div class="progress-bar-container">
            <input 
              type="range" 
              class="progress-bar"
              :value="currentTime"
              :max="duration"
              @input="seek"
            >
            <div class="time-display">
              <span class="current-time">{{ formatTime(currentTime) }}</span>
              <span class="total-time">{{ formatTime(duration) }}</span>
            </div>
          </div>

          <div class="controls-row">
            <div class="left-controls">
              <button class="control-btn" @click="previousTrack" title="Previous">
                <i class="fas fa-step-backward"></i>
              </button>
              <button class="control-btn play-btn" @click="togglePlay" title="Play/Pause">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </button>
              <button class="control-btn" @click="nextTrack" title="Next">
                <i class="fas fa-step-forward"></i>
              </button>
              <button class="control-btn" @click="stopPlayback" title="Stop">
                <i class="fas fa-stop"></i>
              </button>
            </div>

            <div class="center-controls">
              <div class="playback-mode">
                <button 
                  class="control-btn" 
                  @click="toggleLoop"
                  :class="{ active: loopMode !== 'off' }"
                  :title="`Loop: ${loopMode}`"
                >
                  <i :class="loopMode === 'one' ? 'fas fa-redo' : 'fas fa-redo'"></i>
                  <span v-if="loopMode === 'one'" class="badge">1</span>
                </button>
                <button 
                  class="control-btn" 
                  @click="toggleShuffle"
                  :class="{ active: isShuffle }"
                  title="Shuffle"
                >
                  <i class="fas fa-random"></i>
                </button>
              </div>

              <div class="playback-speed">
                <button class="control-btn" @click="showSpeedMenu = !showSpeedMenu" title="Speed">
                  {{ speed }}x
                </button>
                <div class="speed-menu" v-if="showSpeedMenu">
                  <button 
                    v-for="spd in [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]"
                    :key="spd"
                    @click="setSpeed(spd)"
                    :class="{ active: speed === spd }"
                  >
                    {{ spd }}x
                  </button>
                </div>
              </div>
            </div>

            <div class="right-controls">
              <div class="volume-control">
                <button class="control-btn" @click="toggleMute" title="Volume">
                  <i :class="isMuted ? 'fas fa-volume-mute' : volume > 50 ? 'fas fa-volume-high' : 'fas fa-volume-low'"></i>
                </button>
                <input 
                  type="range" 
                  class="volume-slider"
                  :value="volume"
                  @input="setVolume"
                  min="0"
                  max="100"
                >
                <span class="volume-value">{{ volume }}%</span>
              </div>

              <button class="control-btn" @click="toggleFullscreen" title="Fullscreen">
                <i :class="isFullscreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
              </button>

              <button class="control-btn" @click="openFile" title="Open File">
                <i class="fas fa-folder-open"></i>
              </button>

              <button class="control-btn menu-btn" @click="showMenu = !showMenu" title="Menu">
                <i class="fas fa-ellipsis-h"></i>
              </button>

              <div class="menu-dropdown" v-if="showMenu">
                <button class="menu-item" @click="togglePiP">
                  <i class="fas fa-clone"></i> Picture-in-Picture
                </button>
                <button class="menu-item" @click="togglePlaylist">
                  <i class="fas fa-list"></i> Toggle Playlist
                </button>
                <div class="menu-sep"></div>
                <button class="menu-item" @click="showSettings = true">
                  <i class="fas fa-cog"></i> Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      currentFile: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 70,
      isMuted: false,
      speed: 1,
      loopMode: 'off',
      isShuffle: false,
      isFullscreen: false,
      showCenterPlay: true,
      showSpeedMenu: false,
      showMenu: false,
      showSettings: false,
      hideControlsTimer: null
    }
  },
  computed: {
    videoPlayer() {
      return this.$refs.videoPlayer
    }
  },
  methods: {
    togglePlay() {
      if (!this.videoPlayer) return
      if (this.isPlaying) {
        this.videoPlayer.pause()
      } else {
        this.videoPlayer.play()
      }
    },
    stopPlayback() {
      if (!this.videoPlayer) return
      this.videoPlayer.pause()
      this.videoPlayer.currentTime = 0
      this.isPlaying = false
    },
    previousTrack() {
      if (!this.videoPlayer) return
      this.videoPlayer.currentTime = Math.max(0, this.videoPlayer.currentTime - 5)
    },
    nextTrack() {
      if (!this.videoPlayer) return
      this.videoPlayer.currentTime = Math.min(this.videoPlayer.duration, this.videoPlayer.currentTime + 5)
    },
    seek(event) {
      if (!this.videoPlayer) return
      this.videoPlayer.currentTime = event.target.value
    },
    updateTime() {
      if (!this.videoPlayer) return
      this.currentTime = this.videoPlayer.currentTime
    },
    onMetadataLoaded() {
      if (!this.videoPlayer) return
      this.duration = this.videoPlayer.duration
    },
    onVideoEnded() {
      if (this.loopMode === 'one') {
        this.videoPlayer.currentTime = 0
        this.videoPlayer.play()
      } else if (this.loopMode === 'all') {
        this.nextTrack()
      }
    },
    setVolume(event) {
      if (!this.videoPlayer) return
      this.volume = event.target.value
      this.videoPlayer.volume = this.volume / 100
      this.isMuted = this.volume === '0'
    },
    toggleMute() {
      if (!this.videoPlayer) return
      if (this.isMuted) {
        this.volume = this.videoPlayer.volume > 0 ? Math.round(this.videoPlayer.volume * 100) : 70
        this.videoPlayer.volume = this.volume / 100
        this.isMuted = false
      } else {
        this.videoPlayer.volume = 0
        this.isMuted = true
      }
    },
    setSpeed(spd) {
      if (!this.videoPlayer) return
      this.speed = spd
      this.videoPlayer.playbackRate = spd
      this.showSpeedMenu = false
    },
    toggleLoop() {
      const modes = ['off', 'all', 'one']
      const currentIndex = modes.indexOf(this.loopMode)
      this.loopMode = modes[(currentIndex + 1) % modes.length]
    },
    toggleShuffle() {
      this.isShuffle = !this.isShuffle
    },
    toggleFullscreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen()
        this.isFullscreen = true
      } else {
        document.exitFullscreen()
        this.isFullscreen = false
      }
    },
    togglePiP() {
      if (this.videoPlayer && this.videoPlayer.requestPictureInPicture) {
        this.videoPlayer.requestPictureInPicture()
      }
    },
    togglePlaylist() {
      // Playlist functionality
    },
    async openFile() {
      if (window.electronAPI?.openFile) {
        try {
          const path = await window.electronAPI.openFile()
          if (path) {
            this.loadFile(path)
          }
        } catch (err) {
          console.error('Error opening file:', err)
        }
      }
    },
    loadFile(path) {
      if (!this.videoPlayer) return
      this.videoPlayer.src = `file://${path}`
      this.currentFile = path
      this.videoPlayer.play()
    },
    formatTime(seconds) {
      if (!seconds || isNaN(seconds)) return '0:00'
      const hrs = Math.floor(seconds / 3600)
      const mins = Math.floor((seconds % 3600) / 60)
      const secs = Math.floor(seconds % 60)
      
      if (hrs > 0) {
        return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      }
      return `${mins}:${secs.toString().padStart(2, '0')}`
    },
    resetHideTimer() {
      if (this.hideControlsTimer) {
        clearTimeout(this.hideControlsTimer)
      }
      this.hideControlsTimer = setTimeout(() => {
        if (this.isPlaying) {
          this.showCenterPlay = false
        }
      }, 3000)
    }
  },
  mounted() {
    if (this.videoPlayer) {
      this.videoPlayer.volume = this.volume / 100
    }

    document.addEventListener('fullscreenchange', () => {
      this.isFullscreen = !!document.fullscreenElement
    })

    document.addEventListener('dragover', (e) => {
      e.preventDefault()
    })

    document.addEventListener('drop', (e) => {
      e.preventDefault()
      const files = e.dataTransfer?.files
      if (files && files[0]) {
        this.loadFile(files[0].path)
      }
    })
  }
}
</script>

<style scoped>
.app {
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(10px);
}

.video-container {
  flex: 1;
  position: relative;
  background: #000;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.video-player {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.empty-state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
}

.empty-content {
  text-align: center;
  color: #888;
}

.empty-content i {
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-content h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.empty-content p {
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.2);
}

.center-play-btn {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
  font-size: 2.8rem;
  cursor: pointer;
  transition: all 0.3s;
  z-index: 10;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.center-play-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.5);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.3);
}

.center-play-btn.hidden {
  opacity: 0;
  pointer-events: none;
}

.controls-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 0.75rem 1rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.5), transparent);
  backdrop-filter: blur(15px);
  z-index: 20;
  transition: opacity 0.3s;
}

.visualizer-container {
  margin-bottom: 1rem;
  height: 30px;
  position: relative;
  opacity: 0.6;
}

.visualizer {
  width: 100%;
  height: 100%;
  border-radius: 0.25rem;
}

.progress-bar-container {
  margin-bottom: 0.75rem;
}

.progress-bar {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.1);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.progress-bar::-webkit-slider-runnable-track {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
  height: 6px;
  border-radius: 3px;
}

.progress-bar::-moz-range-track {
  background: linear-gradient(to right, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3));
  height: 6px;
  border-radius: 3px;
}

.progress-bar::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  cursor: pointer;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
  transition: all 0.2s;
}

.progress-bar::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 0 0 12px rgba(59, 130, 246, 1);
}

.progress-bar::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  cursor: pointer;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.8);
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #aaa;
  margin-top: 0.25rem;
}

.controls-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
}

.left-controls,
.right-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.center-controls {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.playback-mode,
.playback-speed {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.control-btn {
  width: 36px;
  height: 36px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.95rem;
  transition: all 0.25s;
  position: relative;
}

.control-btn:hover {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.control-btn.active {
  background: rgba(255, 255, 255, 0.3);
}

.play-btn {
  width: 48px;
  height: 48px;
  font-size: 1.2rem;
  background: rgba(255, 255, 255, 0.2);
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.play-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.badge {
  position: absolute;
  top: 2px;
  right: 2px;
  width: 16px;
  height: 16px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.speed-menu {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  backdrop-filter: blur(10px);
  min-width: 120px;
  z-index: 30;
}

.speed-menu button {
  width: 100%;
  padding: 0.5rem 1rem;
  border: none;
  background: transparent;
  color: white;
  cursor: pointer;
  text-align: center;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.speed-menu button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.speed-menu button.active {
  background: rgba(255, 255, 255, 0.2);
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.volume-slider {
  width: 100px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.2);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  outline: none;
}

.volume-slider::-webkit-slider-thumb {
  appearance: none;
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  cursor: pointer;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  border: none;
  cursor: pointer;
}

.volume-value {
  font-size: 0.75rem;
  color: #aaa;
  min-width: 30px;
}

.menu-dropdown {
  position: absolute;
  bottom: 100%;
  right: 0;
  background: rgba(20, 20, 20, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
  backdrop-filter: blur(10px);
  min-width: 200px;
  z-index: 30;
}

.menu-item {
  width: 100%;
  padding: 0.75rem 1rem;
  border: none;
  background: transparent;
  color: white;
  text-align: left;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.menu-sep {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 0.25rem 0;
}

@media (max-width: 768px) {
  .center-controls {
    gap: 0.5rem;
  }

  .control-btn {
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
  }

  .play-btn {
    width: 44px;
    height: 44px;
  }

  .volume-slider {
    width: 60px;
  }

  .volume-value {
    display: none;
  }
}
</style>
