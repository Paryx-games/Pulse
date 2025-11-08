export function useElectron() {
  return {
    minimizeWindow: () => window.electronAPI?.minimizeWindow?.(),
    maximizeWindow: () => window.electronAPI?.maximizeWindow?.(),
    closeWindow: () => window.electronAPI?.closeWindow?.(),
    getMaximizeState: () => window.electronAPI?.getMaximizeState?.(),
    getVersion: () => window.electronAPI?.getVersion?.(),
    logMessage: (type, message, ms) => window.electronAPI?.logMessage?.(type, message, ms),
    getDirectoryContents: (dirPath) => window.electronAPI?.getDirectoryContents?.(dirPath),
    selectDirectory: () => window.electronAPI?.selectDirectory?.(),
    getFileMetadata: (filePath) => window.electronAPI?.getFileMetadata?.(filePath),
    generateThumbnail: (filePath, timestamp) => window.electronAPI?.generateThumbnail?.(filePath, timestamp),
    captureScreenshot: (filePath, timestamp) => window.electronAPI?.captureScreenshot?.(filePath, timestamp),
    startTranscoding: (inputPath, outputPath, options) => window.electronAPI?.startTranscoding?.(inputPath, outputPath, options),
    parseSubtitleFile: (filePath) => window.electronAPI?.parseSubtitleFile?.(filePath),
    getAudioTracks: (filePath) => window.electronAPI?.getAudioTracks?.(filePath),
    openFile: async () => {
      return window.electronAPI?.electronAPI?.openFile?.();
    },
    ipcRenderer: window.electronAPI
  }
}
