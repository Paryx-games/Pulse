if (!window.Database) {
    class Database {
        constructor() {
            this.dbName = 'PulseMediaDB';
            this.version = 1;
            this.db = null;
            this.initDB();
        }

    initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database failed to open');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (e) => {
                const db = e.target.result;

                if (!db.objectStoreNames.contains('files')) {
                    const fileStore = db.createObjectStore('files', { keyPath: 'id', autoIncrement: true });
                    fileStore.createIndex('path', 'path', { unique: true });
                    fileStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
                }

                if (!db.objectStoreNames.contains('metadata')) {
                    const metaStore = db.createObjectStore('metadata', { keyPath: 'filePath', autoIncrement: false });
                    metaStore.createIndex('duration', 'duration', { unique: false });
                }

                if (!db.objectStoreNames.contains('favorites')) {
                    db.createObjectStore('favorites', { keyPath: 'filePath', autoIncrement: false });
                }

                if (!db.objectStoreNames.contains('tags')) {
                    const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
                    tagStore.createIndex('name', 'name', { unique: true });
                }

                if (!db.objectStoreNames.contains('tagFiles')) {
                    const tagFileStore = db.createObjectStore('tagFiles', { keyPath: 'id', autoIncrement: true });
                    tagFileStore.createIndex('filePath', 'filePath', { unique: false });
                    tagFileStore.createIndex('tagId', 'tagId', { unique: false });
                }

                if (!db.objectStoreNames.contains('bookmarks')) {
                    const bookmarkStore = db.createObjectStore('bookmarks', { keyPath: 'id', autoIncrement: true });
                    bookmarkStore.createIndex('filePath', 'filePath', { unique: false });
                }

                if (!db.objectStoreNames.contains('playbackProfiles')) {
                    db.createObjectStore('playbackProfiles', { keyPath: 'name', autoIncrement: false });
                }

                if (!db.objectStoreNames.contains('thumbnails')) {
                    db.createObjectStore('thumbnails', { keyPath: 'filePath', autoIncrement: false });
                }

                if (!db.objectStoreNames.contains('keyboardShortcuts')) {
                    db.createObjectStore('keyboardShortcuts', { keyPath: 'action', autoIncrement: false });
                }

                console.log('Database upgraded');
            };
        });
    }

    async addFavorite(filePath, fileData) {
        const tx = this.db.transaction(['favorites'], 'readwrite');
        const store = tx.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.put({
                filePath,
                ...fileData,
                addedAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async removeFavorite(filePath) {
        const tx = this.db.transaction(['favorites'], 'readwrite');
        const store = tx.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.delete(filePath);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async isFavorite(filePath) {
        const tx = this.db.transaction(['favorites'], 'readonly');
        const store = tx.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.get(filePath);
            request.onsuccess = () => resolve(!!request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllFavorites() {
        const tx = this.db.transaction(['favorites'], 'readonly');
        const store = tx.objectStore('favorites');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addToHistory(filePath, fileData, playbackTime) {
        const tx = this.db.transaction(['files'], 'readwrite');
        const store = tx.objectStore('files');
        return new Promise((resolve, reject) => {
            const request = store.put({
                path: filePath,
                ...fileData,
                lastPlayed: new Date().toISOString(),
                lastPlaybackTime: playbackTime || 0
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getHistory(limit = 50) {
        const tx = this.db.transaction(['files'], 'readonly');
        const store = tx.objectStore('files');
        const index = store.index('lastPlayed');
        return new Promise((resolve, reject) => {
            const request = index.openCursor(null, 'prev');
            const results = [];
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor && results.length < limit) {
                    results.push(cursor.value);
                    cursor.continue();
                } else {
                    resolve(results);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async saveMetadata(filePath, metadata) {
        const tx = this.db.transaction(['metadata'], 'readwrite');
        const store = tx.objectStore('metadata');
        return new Promise((resolve, reject) => {
            const request = store.put({
                filePath,
                ...metadata,
                cachedAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getMetadata(filePath) {
        const tx = this.db.transaction(['metadata'], 'readonly');
        const store = tx.objectStore('metadata');
        return new Promise((resolve, reject) => {
            const request = store.get(filePath);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async createTag(tagName) {
        const tx = this.db.transaction(['tags'], 'readwrite');
        const store = tx.objectStore('tags');
        return new Promise((resolve, reject) => {
            const request = store.add({
                name: tagName,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTags() {
        const tx = this.db.transaction(['tags'], 'readonly');
        const store = tx.objectStore('tags');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addFileToTag(filePath, tagId) {
        const tx = this.db.transaction(['tagFiles'], 'readwrite');
        const store = tx.objectStore('tagFiles');
        return new Promise((resolve, reject) => {
            const request = store.add({
                filePath,
                tagId,
                addedAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getFilesForTag(tagId) {
        const tx = this.db.transaction(['tagFiles'], 'readonly');
        const store = tx.objectStore('tagFiles');
        const index = store.index('tagId');
        return new Promise((resolve, reject) => {
            const request = index.getAll(tagId);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addBookmark(filePath, timestamp, label) {
        const tx = this.db.transaction(['bookmarks'], 'readwrite');
        const store = tx.objectStore('bookmarks');
        return new Promise((resolve, reject) => {
            const request = store.add({
                filePath,
                timestamp,
                label,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getBookmarks(filePath) {
        const tx = this.db.transaction(['bookmarks'], 'readonly');
        const store = tx.objectStore('bookmarks');
        const index = store.index('filePath');
        return new Promise((resolve, reject) => {
            const request = index.getAll(filePath);
            request.onsuccess = () => {
                const results = request.result.sort((a, b) => a.timestamp - b.timestamp);
                resolve(results);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async deleteBookmark(bookmarkId) {
        const tx = this.db.transaction(['bookmarks'], 'readwrite');
        const store = tx.objectStore('bookmarks');
        return new Promise((resolve, reject) => {
            const request = store.delete(bookmarkId);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async savePlaybackProfile(profileName, settings) {
        const tx = this.db.transaction(['playbackProfiles'], 'readwrite');
        const store = tx.objectStore('playbackProfiles');
        return new Promise((resolve, reject) => {
            const request = store.put({
                name: profileName,
                settings,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getPlaybackProfile(profileName) {
        const tx = this.db.transaction(['playbackProfiles'], 'readonly');
        const store = tx.objectStore('playbackProfiles');
        return new Promise((resolve, reject) => {
            const request = store.get(profileName);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllPlaybackProfiles() {
        const tx = this.db.transaction(['playbackProfiles'], 'readonly');
        const store = tx.objectStore('playbackProfiles');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePlaybackProfile(profileName) {
        const tx = this.db.transaction(['playbackProfiles'], 'readwrite');
        const store = tx.objectStore('playbackProfiles');
        return new Promise((resolve, reject) => {
            const request = store.delete(profileName);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async saveThumbnail(filePath, thumbnailData) {
        const tx = this.db.transaction(['thumbnails'], 'readwrite');
        const store = tx.objectStore('thumbnails');
        return new Promise((resolve, reject) => {
            const request = store.put({
                filePath,
                data: thumbnailData,
                createdAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getThumbnail(filePath) {
        const tx = this.db.transaction(['thumbnails'], 'readonly');
        const store = tx.objectStore('thumbnails');
        return new Promise((resolve, reject) => {
            const request = store.get(filePath);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async saveKeyboardShortcut(action, keys) {
        const tx = this.db.transaction(['keyboardShortcuts'], 'readwrite');
        const store = tx.objectStore('keyboardShortcuts');
        return new Promise((resolve, reject) => {
            const request = store.put({
                action,
                keys,
                updatedAt: new Date().toISOString()
            });
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getKeyboardShortcut(action) {
        const tx = this.db.transaction(['keyboardShortcuts'], 'readonly');
        const store = tx.objectStore('keyboardShortcuts');
        return new Promise((resolve, reject) => {
            const request = store.get(action);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllKeyboardShortcuts() {
        const tx = this.db.transaction(['keyboardShortcuts'], 'readonly');
        const store = tx.objectStore('keyboardShortcuts');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    }
    
    const database = new Database();
    window.Database = Database;
    window.database = database;
}
