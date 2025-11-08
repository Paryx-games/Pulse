if (!window.HomePage) {
    class HomePage {
        constructor() {
            this.currentBrowsePath = '';
            this.favorites = [];
            this.recentFiles = [];
            this.collections = [];
            this.searchQuery = '';
            this.init();
        }

    async init() {
        this.setupEventListeners();
        await this.loadData();
        this.renderBrowseTab();
    }

    setupEventListeners() {
        const homeSearchInput = document.getElementById('home-search-input');
        const homeTabs = document.querySelectorAll('.home-tab');
        const homeAddFolderBtn = document.getElementById('home-add-folder-btn');
        const createCollectionBtn = document.getElementById('create-collection-btn');

        if (homeSearchInput) {
            homeSearchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }

        homeTabs.forEach(tab => {
            tab.addEventListener('click', (e) => this.switchTab(e.target.closest('.home-tab').dataset.tab));
        });

        if (homeAddFolderBtn) {
            homeAddFolderBtn.addEventListener('click', () => this.selectFolder());
        }

        if (createCollectionBtn) {
            createCollectionBtn.addEventListener('click', () => this.showCreateCollectionModal());
        }
    }

    async loadData() {
        try {
            this.favorites = await database.getAllFavorites();
            this.recentFiles = await database.getHistory(20);
            this.collections = await database.getAllTags();
        } catch (error) {
            console.error('Failed to load home page data:', error);
        }
    }

    switchTab(tabName) {
        const tabs = document.querySelectorAll('.home-tab');
        const sections = document.querySelectorAll('.home-section');

        tabs.forEach(tab => tab.classList.remove('active'));
        sections.forEach(section => section.classList.remove('active'));

        document.querySelector(`[data-tab="${tabName}"].home-tab`)?.classList.add('active');
        document.querySelector(`[data-tab="${tabName}"].home-section`)?.classList.add('active');

        if (tabName === 'favorites') this.renderFavoritesTab();
        else if (tabName === 'recent') this.renderRecentTab();
        else if (tabName === 'collections') this.renderCollectionsTab();
    }

    async selectFolder() {
        try {
            const dirPath = await window.electronAPI.selectDirectory();
            if (dirPath) {
                this.currentBrowsePath = dirPath;
                await this.renderBrowseTab();
            }
        } catch (error) {
            console.error('Failed to select folder:', error);
        }
    }

    async renderBrowseTab() {
        const grid = document.getElementById('browse-grid');
        const breadcrumb = document.getElementById('breadcrumb');

        if (!this.currentBrowsePath) {
            grid.innerHTML = '<div class="empty-message">Select a folder to browse</div>';
            return;
        }

        try {
            const items = await window.electronAPI.getDirectoryContents(this.currentBrowsePath);
            this.updateBreadcrumb(breadcrumb);
            this.renderItems(grid, items);
        } catch (error) {
            console.error('Failed to load directory:', error);
            grid.innerHTML = `<div class="empty-message">Error loading folder: ${error.message}</div>`;
        }
    }

    updateBreadcrumb(breadcrumbEl) {
        const paths = this.currentBrowsePath.split(/[/\\]/);
        breadcrumbEl.innerHTML = '<span class="breadcrumb-item" data-path="">Home</span>';

        let currentPath = '';
        for (const part of paths) {
            if (!part) continue;
            currentPath = currentPath ? `${currentPath}${part}/` : `${part}/`;
            const item = document.createElement('span');
            item.className = 'breadcrumb-item';
            item.dataset.path = currentPath;
            item.textContent = part;
            item.addEventListener('click', () => this.navigateTo(currentPath));
            breadcrumbEl.appendChild(item);
        }
    }

    navigateTo(path) {
        this.currentBrowsePath = path.replace(/\/$/, '');
        this.renderBrowseTab();
    }

    renderItems(container, items) {
        if (items.length === 0) {
            container.innerHTML = '<div class="empty-message">No media files found</div>';
            return;
        }

        container.innerHTML = '';

        items.forEach(item => {
            const element = this.createFileCard(item);
            container.appendChild(element);
        });
    }

    createFileCard(item) {
        const card = document.createElement('div');
        card.className = 'file-card';

        const icon = item.isDirectory ? 'fa-folder' : 'fa-file-video';
        const isFav = this.favorites.some(f => f.filePath === item.path);

        card.innerHTML = `
            <div class="file-card-thumbnail">
                <i class="fas ${icon}"></i>
            </div>
            <div class="file-card-info">
                <div class="file-card-name">${this.escapeHtml(item.name)}</div>
                <div class="file-card-meta">${this.formatFileSize(item.size)}</div>
            </div>
            <div class="file-card-actions">
                ${!item.isDirectory ? `<button class="icon-btn favorite-btn" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                    <i class="fas fa-star ${isFav ? 'filled' : ''}"></i>
                </button>` : ''}
            </div>
        `;

        if (item.isDirectory) {
            card.addEventListener('dblclick', () => {
                this.currentBrowsePath = item.path;
                this.renderBrowseTab();
            });
        } else {
            card.addEventListener('dblclick', () => {
                window.goToPlayer(item.path);
            });

            const favBtn = card.querySelector('.favorite-btn');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.toggleFavorite(item);
                });
            }
        }

        return card;
    }

    async toggleFavorite(item) {
        try {
            const isFav = this.favorites.some(f => f.filePath === item.path);

            if (isFav) {
                await database.removeFavorite(item.path);
                this.favorites = this.favorites.filter(f => f.filePath !== item.path);
            } else {
                await database.addFavorite(item.path, { name: item.name, ext: item.ext });
                this.favorites.push({ filePath: item.path, name: item.name, ext: item.ext });
            }

            this.renderBrowseTab();
        } catch (error) {
            console.error('Failed to toggle favorite:', error);
        }
    }

    async renderFavoritesTab() {
        const grid = document.getElementById('favorites-grid');

        if (this.favorites.length === 0) {
            grid.innerHTML = '<div class="empty-message">No favorites yet. Click the star icon on any file to add it.</div>';
            return;
        }

        grid.innerHTML = '';
        this.favorites.forEach(item => {
            const card = document.createElement('div');
            card.className = 'file-card';

            card.innerHTML = `
                <div class="file-card-thumbnail">
                    <i class="fas fa-file-video"></i>
                </div>
                <div class="file-card-info">
                    <div class="file-card-name">${this.escapeHtml(item.name)}</div>
                </div>
                <div class="file-card-actions">
                    <button class="icon-btn favorite-btn" title="Remove from favorites">
                        <i class="fas fa-star filled"></i>
                    </button>
                </div>
            `;

            card.addEventListener('dblclick', () => {
                window.goToPlayer(item.filePath);
            });

            card.querySelector('.favorite-btn').addEventListener('click', async (e) => {
                e.stopPropagation();
                await database.removeFavorite(item.filePath);
                this.favorites = this.favorites.filter(f => f.filePath !== item.filePath);
                this.renderFavoritesTab();
            });

            grid.appendChild(card);
        });
    }

    async renderRecentTab() {
        const grid = document.getElementById('recent-grid');

        if (this.recentFiles.length === 0) {
            grid.innerHTML = '<div class="empty-message">No recently played files</div>';
            return;
        }

        grid.innerHTML = '';
        this.recentFiles.forEach(item => {
            const card = document.createElement('div');
            card.className = 'file-card';

            const played = new Date(item.lastPlayed).toLocaleDateString();

            card.innerHTML = `
                <div class="file-card-thumbnail">
                    <i class="fas fa-file-video"></i>
                </div>
                <div class="file-card-info">
                    <div class="file-card-name">${this.escapeHtml(item.name || 'Unknown')}</div>
                    <div class="file-card-meta">Played: ${played}</div>
                </div>
            `;

            card.addEventListener('dblclick', () => {
                window.goToPlayer(item.path);
            });

            grid.appendChild(card);
        });
    }

    async renderCollectionsTab() {
        const container = document.getElementById('collections-list');

        if (this.collections.length === 0) {
            container.innerHTML = '<div class="empty-message">No collections yet</div>';
            return;
        }

        container.innerHTML = '';

        for (const collection of this.collections) {
            const files = await database.getFilesForTag(collection.id);

            const collectionDiv = document.createElement('div');
            collectionDiv.className = 'collection-item';

            collectionDiv.innerHTML = `
                <div class="collection-header">
                    <h4>${this.escapeHtml(collection.name)}</h4>
                    <span class="collection-count">${files.length} files</span>
                </div>
                <div class="collection-actions">
                    <button class="icon-btn" title="Edit collection">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="icon-btn" title="Delete collection">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            container.appendChild(collectionDiv);
        }
    }

    showCreateCollectionModal() {
        const name = prompt('Collection name:');
        if (name && name.trim()) {
            this.createCollection(name.trim());
        }
    }

    async createCollection(name) {
        try {
            const tagId = await database.createTag(name);
            this.collections.push({ id: tagId, name });
            this.renderCollectionsTab();
        } catch (error) {
            console.error('Failed to create collection:', error);
            alert('Failed to create collection');
        }
    }

    async handleSearch(query) {
        this.searchQuery = query.toLowerCase();

        if (!query.trim()) {
            this.renderBrowseTab();
            this.renderFavoritesTab();
            this.renderRecentTab();
            return;
        }

        const grid = document.getElementById('browse-grid');
        const allFavorites = await database.getAllFavorites();
        const results = allFavorites.filter(f => 
            f.name.toLowerCase().includes(this.searchQuery)
        );

        if (results.length === 0) {
            grid.innerHTML = '<div class="empty-message">No results found</div>';
        } else {
            grid.innerHTML = '';
            results.forEach(item => {
                const card = this.createFileCard({ name: item.name, path: item.filePath, ext: item.ext, size: 0, isDirectory: false });
                grid.appendChild(card);
            });
        }
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    }

    window.HomePage = HomePage;
    const homePage = new HomePage();
    window.homePage = homePage;
}
