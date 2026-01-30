/**
 * Tabs - シンプルなタブ切り替えライブラリ
 * file://プロトコル対応 - IIFE パターン
 *
 * @example
 * const tabs = new Tabs({
 *   container: '.tabs-container',
 *   defaultTab: 'tab1',
 *   onChange: (tabId) => console.log('Changed to:', tabId)
 * });
 */
(function () {
  'use strict';

  class Tabs {
    /**
     * @param {Object} options - 設定オプション
     * @param {string|HTMLElement} options.container - タブコンテナのセレクタまたは要素
     * @param {string|HTMLElement} [options.panelContainer] - タブパネルコンテナのセレクタまたは要素（省略時はcontainerと同じ）
     * @param {string} [options.defaultTab] - 初期表示するタブのID
     * @param {Function} [options.onChange] - タブ変更時のコールバック
     * @param {string} [options.tabSelector] - タブボタンのセレクタ (default: '[data-tab]')
     * @param {string} [options.panelSelector] - タブパネルのセレクタ (default: '[data-tab-panel]')
     * @param {string} [options.activeClass] - アクティブ時のクラス名 (default: 'active')
     * @param {boolean} [options.enableKeyboard] - キーボード操作を有効化 (default: true)
     * @param {boolean} [options.enableHistory] - ブラウザ履歴との連携 (default: false)
     */
    constructor(options = {}) {
      // 設定のデフォルト値
      this.options = {
        container: null,
        panelContainer: null,
        defaultTab: null,
        onChange: null,
        tabSelector: '[data-tab]',
        panelSelector: '[data-tab-panel]',
        activeClass: 'active',
        enableKeyboard: true,
        enableHistory: false,
        ...options
      };

      // コンテナ要素を取得
      this.container = typeof this.options.container === 'string'
        ? document.querySelector(this.options.container)
        : this.options.container;

      if (!this.container) {
        throw new Error('Tabs: container not found');
      }

      // パネルコンテナを取得（未指定の場合はcontainerと同じ）
      if (this.options.panelContainer) {
        this.panelContainer = typeof this.options.panelContainer === 'string'
          ? document.querySelector(this.options.panelContainer)
          : this.options.panelContainer;
      } else {
        this.panelContainer = this.container;
      }

      // タブとパネルの要素を取得
      this.tabs = Array.from(this.container.querySelectorAll(this.options.tabSelector));
      this.panels = Array.from(this.panelContainer.querySelectorAll(this.options.panelSelector));

      if (this.tabs.length === 0) {
        throw new Error('Tabs: no tabs found');
      }

      // 現在のアクティブタブ
      this.currentTab = null;

      // イベントリスナーの参照を保持（クリーンアップ用）
      this.boundHandlers = {
        click: this._handleTabClick.bind(this),
        keydown: this._handleKeyDown.bind(this),
        popstate: this._handlePopState.bind(this)
      };

      // 初期化
      this._init();
    }

    /**
     * 初期化処理
     * @private
     */
    _init() {
      // タブにARIA属性を設定
      this._setupAccessibility();

      // イベントリスナーを設定
      this._setupEventListeners();

      // 初期表示するタブを決定
      let initialTab = this._getInitialTab();

      // デフォルトタブが指定されていない場合は最初のタブ
      if (!initialTab && this.tabs.length > 0) {
        initialTab = this.tabs[0].getAttribute('data-tab');
      }

      // 初期タブを表示
      if (initialTab) {
        this.showTab(initialTab, false); // 初期表示はコールバックを呼ばない
      }
    }

    /**
     * アクセシビリティ属性を設定
     * @private
     */
    _setupAccessibility() {
      // タブボタンにrole="tab"を設定
      this.tabs.forEach((tab, index) => {
        const tabId = tab.getAttribute('data-tab');

        tab.setAttribute('role', 'tab');
        tab.setAttribute('aria-controls', `panel-${tabId}`);
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');

        if (!tab.id) {
          tab.id = `tab-${tabId}`;
        }
      });

      // タブパネルにrole="tabpanel"を設定
      this.panels.forEach((panel) => {
        const panelId = panel.getAttribute('data-tab-panel');

        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', `tab-${panelId}`);
        panel.setAttribute('tabindex', '0');
        panel.hidden = true;

        if (!panel.id) {
          panel.id = `panel-${panelId}`;
        }
      });

      // タブリストコンテナを探す
      const tabList = this.container.querySelector('[role="tablist"]');
      if (tabList) {
        tabList.setAttribute('aria-label', 'タブリスト');
      }
    }

    /**
     * イベントリスナーを設定
     * @private
     */
    _setupEventListeners() {
      // タブクリックイベント
      this.tabs.forEach((tab) => {
        tab.addEventListener('click', this.boundHandlers.click);
      });

      // キーボード操作
      if (this.options.enableKeyboard) {
        this.container.addEventListener('keydown', this.boundHandlers.keydown);
      }

      // ブラウザ履歴との連携
      if (this.options.enableHistory) {
        window.addEventListener('popstate', this.boundHandlers.popstate);
      }
    }

    /**
     * 初期表示するタブを決定
     * @private
     * @returns {string|null} タブID
     */
    _getInitialTab() {
      // URL のハッシュをチェック
      if (this.options.enableHistory && window.location.hash) {
        const hashTab = window.location.hash.substring(1);
        if (this._isValidTab(hashTab)) {
          return hashTab;
        }
      }

      // デフォルトタブ
      if (this.options.defaultTab && this._isValidTab(this.options.defaultTab)) {
        return this.options.defaultTab;
      }

      return null;
    }

    /**
     * タブIDが有効かチェック
     * @private
     * @param {string} tabId - タブID
     * @returns {boolean}
     */
    _isValidTab(tabId) {
      return this.tabs.some(tab => tab.getAttribute('data-tab') === tabId);
    }

    /**
     * タブクリックハンドラー
     * @private
     * @param {Event} event - クリックイベント
     */
    _handleTabClick(event) {
      const tab = event.currentTarget;
      const tabId = tab.getAttribute('data-tab');

      if (tabId) {
        this.showTab(tabId);
      }
    }

    /**
     * キーボード操作ハンドラー
     * @private
     * @param {KeyboardEvent} event - キーボードイベント
     */
    _handleKeyDown(event) {
      const target = event.target;

      // タブボタン上でのキーボード操作のみ処理
      if (!target.hasAttribute('data-tab')) {
        return;
      }

      const currentIndex = this.tabs.indexOf(target);
      let nextIndex = -1;

      switch (event.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault();
          nextIndex = (currentIndex + 1) % this.tabs.length;
          break;

        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault();
          nextIndex = (currentIndex - 1 + this.tabs.length) % this.tabs.length;
          break;

        case 'Home':
          event.preventDefault();
          nextIndex = 0;
          break;

        case 'End':
          event.preventDefault();
          nextIndex = this.tabs.length - 1;
          break;

        default:
          return;
      }

      if (nextIndex !== -1) {
        const nextTab = this.tabs[nextIndex];
        const nextTabId = nextTab.getAttribute('data-tab');
        this.showTab(nextTabId);
        nextTab.focus();
      }
    }

    /**
     * ブラウザ履歴の戻る/進むハンドラー
     * @private
     * @param {PopStateEvent} event - popstateイベント
     */
    _handlePopState(event) {
      if (event.state && event.state.tabId) {
        this.showTab(event.state.tabId, false); // コールバックは呼ばない
      }
    }

    /**
     * タブを表示
     * @param {string} tabId - 表示するタブのID
     * @param {boolean} [triggerCallback=true] - onChangeコールバックを実行するか
     */
    showTab(tabId, triggerCallback = true) {
      if (!this._isValidTab(tabId)) {
        console.warn(`Tabs: invalid tab ID "${tabId}"`);
        return;
      }

      // すでに表示中の場合は何もしない
      if (this.currentTab === tabId) {
        return;
      }

      const previousTab = this.currentTab;

      // すべてのタブを非アクティブ化
      this.tabs.forEach((tab) => {
        tab.classList.remove(this.options.activeClass);
        tab.setAttribute('aria-selected', 'false');
        tab.setAttribute('tabindex', '-1');
      });

      // すべてのパネルを非表示
      this.panels.forEach((panel) => {
        panel.classList.remove(this.options.activeClass);
        panel.hidden = true;
      });

      // 指定されたタブをアクティブ化
      const activeTab = this.tabs.find(tab => tab.getAttribute('data-tab') === tabId);
      const activePanel = this.panels.find(panel => panel.getAttribute('data-tab-panel') === tabId);

      if (activeTab) {
        activeTab.classList.add(this.options.activeClass);
        activeTab.setAttribute('aria-selected', 'true');
        activeTab.setAttribute('tabindex', '0');
      }

      if (activePanel) {
        activePanel.classList.add(this.options.activeClass);
        activePanel.hidden = false;
      }

      // 現在のタブを更新
      this.currentTab = tabId;

      // ブラウザ履歴に追加
      if (this.options.enableHistory && triggerCallback) {
        const url = new URL(window.location);
        url.hash = tabId;
        window.history.pushState({ tabId }, '', url);
      }

      // コールバックを実行
      if (triggerCallback && typeof this.options.onChange === 'function') {
        this.options.onChange(tabId, previousTab);
      }
    }

    /**
     * 現在のアクティブタブIDを取得
     * @returns {string|null}
     */
    getCurrentTab() {
      return this.currentTab;
    }

    /**
     * タブを無効化
     * @param {string} tabId - タブID
     */
    disableTab(tabId) {
      const tab = this.tabs.find(t => t.getAttribute('data-tab') === tabId);
      if (tab) {
        tab.setAttribute('disabled', 'true');
        tab.setAttribute('aria-disabled', 'true');
        tab.style.pointerEvents = 'none';
        tab.style.opacity = '0.5';
      }
    }

    /**
     * タブを有効化
     * @param {string} tabId - タブID
     */
    enableTab(tabId) {
      const tab = this.tabs.find(t => t.getAttribute('data-tab') === tabId);
      if (tab) {
        tab.removeAttribute('disabled');
        tab.setAttribute('aria-disabled', 'false');
        tab.style.pointerEvents = '';
        tab.style.opacity = '';
      }
    }

    /**
     * イベントリスナーを削除してクリーンアップ
     */
    destroy() {
      // イベントリスナーを削除
      this.tabs.forEach((tab) => {
        tab.removeEventListener('click', this.boundHandlers.click);
      });

      if (this.options.enableKeyboard) {
        this.container.removeEventListener('keydown', this.boundHandlers.keydown);
      }

      if (this.options.enableHistory) {
        window.removeEventListener('popstate', this.boundHandlers.popstate);
      }

      // 参照をクリア
      this.tabs = [];
      this.panels = [];
      this.currentTab = null;
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.Tabs = Tabs;
  }

  // CommonJS/Node.js サポート（オプション）
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Tabs;
  }
})();
