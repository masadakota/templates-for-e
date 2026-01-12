/**
 * SearchFilter - 汎用的なリアルタイム検索・フィルタリングライブラリ
 *
 * @example
 * // 最小限の設定（data-*属性で自動検出）
 * const filter = new SearchFilter();
 * filter.init();
 *
 * @example
 * // カスタム設定
 * const filter = new SearchFilter({
 *   itemSelector: '.custom-item'
 * });
 * filter.init();
 */
export class SearchFilter {
  /**
   * @param {Object} [options={}] - 設定オプション
   * @param {string} [options.searchInputId='search-input'] - 検索inputのID
   * @param {string} [options.clearButtonId='clear-btn'] - クリアボタンのID
   * @param {string} [options.resultCountId='result-count'] - 結果カウント表示のID
   * @param {string} [options.itemSelector='.search-item'] - フィルタリング対象アイテムのCSSセレクター
   * @param {string} [options.containerSelector='#items-container'] - アイテムコンテナのCSSセレクター
   * @param {string} [options.noResultsId='no-results'] - 検索結果なしメッセージのID
   * @param {string} [options.emptyStateId='empty-state'] - 空の状態メッセージのID
   * @param {string} [options.searchContainerSelector='.search-container'] - 検索コンテナのセレクター
   * @param {boolean} [options.caseSensitive=false] - 大文字小文字を区別するか
   * @param {string} [options.hiddenClass='hidden'] - 非表示にするためのCSSクラス
   * @param {string} [options.visibleClass='visible'] - クリアボタン表示用クラス
   * @param {number} [options.debounceMs=0] - デバウンス時間（ミリ秒、0=なし）
   * @param {boolean} [options.autoDetect=true] - data-*属性で自動検出するか
   * @param {Function} [options.onSearch] - 検索実行時のコールバック関数
   * @param {Function} [options.onClear] - 検索クリア時のコールバック関数
   */
  constructor(options = {}) {
    // デフォルト設定
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
      autoDetect: true
    };

    // オプションの保存
    this.options = { ...defaults, ...options };

    // DOM要素の参照
    this.searchInput = null;
    this.clearBtn = null;
    this.resultCount = null;
    this.container = null;
    this.noResultsEl = null;
    this.emptyStateEl = null;
    this.searchContainer = null;
    this.items = [];

    // 内部状態
    this.totalItems = 0;
    this.debounceTimer = null;
    this.isInitialized = false;

    // クリーンアップ用のリスナー配列
    this.listeners = [];
  }

  /**
   * 初期化処理
   * @returns {SearchFilter} this（メソッドチェーン用）
   */
  init() {
    if (this.isInitialized) {
      console.warn('SearchFilter: Already initialized');
      return this;
    }

    // data-*属性から設定を自動検出
    if (this.options.autoDetect) {
      this._autoDetectFromDataAttributes();
    }

    // DOM要素の取得
    this._getDOMElements();

    // アイテムの取得とカウント
    this._refreshItems();

    // 空の状態をチェック
    if (this._checkEmptyState()) {
      this.isInitialized = true;
      return this;
    }

    // イベントリスナーの設定
    this._setupEventListeners();

    // 初期表示の更新
    this._updateResultCount(this.totalItems, this.totalItems);

    this.isInitialized = true;

    return this;
  }

  /**
   * data-*属性から設定を自動検出
   * @private
   */
  _autoDetectFromDataAttributes() {
    const searchInput = document.getElementById(this.options.searchInputId);
    if (!searchInput) return;

    // data-search-item属性から対象セレクターを取得
    const itemSelector = searchInput.dataset.searchItem;
    if (itemSelector) {
      this.options.itemSelector = itemSelector;
    }

    // data-search-container属性からコンテナセレクターを取得
    const containerSelector = searchInput.dataset.searchContainer;
    if (containerSelector) {
      this.options.containerSelector = containerSelector;
    }

    // data-search-clear属性からクリアボタンIDを取得
    const clearButtonId = searchInput.dataset.searchClear;
    if (clearButtonId) {
      this.options.clearButtonId = clearButtonId;
    }

    // data-search-count属性から結果カウントIDを取得
    const resultCountId = searchInput.dataset.searchCount;
    if (resultCountId) {
      this.options.resultCountId = resultCountId;
    }

    // data-search-no-results属性から検索結果なしIDを取得
    const noResultsId = searchInput.dataset.searchNoResults;
    if (noResultsId) {
      this.options.noResultsId = noResultsId;
    }
  }

  /**
   * DOM要素を取得
   * @private
   */
  _getDOMElements() {
    // 検索input（必須）
    this.searchInput = document.getElementById(this.options.searchInputId);
    if (!this.searchInput) {
      throw new Error(`SearchFilter: Element with id "${this.options.searchInputId}" not found`);
    }

    // クリアボタン（オプション）
    this.clearBtn = document.getElementById(this.options.clearButtonId);

    // 結果カウント表示（オプション）
    this.resultCount = document.getElementById(this.options.resultCountId);

    // コンテナ（オプション）
    this.container = document.querySelector(this.options.containerSelector);

    // 検索結果なしメッセージ（オプション）
    this.noResultsEl = document.getElementById(this.options.noResultsId);

    // 空の状態メッセージ（オプション）
    this.emptyStateEl = document.getElementById(this.options.emptyStateId);

    // 検索コンテナ（オプション）
    this.searchContainer = document.querySelector(this.options.searchContainerSelector);
  }

  /**
   * 空の状態をチェック（アイテムが0件の場合）
   * @private
   * @returns {boolean} 空の状態の場合true
   */
  _checkEmptyState() {
    if (this.totalItems === 0 && this.emptyStateEl) {
      // 検索UIを非表示
      if (this.searchContainer) {
        this.searchContainer.style.display = 'none';
      }
      // コンテナを非表示
      if (this.container) {
        this.container.style.display = 'none';
      }
      // 空の状態メッセージを表示
      this.emptyStateEl.style.display = 'block';
      return true;
    }
    return false;
  }

  /**
   * フィルタリング対象アイテムを取得・更新
   * @private
   */
  _refreshItems() {
    this.items = Array.from(document.querySelectorAll(this.options.itemSelector));
    this.totalItems = this.items.length;
  }

  /**
   * イベントリスナーを設定
   * @private
   */
  _setupEventListeners() {
    // リアルタイム検索
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

    // クリアボタン
    if (this.clearBtn) {
      const clearHandler = () => this.clear();
      this.clearBtn.addEventListener('click', clearHandler);
      this.listeners.push({ element: this.clearBtn, type: 'click', handler: clearHandler });
    }

    // ESCキーでクリア
    const keydownHandler = (e) => {
      if (e.key === 'Escape') {
        this.clear();
        e.preventDefault();
      }
    };
    this.searchInput.addEventListener('keydown', keydownHandler);
    this.listeners.push({ element: this.searchInput, type: 'keydown', handler: keydownHandler });
  }

  /**
   * デバウンス付きフィルタリング
   * @private
   * @param {string} keyword - 検索キーワード
   */
  _debounceFilter(keyword) {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.filter(keyword);
    }, this.options.debounceMs);
  }

  /**
   * フィルタリング実行
   * @param {string} keyword - 検索キーワード（半角スペース区切りで複数指定可能）
   * @returns {number} 表示されているアイテム数
   */
  filter(keyword) {
    // キーワードの正規化
    const normalizedKeyword = this.options.caseSensitive
      ? keyword.trim()
      : keyword.trim().toLowerCase();

    // 空の場合は全表示
    if (normalizedKeyword === '') {
      this.showAll();
      return this.totalItems;
    }

    // 半角スペースで分割してキーワード配列を作成（AND検索）
    const keywords = normalizedKeyword.split(/\s+/).filter(k => k.length > 0);

    // フィルタリング
    let visibleCount = 0;

    this.items.forEach(item => {
      const text = this.options.caseSensitive
        ? item.textContent
        : item.textContent.toLowerCase();

      // すべてのキーワードが含まれているかチェック（AND検索）
      const matches = keywords.every(k => text.includes(k));

      if (matches) {
        item.classList.remove(this.options.hiddenClass);
        visibleCount++;
      } else {
        item.classList.add(this.options.hiddenClass);
      }
    });

    // UI更新
    this._updateResultCount(visibleCount, this.totalItems);
    this._updateNoResultsMessage(visibleCount);

    // コールバック実行
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

  /**
   * 全アイテムを表示
   * @returns {SearchFilter} this（メソッドチェーン用）
   */
  showAll() {
    this.items.forEach(item => item.classList.remove(this.options.hiddenClass));
    this._updateResultCount(this.totalItems, this.totalItems);

    if (this.noResultsEl) {
      this.noResultsEl.style.display = 'none';
    }
    if (this.container) {
      this.container.style.display = '';
    }

    return this;
  }

  /**
   * 検索をクリア
   * @returns {SearchFilter} this（メソッドチェーン用）
   */
  clear() {
    this.searchInput.value = '';
    this.showAll();
    this._updateClearButton();
    this.searchInput.focus();

    // コールバック実行
    if (this.options.onClear) {
      this.options.onClear();
    }

    return this;
  }

  /**
   * 結果カウント表示を更新
   * @private
   * @param {number} visible - 表示中のアイテム数
   * @param {number} total - 総アイテム数
   */
  _updateResultCount(visible, total) {
    if (!this.resultCount) return;

    if (this.searchInput.value.trim() === '') {
      this.resultCount.textContent = `全 ${total} 件`;
    } else {
      this.resultCount.textContent = `${visible} / ${total} 件を表示`;
    }
  }

  /**
   * 検索結果なしメッセージの表示/非表示
   * @private
   * @param {number} visibleCount - 表示中のアイテム数
   */
  _updateNoResultsMessage(visibleCount) {
    if (!this.noResultsEl) return;

    if (visibleCount === 0 && this.searchInput.value.trim() !== '') {
      if (this.container) {
        this.container.style.display = 'none';
      }
      this.noResultsEl.style.display = 'block';
    } else {
      if (this.container) {
        this.container.style.display = '';
      }
      this.noResultsEl.style.display = 'none';
    }
  }

  /**
   * クリアボタンの表示/非表示
   * @private
   */
  _updateClearButton() {
    if (!this.clearBtn) return;

    if (this.searchInput.value.trim() !== '') {
      this.clearBtn.classList.add(this.options.visibleClass);
    } else {
      this.clearBtn.classList.remove(this.options.visibleClass);
    }
  }

  /**
   * アイテムリストを再読み込み
   * 動的に追加されたアイテムを反映する場合に使用
   * @returns {SearchFilter} this（メソッドチェーン用）
   */
  refresh() {
    this._refreshItems();

    // 現在の検索キーワードで再フィルタリング
    const currentKeyword = this.searchInput.value;
    if (currentKeyword.trim() !== '') {
      this.filter(currentKeyword);
    } else {
      this._updateResultCount(this.totalItems, this.totalItems);
    }

    return this;
  }

  /**
   * 現在の検索キーワードを取得
   * @returns {string} 検索キーワード
   */
  getKeyword() {
    return this.searchInput.value;
  }

  /**
   * 現在表示中のアイテムを取得
   * @returns {HTMLElement[]} 表示中のアイテム配列
   */
  getVisibleItems() {
    return this.items.filter(item => !item.classList.contains(this.options.hiddenClass));
  }

  /**
   * 現在非表示のアイテムを取得
   * @returns {HTMLElement[]} 非表示のアイテム配列
   */
  getHiddenItems() {
    return this.items.filter(item => item.classList.contains(this.options.hiddenClass));
  }

  /**
   * 破棄処理（イベントリスナーの削除）
   */
  destroy() {
    // すべてのイベントリスナーを削除
    this.listeners.forEach(({ element, type, handler }) => {
      element.removeEventListener(type, handler);
    });
    this.listeners = [];

    // デバウンスタイマーをクリア
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // 全アイテムを表示状態に戻す
    this.showAll();

    this.isInitialized = false;
  }
}

// デフォルトエクスポート
export default SearchFilter;
