/**
 * SearchFilter - 汎用的なリアルタイム検索・フィルタリングライブラリ
 * file://プロトコル対応版（通常のscriptタグで読み込み可能）
 */
(function(global) {
  'use strict';

  class SearchFilter {
    constructor(options = {}) {
      const defaults = {
        searchInputId: 'search-input',
        clearButtonId: 'clear-btn',
        resultCountId: 'result-count',
        itemSelector: '.search-item',
        containerSelector: '#items-container',
        noResultsId: 'no-results',
        emptyStateId: 'empty-state',
        searchContainerSelector: '.search-container',
        caseSensitive: false,
        hiddenClass: 'hidden',
        visibleClass: 'visible',
        debounceMs: 0,
        autoDetect: true,
        searchFields: ['title'], // data-*属性のフィールド名
        searchTextContent: true  // textContentも検索対象に含めるか
      };

      this.options = { ...defaults, ...options };
      this.searchInput = null;
      this.clearBtn = null;
      this.resultCount = null;
      this.container = null;
      this.noResultsEl = null;
      this.emptyStateEl = null;
      this.searchContainer = null;
      this.items = [];
      this.totalItems = 0;
      this.debounceTimer = null;
      this.isInitialized = false;
      this.listeners = [];
      this.filters = {}; // カテゴリなどのフィルター条件
    }

    init() {
      if (this.isInitialized) {
        console.warn('SearchFilter: Already initialized');
        return this;
      }

      if (this.options.autoDetect) {
        this._autoDetectFromDataAttributes();
      }

      this._getDOMElements();
      this._refreshItems();

      if (this._checkEmptyState()) {
        this.isInitialized = true;
        return this;
      }

      this._setupEventListeners();
      this._updateResultCount(this.totalItems, this.totalItems);
      this.isInitialized = true;
      return this;
    }

    _autoDetectFromDataAttributes() {
      const searchInput = document.getElementById(this.options.searchInputId);
      if (!searchInput) return;

      const itemSelector = searchInput.dataset.searchItem;
      if (itemSelector) this.options.itemSelector = itemSelector;

      const containerSelector = searchInput.dataset.searchContainer;
      if (containerSelector) this.options.containerSelector = containerSelector;

      const clearButtonId = searchInput.dataset.searchClear;
      if (clearButtonId) this.options.clearButtonId = clearButtonId;

      const resultCountId = searchInput.dataset.searchCount;
      if (resultCountId) this.options.resultCountId = resultCountId;

      const noResultsId = searchInput.dataset.searchNoResults;
      if (noResultsId) this.options.noResultsId = noResultsId;
    }

    _getDOMElements() {
      this.searchInput = document.getElementById(this.options.searchInputId);
      if (!this.searchInput) {
        throw new Error(`SearchFilter: Element with id "${this.options.searchInputId}" not found`);
      }

      this.clearBtn = document.getElementById(this.options.clearButtonId);
      this.resultCount = document.getElementById(this.options.resultCountId);
      this.container = document.querySelector(this.options.containerSelector);
      this.noResultsEl = document.getElementById(this.options.noResultsId);
      this.emptyStateEl = document.getElementById(this.options.emptyStateId);
      this.searchContainer = document.querySelector(this.options.searchContainerSelector);
    }

    _checkEmptyState() {
      if (this.totalItems === 0 && this.emptyStateEl) {
        if (this.searchContainer) this.searchContainer.style.display = 'none';
        if (this.container) this.container.style.display = 'none';
        this.emptyStateEl.style.display = 'block';
        return true;
      }
      return false;
    }

    _refreshItems() {
      this.items = Array.from(document.querySelectorAll(this.options.itemSelector));
      this.totalItems = this.items.length;
    }

    _setupEventListeners() {
      const inputHandler = (e) => {
        if (this.options.debounceMs > 0) {
          this._debounceFilter(e.target.value);
        } else {
          this.filter(e.target.value);
        }
        this._updateClearButton();
      };
      this.searchInput.addEventListener('input', inputHandler);
      this.listeners.push({ element: this.searchInput, type: 'input', handler: inputHandler });

      if (this.clearBtn) {
        const clearHandler = () => this.clear();
        this.clearBtn.addEventListener('click', clearHandler);
        this.listeners.push({ element: this.clearBtn, type: 'click', handler: clearHandler });
      }

      const keydownHandler = (e) => {
        if (e.key === 'Escape') {
          this.clear();
          e.preventDefault();
        }
      };
      this.searchInput.addEventListener('keydown', keydownHandler);
      this.listeners.push({ element: this.searchInput, type: 'keydown', handler: keydownHandler });
    }

    _debounceFilter(keyword) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.filter(keyword);
      }, this.options.debounceMs);
    }

    filter(keyword) {
      const normalizedKeyword = this.options.caseSensitive
        ? keyword.trim()
        : keyword.trim().toLowerCase();

      if (normalizedKeyword === '') {
        this.showAll();
        return this.totalItems;
      }

      // 半角スペースで分割してキーワード配列を作成
      const keywords = normalizedKeyword.split(/\s+/).filter(k => k.length > 0);

      let visibleCount = 0;

      this.items.forEach(item => {
        // カテゴリフィルターのチェック
        const categoryMatch = this._checkCategoryFilter(item);
        if (!categoryMatch) {
          item.classList.add(this.options.hiddenClass);
          return;
        }

        // 検索対象テキストの取得
        const searchText = this._getSearchText(item);
        const normalizedText = this.options.caseSensitive
          ? searchText
          : searchText.toLowerCase();

        // すべてのキーワードが含まれているかチェック（AND検索）
        const matches = keywords.every(k => normalizedText.includes(k));

        if (matches) {
          item.classList.remove(this.options.hiddenClass);
          visibleCount++;
        } else {
          item.classList.add(this.options.hiddenClass);
        }
      });

      this._updateResultCount(visibleCount, this.totalItems);
      this._updateNoResultsMessage(visibleCount);

      if (this.options.onSearch) {
        this.options.onSearch({
          keyword: normalizedKeyword,
          visibleCount,
          totalCount: this.totalItems,
          items: this.items.filter(item => !item.classList.contains(this.options.hiddenClass))
        });
      }

      return visibleCount;
    }

    showAll() {
      let visibleCount = 0;

      this.items.forEach(item => {
        // カテゴリフィルターが設定されている場合はチェック
        const categoryMatch = this._checkCategoryFilter(item);
        if (categoryMatch) {
          item.classList.remove(this.options.hiddenClass);
          visibleCount++;
        } else {
          item.classList.add(this.options.hiddenClass);
        }
      });

      this._updateResultCount(visibleCount, this.totalItems);

      if (this.noResultsEl) this.noResultsEl.style.display = 'none';
      if (this.container) this.container.style.display = '';

      return this;
    }

    clear() {
      this.searchInput.value = '';
      this.showAll();
      this._updateClearButton();
      this.searchInput.focus();

      if (this.options.onClear) this.options.onClear();

      return this;
    }

    _updateResultCount(visible, total) {
      if (!this.resultCount) return;

      if (this.searchInput.value.trim() === '') {
        this.resultCount.textContent = `全 ${total} 件`;
      } else {
        this.resultCount.textContent = `${visible} / ${total} 件を表示`;
      }
    }

    _updateNoResultsMessage(visibleCount) {
      if (!this.noResultsEl) return;

      if (visibleCount === 0 && this.searchInput.value.trim() !== '') {
        if (this.container) this.container.style.display = 'none';
        this.noResultsEl.style.display = 'block';
      } else {
        if (this.container) this.container.style.display = '';
        this.noResultsEl.style.display = 'none';
      }
    }

    _updateClearButton() {
      if (!this.clearBtn) return;

      if (this.searchInput.value.trim() !== '') {
        this.clearBtn.classList.add(this.options.visibleClass);
      } else {
        this.clearBtn.classList.remove(this.options.visibleClass);
      }
    }

    refresh() {
      this._refreshItems();

      const currentKeyword = this.searchInput.value;
      if (currentKeyword.trim() !== '') {
        this.filter(currentKeyword);
      } else {
        this._updateResultCount(this.totalItems, this.totalItems);
      }

      return this;
    }

    getKeyword() {
      return this.searchInput.value;
    }

    getVisibleItems() {
      return this.items.filter(item => !item.classList.contains(this.options.hiddenClass));
    }

    getHiddenItems() {
      return this.items.filter(item => item.classList.contains(this.options.hiddenClass));
    }

    setFilter(key, value) {
      if (value === null || value === undefined || value === '') {
        delete this.filters[key];
      } else {
        this.filters[key] = value;
      }

      // 現在の検索キーワードで再フィルタリング
      const currentKeyword = this.searchInput.value;
      if (currentKeyword.trim() !== '') {
        this.filter(currentKeyword);
      } else {
        this.showAll();
      }

      return this;
    }

    clearFilters() {
      this.filters = {};

      const currentKeyword = this.searchInput.value;
      if (currentKeyword.trim() !== '') {
        this.filter(currentKeyword);
      } else {
        this.showAll();
      }

      return this;
    }

    getFilters() {
      return { ...this.filters };
    }

    _checkCategoryFilter(item) {
      // フィルターが設定されていない場合は全て表示
      if (Object.keys(this.filters).length === 0) {
        return true;
      }

      // すべてのフィルター条件をチェック
      return Object.entries(this.filters).every(([key, value]) => {
        const itemValue = item.dataset[key];
        return itemValue === value;
      });
    }

    _getSearchText(item) {
      const texts = [];

      // data-*属性から検索対象フィールドを取得
      this.options.searchFields.forEach(field => {
        const value = item.dataset[field];
        if (value) {
          texts.push(value);
        }
      });

      // textContentも検索対象に含める場合
      if (this.options.searchTextContent) {
        texts.push(item.textContent);
      }

      return texts.join(' ');
    }

    destroy() {
      this.listeners.forEach(({ element, type, handler }) => {
        element.removeEventListener(type, handler);
      });
      this.listeners = [];

      if (this.debounceTimer) clearTimeout(this.debounceTimer);

      this.showAll();
      this.isInitialized = false;
    }
  }

  // グローバルスコープに公開
  global.SearchFilter = SearchFilter;

})(typeof window !== 'undefined' ? window : this);
