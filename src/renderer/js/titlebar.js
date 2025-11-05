document.addEventListener('DOMContentLoaded', () => {
    const minimizeBtn = document.getElementById('minimize-btn');
    const maximizeBtn = document.getElementById('maximize-btn');
    const closeBtn = document.getElementById('close-btn');

    minimizeBtn.addEventListener('click', () => {
        window.electronAPI.minimizeWindow();
    });

    maximizeBtn.addEventListener('click', () => {
        window.electronAPI.maximizeWindow();
    });

    closeBtn.addEventListener('click', () => {
        window.electronAPI.closeWindow();
    });

    document.querySelector('.app-title').addEventListener('dblclick', () => {
        window.electronAPI.maximizeWindow();
    });
});