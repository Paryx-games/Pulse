# **Pulse**

A lightweight, feature-rich desktop media player built with Electron and FFmpeg.

## **Features**

- **Universal Format Support & Media Info** – Play any audio or video format through FFmpeg integration while accessing detailed metadata about your files, giving you full control and insight during playback.  
- **Lightning-Fast & Secure** – React and Vue frontend combined with a Go backend ensures minimal delay, and with context isolation plus strict content security policies, your app stays fast, stable, and safe.  
- **Advanced Playback Controls** – Manage playlists, loop and shuffle tracks, adjust playback speed from 0.25x to 2.0x, use fullscreen mode, and navigate entirely via keyboard shortcuts for maximum efficiency.  
- **Customizable UI & Themes** – Frameless design with custom titlebar controls, offering dark, light, or system themes so your player looks and feels exactly how you want.  
- **Cross-Platform Compatibility** – Seamlessly works on Windows, macOS, and Linux, ensuring the same smooth, feature-rich experience no matter your desktop environment.

## **Installation**

### **From .msi or .exe**

> [!NOTE]
> We recommend this option if you are the average user wanting to download this.

Download pre-built installers from the releases page: [Releases](https://github.com/Paryx-games/Pulse/releases)

_We recommend the .exe installer, but you can use .msi too._

### **From Source**

> [!IMPORTANT]
> Only use this if you are hoping to contribute! We do not provide support for the app if you built it from source.

### **Prerequisites**
- Node.js v14 or higher
- npm (comes with Node.js)
- Git (to clone the repo)

**Setup**
```bash
git clone https://github.com/Paryx-games/Pulse.git
cd Pulse
npm install
```

**Development Mode** (required for quick prototyping)
```bash
npm run dev
```

See more development commands under [Development Commands section](https://github.com/Paryx-games/Pulse?tab=readme-ov-file#development-commands)

## **Usage**

### **Opening Media Files**

- Click "Open File" button
- Drag and drop files onto the player
- Use keyboard shortcuts to browse

### **Keyboard Shortcuts**

| Key | Action | Key | Action |
|-----|--------|-----|--------|
| **Space** | Play/Pause | **F** | Fullscreen |
| **M** | Mute/Unmute | **<** / **>** | Speed control |
| **↑** / **↓** | Volume | **←** / **→** | Seek |
| **P** | Previous track | **N** | Next track |
| **L** | Cycle loop modes | **S** | Shuffle |
| **Q** | Queue panel | | |

### **Settings**

Customize your experience:
- **Appearance** - Themes, accent colors, UI density, opacity, blur effects
- **Playback** - Default volume, smooth seeking, auto-play
- **Behavior** - Double-click actions, mouse wheel, tooltips
- **Advanced** - Keyboard shortcuts customization

## **Development Commands**

### **Prerequisites**
- Node.js v14 or higher
- npm (comes with Node.js)
- Git (to clone the repo)
- **Optional:** Yarn if you prefer it over npm

---

### **Setup**
Clone the repository and install dependencies:
```bash
git clone https://github.com/Paryx-games/Pulse.git
cd Pulse
npm install
```

---

### **Run in Development Mode**
Use this to start the app in dev mode for fast prototyping. This will run the dev server and hot-reload your changes.

```bash
npm run dev
```

- `npm run vite` – start Vite's development server (frontend only)  
- `npm start` – start the Electron app directly  

---

### **Build Commands**
Build your app into Windows executables.

#### **Portable Development Build**
Quick build for testing and internal use:
```bash
npm run build:dev
```

- Runs `vite build` to compile frontend assets  
- Packages the app with Electron for Windows (portable `.exe`)  

#### **Full Production Build**
Complete build for distribution:
```bash
npm run build:prod
```
  
- Packages the app with Electron for Windows using NSIS and MSI installers  

---

### **Cleaning Builds**
Remove previous build artifacts to prevent conflicts:

```bash
npm run clean
```

- Deletes `dist` and `dist-electron` folders  

---

### **Linting**
Check code style and catch potential errors:
```bash
npm run lint
```

- Checks all `.ts`, `.tsx`, `.js`, `.jsx` files  

Fix issues automatically:

```bash
npm run lint:fix
```

---

### **Husky / Git Hooks**
Install Husky for git hooks:
```bash
npm run prepare
```

- Ensures pre-commit and other hooks are active for code quality

## **License**

GPL-3.0 - See [LICENSE](LICENSE) for details

## **Contributing**

Contributions welcome! Please submit pull requests or open issues for bugs and feature requests.
