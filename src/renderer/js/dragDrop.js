if (!window.DragDropManager) {
    class DragDropManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPlaylistDragDrop();
        this.setupFileDrop();
    }

    setupPlaylistDragDrop() {
        const playlistItems = document.getElementById('playlist-items');
        if (!playlistItems) return;

        playlistItems.addEventListener('dragstart', (e) => {
            const item = e.target.closest('.playlist-item');
            if (item) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', item.dataset.index);
                item.style.opacity = '0.5';
            }
        });

        playlistItems.addEventListener('dragend', (e) => {
            const item = e.target.closest('.playlist-item');
            if (item) {
                item.style.opacity = '1';
            }
        });

        playlistItems.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';

            const afterElement = this.getDragAfterElement(playlistItems, e.clientY);
            const draggingItem = document.querySelector('[style*="opacity: 0.5"]');

            if (afterElement == null) {
                playlistItems.appendChild(draggingItem);
            } else {
                playlistItems.insertBefore(draggingItem, afterElement);
            }
        });

        playlistItems.addEventListener('drop', (e) => {
            e.preventDefault();
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = Array.from(playlistItems.children).findIndex(child => 
                child.style.opacity === '0.5'
            );

            if (fromIndex !== toIndex) {
                this.reorderPlaylist(fromIndex, toIndex);
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.playlist-item:not([style*="opacity: 0.5"])')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;

            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    reorderPlaylist(fromIndex, toIndex) {
        const playlistContainer = document.querySelector('.player-wrapper');
        if (!playlistContainer || !window.playlist) return;

        const [item] = window.playlist.splice(fromIndex, 1);
        window.playlist.splice(toIndex, 0, item);

        if (window.currentIndex === fromIndex) {
            window.currentIndex = toIndex;
        }

        this.savePlaylistOrder();
    }

    savePlaylistOrder() {
        if (window.playlist) {
            localStorage.setItem('playlist', JSON.stringify(window.playlist));
        }
    }

    setupFileDrop() {
        const playerWrapper = document.querySelector('.player-wrapper');
        const container = document.querySelector('.container');

        const elements = [playerWrapper, container].filter(el => el);

        elements.forEach(element => {
            if (!element) return;

            element.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'copy';
                element.style.outline = '2px dashed var(--accent)';
                element.style.outlineOffset = '-4px';
            });

            element.addEventListener('dragleave', () => {
                element.style.outline = 'none';
            });

            element.addEventListener('drop', (e) => {
                e.preventDefault();
                element.style.outline = 'none';

                const files = e.dataTransfer.files;
                if (files && files.length > 0) {
                    this.handleDroppedFiles(files);
                }
            });
        });
    }

    handleDroppedFiles(files) {
        for (let file of files) {
            const ext = file.name.split('.').pop().toLowerCase();
            if (['.mp4', '.webm', '.mkv', '.avi', '.mov', '.flv', '.wmv', '.m4a', '.mp3', '.wav', '.aac', '.ogg', '.flac'].includes(`.${ext}`)) {
                if (window.goToPlayer) {
                    window.goToPlayer(file.path || file.name);
                }
            }
        }
    }
    }

    window.DragDropManager = DragDropManager;
    const dragDropManager = new DragDropManager();
    window.dragDropManager = dragDropManager;
}
