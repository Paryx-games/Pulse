# Pulse

A lightweight, feature-rich desktop media player built with Electron and FFmpeg.

## Features

- **Universal Format Support** - Play any video or audio format through FFmpeg integration
- **Modern UI** - Frameless design with custom titlebar controls
- **Playlist Management** - Queue and organize multiple files for playback
- **Playback Controls** - Variable speed (0.25x - 2.0x), loop modes, and shuffle
- **Fullscreen Mode** - Immersive playback with automatic control hiding
- **Keyboard Shortcuts** - Comprehensive keyboard support for power users
- **Theming** - Dark, Light, or System theme options
- **Media Information** - View detailed metadata about current files
- **Secure** - Context isolation and content security policies enabled

## Installation

### From .msi or .exe
Download pre-built installers from the releases page: [Releases](https://github.com/Paryx-games/Pulse/releases)

### From Source

**Prerequisites**
- Node.js v14 or higher
- npm

**Setup**
```bash
git clone https://github.com/Paryx-games/Pulse.git
cd Pulse
npm install
```

**Development Mode**
```bash
npm run dev
```

## Usage

### Opening Media Files

- Click "Open File" button
- Drag and drop files onto the player
- Use keyboard shortcuts to browse

### Keyboard Shortcuts

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| **Space** | Play/Pause | **F** | Fullscreen |
| **M** | Mute/Unmute | **<** / **>** | Speed control |
| **↑** / **↓** | Volume | **←** / **→** | Seek |
| **P** | Previous track | **N** | Next track |
| **L** | Cycle loop modes | **S** | Shuffle |
| **Q** | Queue panel | | |

### Settings

Customize your experience:
- **Appearance** - Themes, accent colors, UI density, opacity, blur effects
- **Playback** - Default volume, smooth seeking, auto-play
- **Behavior** - Double-click actions, mouse wheel, tooltips
- **Advanced** - Keyboard shortcuts customization

## License

GPL-3.0 - See [LICENSE](LICENSE) for details

## Contributing

Contributions welcome! Please submit pull requests or open issues for bugs and feature requests.