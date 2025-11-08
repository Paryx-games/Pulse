if (!window.BookmarkManager) {
    class BookmarkManager {
        constructor() {
            this.videoElement = null;
            this.bookmarks = [];
            this.currentFile = null;
        this.init();
    }

    init() {
        this.videoElement = document.getElementById('video-player');
        this.setupUI();
        this.setupPlaylistListener();
    }

    setupUI() {
        const playbackControlsGroup = document.querySelector('.controls-group.secondary');
        if (playbackControlsGroup) {
            const bookmarkBtn = document.createElement('button');
            bookmarkBtn.className = 'icon-btn';
            bookmarkBtn.id = 'bookmark-btn';
            bookmarkBtn.title = 'Add bookmark at current position';
            bookmarkBtn.innerHTML = '<i class="fas fa-bookmark"></i>';
            bookmarkBtn.addEventListener('click', () => this.addBookmarkAtCurrent());
            playbackControlsGroup.appendChild(bookmarkBtn);
        }

        const settingsContent = document.querySelector('.settings-content');
        if (settingsContent) {
            const bookmarkSection = document.createElement('div');
            bookmarkSection.className = 'settings-section';
            bookmarkSection.dataset.tab = 'bookmarks';
            bookmarkSection.innerHTML = `
                <h3>Bookmarks & Chapters</h3>
                <div class="setting-item">
                    <button class="btn btn-secondary" id="add-bookmark-btn">
                        <i class="fas fa-plus"></i>
                        Add Bookmark
                    </button>
                </div>
                <div class="bookmarks-list" id="bookmarks-list">
                    <div class="empty-message">No bookmarks for this video</div>
                </div>
            `;
            settingsContent.appendChild(bookmarkSection);

            document.getElementById('add-bookmark-btn')?.addEventListener('click', () => this.showBookmarkDialog());
        }
    }

    setupPlaylistListener() {
        const infoBtn = document.getElementById('info-btn');
        if (infoBtn) {
            infoBtn.addEventListener('click', () => {
                setTimeout(() => this.renderBookmarks(), 100);
            });
        }
    }

    addBookmarkAtCurrent() {
        const timestamp = this.videoElement.currentTime;
        this.showBookmarkDialog(timestamp);
    }

    showBookmarkDialog(timestamp) {
        const label = prompt('Bookmark label:', '');
        if (label !== null && label.trim()) {
            this.addBookmark(timestamp, label.trim());
        }
    }

    async addBookmark(timestamp, label) {
        if (!this.currentFile) return;

        try {
            const id = await database.addBookmark(this.currentFile, timestamp, label);
            this.bookmarks.push({ id, timestamp, label });
            this.renderBookmarks();
        } catch (error) {
            console.error('Failed to add bookmark:', error);
        }
    }

    async loadBookmarks(filePath) {
        try {
            this.currentFile = filePath;
            this.bookmarks = await database.getBookmarks(filePath);
            this.renderBookmarks();
        } catch (error) {
            console.error('Failed to load bookmarks:', error);
        }
    }

    renderBookmarks() {
        const list = document.getElementById('bookmarks-list');
        if (!list) return;

        if (this.bookmarks.length === 0) {
            list.innerHTML = '<div class="empty-message">No bookmarks for this video</div>';
            return;
        }

        list.innerHTML = '';
        this.bookmarks.forEach(bookmark => {
            const item = document.createElement('div');
            item.className = 'bookmark-item';
            item.style.cssText = `
                padding: 10px 12px;
                background: var(--bg-secondary);
                border: 1px solid var(--border);
                border-radius: 4px;
                margin-bottom: 8px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s;
            `;

            const info = document.createElement('div');
            info.style.cssText = 'flex: 1;';
            info.innerHTML = `
                <div style="font-weight: 500; color: var(--text-primary);">${this.escapeHtml(bookmark.label)}</div>
                <div style="font-size: 12px; color: var(--text-tertiary);">${this.formatTime(bookmark.timestamp)}</div>
            `;

            const actions = document.createElement('div');
            actions.style.cssText = 'display: flex; gap: 8px;';

            const seekBtn = document.createElement('button');
            seekBtn.className = 'icon-btn';
            seekBtn.innerHTML = '<i class="fas fa-play"></i>';
            seekBtn.title = 'Seek to bookmark';
            seekBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.seekToBookmark(bookmark.timestamp);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'icon-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.title = 'Delete bookmark';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteBookmark(bookmark.id);
            });

            actions.appendChild(seekBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(info);
            item.appendChild(actions);

            item.addEventListener('mouseenter', () => {
                item.style.background = 'var(--bg-tertiary)';
                item.style.borderColor = 'var(--accent)';
            });
            item.addEventListener('mouseleave', () => {
                item.style.background = 'var(--bg-secondary)';
                item.style.borderColor = 'var(--border)';
            });

            list.appendChild(item);
        });
    }

    seekToBookmark(timestamp) {
        if (this.videoElement) {
            this.videoElement.currentTime = timestamp;
            this.videoElement.play();
        }
    }

    async deleteBookmark(id) {
        try {
            await database.deleteBookmark(id);
            this.bookmarks = this.bookmarks.filter(b => b.id !== id);
            this.renderBookmarks();
        } catch (error) {
            console.error('Failed to delete bookmark:', error);
        }
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    }

    window.BookmarkManager = BookmarkManager;
    const bookmarkManager = new BookmarkManager();
    window.bookmarkManager = bookmarkManager;
}
