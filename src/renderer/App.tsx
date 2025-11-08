import React, { useState, useRef, useEffect } from 'react'
import './styles/main.css'

interface MediaFile {
  path: string
}

const App: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentFile, setCurrentFile] = useState<MediaFile | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(70)
  const [isMuted, setIsMuted] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loopMode, setLoopMode] = useState<'off' | 'all' | 'one'>('off')
  const [isShuffle, setIsShuffle] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showCenterPlay, setShowCenterPlay] = useState(true)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [hideControlsTimer, setHideControlsTimer] = useState<NodeJS.Timeout | null>(null)

  const togglePlay = (): void => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
    } else {
      videoRef.current.play()
    }
  }

  const stopPlayback = (): void => {
    if (!videoRef.current) return
    videoRef.current.pause()
    videoRef.current.currentTime = 0
    setIsPlaying(false)
  }

  const previousTrack = (): void => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5)
  }

  const nextTrack = (): void => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Math.min(videoRef.current.duration, videoRef.current.currentTime + 5)
  }

  const seek = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!videoRef.current) return
    videoRef.current.currentTime = Number(e.target.value)
  }

  const setVolumeLevel = (e: React.ChangeEvent<HTMLInputElement>): void => {
    if (!videoRef.current) return
    const vol = Number(e.target.value)
    setVolume(vol)
    videoRef.current.volume = vol / 100
    setIsMuted(vol === 0)
  }

  const toggleMute = (): void => {
    if (!videoRef.current) return
    if (isMuted) {
      const newVol = videoRef.current.volume > 0 ? Math.round(videoRef.current.volume * 100) : 70
      setVolume(newVol)
      videoRef.current.volume = newVol / 100
      setIsMuted(false)
    } else {
      videoRef.current.volume = 0
      setIsMuted(true)
    }
  }

  const setPlaybackSpeed = (spd: number): void => {
    if (!videoRef.current) return
    setSpeed(spd)
    videoRef.current.playbackRate = spd
    setShowSpeedMenu(false)
  }

  const toggleLoop = (): void => {
    const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one']
    const currentIndex = modes.indexOf(loopMode)
    setLoopMode(modes[(currentIndex + 1) % modes.length])
  }

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const togglePiP = (): void => {
    if (videoRef.current && videoRef.current.requestPictureInPicture) {
      videoRef.current.requestPictureInPicture()
    }
  }

  const openFile = async (): Promise<void> => {
    if ((window as any).electronAPI?.openFile) {
      try {
        const path = await (window as any).electronAPI.openFile()
        if (path) {
          loadFile(path)
        }
      } catch (err) {
        console.error('Error opening file:', err)
      }
    }
  }

  const loadFile = (path: string): void => {
    if (!videoRef.current) return
    videoRef.current.src = `file://${path}`
    setCurrentFile({ path })
    videoRef.current.play()
  }

  const formatTime = (seconds: number): string => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const resetHideTimer = (): void => {
    if (hideControlsTimer) {
      clearTimeout(hideControlsTimer)
    }
    const timer = setTimeout(() => {
      if (isPlaying) {
        setShowCenterPlay(false)
      }
    }, 3000)
    setHideControlsTimer(timer)
  }

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100
    }

    document.addEventListener('fullscreenchange', () => {
      setIsFullscreen(!!document.fullscreenElement)
    })

    document.addEventListener('dragover', (e) => {
      e.preventDefault()
    })

    document.addEventListener('drop', (e) => {
      e.preventDefault()
      const files = (e.dataTransfer as DataTransfer)?.files
      if (files && files[0]) {
        loadFile((files[0] as any).path)
      }
    })

    return () => {
      if (hideControlsTimer) {
        clearTimeout(hideControlsTimer)
      }
    }
  }, [hideControlsTimer, isPlaying, volume])

  return (
    <div className="app">
      <div className="video-container">
        <video
          ref={videoRef}
          className="video-player"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime || 0)}
          onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
          onEnded={() => {
            if (loopMode === 'one') {
              if (videoRef.current) {
                videoRef.current.currentTime = 0
                videoRef.current.play()
              }
            } else if (loopMode === 'all') {
              nextTrack()
            }
          }}
        />

        {!currentFile && (
          <div className="empty-state">
            <div className="empty-content">
              <i className="fas fa-film" />
              <h2>No Media Loaded</h2>
              <p>Drop a file here or open one to start</p>
              <button className="btn btn-primary" onClick={openFile}>
                <i className="fas fa-folder-open" /> Open File
              </button>
            </div>
          </div>
        )}

        {currentFile && (
          <button
            className={`center-play-btn ${!showCenterPlay ? 'hidden' : ''}`}
            onClick={togglePlay}
            onMouseEnter={() => setShowCenterPlay(true)}
            onMouseLeave={() => setShowCenterPlay(!isPlaying)}
          >
            <i className={isPlaying ? 'fas fa-pause' : 'fas fa-play'} />
          </button>
        )}

        <div className="controls-overlay" onMouseMove={resetHideTimer}>
          <div className="visualizer-container">
            <canvas className="visualizer" />
          </div>

          <div className="bottom-controls">
            <div className="progress-bar-container">
              <input
                type="range"
                className="progress-bar"
                value={currentTime}
                max={duration}
                onChange={seek}
              />
              <div className="time-display">
                <span className="current-time">{formatTime(currentTime)}</span>
                <span className="total-time">{formatTime(duration)}</span>
              </div>
            </div>

            <div className="controls-row">
              <div className="left-controls">
                <button className="control-btn" onClick={previousTrack} title="Previous">
                  <i className="fas fa-step-backward" />
                </button>
                <button className="control-btn play-btn" onClick={togglePlay} title="Play/Pause">
                  <i className={isPlaying ? 'fas fa-pause' : 'fas fa-play'} />
                </button>
                <button className="control-btn" onClick={nextTrack} title="Next">
                  <i className="fas fa-step-forward" />
                </button>
                <button className="control-btn" onClick={stopPlayback} title="Stop">
                  <i className="fas fa-stop" />
                </button>
              </div>

              <div className="center-controls">
                <div className="playback-mode">
                  <button
                    className={`control-btn ${loopMode !== 'off' ? 'active' : ''}`}
                    onClick={toggleLoop}
                    title={`Loop: ${loopMode}`}
                  >
                    <i className={loopMode === 'one' ? 'fas fa-redo' : 'fas fa-redo'} />
                    {loopMode === 'one' && <span className="badge">1</span>}
                  </button>
                  <button
                    className={`control-btn ${isShuffle ? 'active' : ''}`}
                    onClick={() => setIsShuffle(!isShuffle)}
                    title="Shuffle"
                  >
                    <i className="fas fa-random" />
                  </button>
                </div>

                <div className="playback-speed">
                  <button
                    className="control-btn"
                    onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                    title="Speed"
                  >
                    {speed}x
                  </button>
                  {showSpeedMenu && (
                    <div className="speed-menu">
                      {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((spd) => (
                        <button
                          key={spd}
                          onClick={() => setPlaybackSpeed(spd)}
                          className={speed === spd ? 'active' : ''}
                        >
                          {spd}x
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="right-controls">
                <div className="volume-control">
                  <button className="control-btn" onClick={toggleMute} title="Volume">
                    <i
                      className={
                        isMuted
                          ? 'fas fa-volume-mute'
                          : volume > 50
                            ? 'fas fa-volume-high'
                            : 'fas fa-volume-low'
                      }
                    />
                  </button>
                  <input
                    type="range"
                    className="volume-slider"
                    value={volume}
                    onChange={setVolumeLevel}
                    min="0"
                    max="100"
                  />
                  <span className="volume-value">{volume}%</span>
                </div>

                <button className="control-btn" onClick={toggleFullscreen} title="Fullscreen">
                  <i className={isFullscreen ? 'fas fa-compress' : 'fas fa-expand'} />
                </button>

                <button className="control-btn" onClick={openFile} title="Open File">
                  <i className="fas fa-folder-open" />
                </button>

                <button className="control-btn menu-btn" onClick={() => setShowMenu(!showMenu)} title="Menu">
                  <i className="fas fa-ellipsis-h" />
                </button>

                {showMenu && (
                  <div className="menu-dropdown">
                    <button className="menu-item" onClick={togglePiP}>
                      <i className="fas fa-clone" /> Picture-in-Picture
                    </button>
                    <div className="menu-sep" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
