# Pulse

A lightweight, feature-rich desktop media player built with Electron and FFmpeg. Pulse delivers powerful video and audio playback with unprecedented customization options.

## Features

### Unique to Pulse

- **Accent Color Customization** - Customize the entire UI with any color you choose. Control accent colors independently from system themes.
- **Control Opacity Control** - Adjust the transparency of playback controls from 0-100% for perfect visibility without compromise.
- **UI Density Settings** - Switch between Compact, Comfortable, and Spacious layouts on-the-fly without restarting the application.
- **Backdrop Blur Effects** - Adjust blur intensity (0-100%) on modal backgrounds, creating a modern glassmorphism aesthetic.
- **Smart Tooltip Positioning** - Tooltips automatically position themselves above or below buttons based on available screen space, or stay fixed to your preference.
- **Configurable Mouse Wheel Behavior** - Choose whether mouse wheel controls volume, seeks through video, or is disabled entirely.
- **Custom Double-Click Actions** - Assign double-click to toggle fullscreen, play/pause, or mute.
- **Smooth Seeking** - Progressive frame-accurate seeking with smooth playback transitions.
- **Remember Playback Position** - Automatically resume videos from where you left off.
- **No Server Required** - Built-in FFmpeg processing with WebAssembly means all conversion and playback happens locally.

### Core Features

- **Universal Format Support** - Play any video or audio format through FFmpeg integration
- **Frameless Modern UI** - Custom titlebar with minimize, maximize, and close controls
- **Queue/Playlist Management** - Organize and queue multiple files for playback
- **Playback Controls** - Play, pause, stop, previous, next with variable speed (0.25x - 2.0x)
- **Volume Control** - Dedicated volume slider with mute functionality
- **Loop Modes** - No Loop, Loop All, or Loop Single with keyboard shortcuts
- **Fullscreen Mode** - Immersive fullscreen playback with automatic control hiding
- **Keyboard Shortcuts** - Comprehensive keyboard support for power users
- **Shuffle Mode** - Randomize playback order for playlists
- **Auto-play Next Item** - Seamlessly continue playing the next file in your queue
- **Theme Support** - Dark, Light, or System theme options
- **Sandboxed & Secure** - Context isolation and content security policies enabled
- **Media Information Panel** - View detailed metadata about the current media file

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm

### Steps

```bash
# Clone or download the repository
cd Pulse

# Install dependencies
npm install

# Start the application
npm start
```

### Development Mode

```bash
npm run dev
```

This launches the application with DevTools open for debugging.

## Usage

### Opening Media Files

1. Click the "Open File" button in the playback controls
2. Drag and drop files directly onto the player window
3. Use keyboard shortcut to browse files

### Keyboard Shortcuts

- **Space** - Play/Pause
- **F** - Fullscreen
- **M** - Mute/Unmute
- **<** / **>** - Decrease/Increase speed
- **Arrow Up/Down** - Volume control
- **Arrow Left/Right** - Seek backward/forward
- **P** - Previous track
- **N** - Next track
- **L** - Cycle loop modes
- **S** - Shuffle toggle
- **Q** - Queue panel

### Customization

Access Settings to customize:

- **Appearance** - Theme, accent color, UI density, control opacity, blur effects
- **Playback** - Default volume, smooth seeking, auto-play behavior
- **Behavior** - Double-click actions, mouse wheel behavior, tooltip positioning
- **Advanced** - Keyboard shortcuts, shuffle, loop playlist modes

## Project Structure

```
Pulse/
├── src/
│   ├── main/
│   │   └── main.js              # Electron main process
│   └── renderer/
│       ├── index.html           # UI markup
│       ├── styles/
│       │   └── main.css         # Styling
│       └── js/
│           ├── renderer.js      # Main renderer logic
│           ├── ffmpegWorker.js  # FFmpeg processing
│           ├── settings.js      # Settings management
│           ├── titlebar.js      # Custom titlebar
│           └── contextMenu.js   # Right-click menu
├── assets/
│   └── icon/                    # Application icons
├── package.json
├── README.md
└── LICENSE
```

## Technical Details

- **Framework** - Electron 39.0.0
- **FFmpeg** - @ffmpeg/ffmpeg 0.12.15 (WASM)
- **UI Framework** - Vanilla HTML/CSS/JavaScript
- **Icons** - Font Awesome 6.4.0
- **Security** - Context isolation, sandbox mode, content security policies enabled

## Performance

Pulse is optimized for lightweight performance:

- **No Bloat** - Minimal dependencies, focuses on core functionality
- **Fast Startup** - Quick initialization with lazy-loaded resources
- **Efficient Processing** - FFmpeg WebAssembly handles all media processing
- **Memory Efficient** - Manages memory carefully during playback

## License

GPL-3.0 - See LICENSE file for details

## Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## Support

For issues, feature requests, or questions, please open an issue on the project repository.
