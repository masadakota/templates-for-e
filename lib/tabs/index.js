/**
 * Tabs - シンプルなタブ切り替えライブラリ
 * file://プロトコル対応 - IIFE パターン
 *
 * @example
 * const tabs = new Tabs({
 *   tabsList: '#my-tabs',
 *   defaultValue: 'tab1',
 *   onValueChange: (value) => console.log('Changed to:', value)
 * });
 */
(function () {
  "use strict";

  class Tabs {
    /**
     * @param {Object} options - 設定オプション
     * @param {string|HTMLElement} options.tabsList - TabsListコンテナのセレクタまたは要素
     * @param {string} [options.defaultValue] - 初期表示するタブの値
     * @param {Function} [options.onValueChange] - タブ変更時のコールバック
     * @param {string} [options.triggerSelector] - TabsTriggerのセレクタ (default: '.tabs-trigger')
     * @param {string} [options.contentSelector] - TabsContentのセレクタ (default: '.tabs-content')
     * @param {string} [options.activeClass] - アクティブ時のクラス名 (default: 'active')
     * @param {string} [options.variant] - タブのスタイルバリアント (default: 'default', 'pills', 'underline')
     * @param {boolean} [options.enableKeyboard] - キーボード操作を有効化 (default: true)
     * @param {boolean} [options.enableHistory] - ブラウザ履歴との連携 (default: false)
     * @param {string} [options.activeColor] - アクティブなタブの文字色 (default: null)
     * @param {string} [options.activeBgColor] - アクティブなタブの背景色 (default: null)
     * @param {string} [options.activeBorderColor] - アクティブなタブのボーダー色 (default: null)
     */
    constructor(options = {}) {
      // 設定のデフォルト値
      this.options = {
        tabsList: null,
        defaultValue: null,
        onValueChange: null,
        triggerSelector: ".tabs-trigger",
        contentSelector: ".tabs-content",
        activeClass: "active",
        variant: "default",
        enableKeyboard: true,
        enableHistory: false,
        activeColor: null,
        activeBgColor: null,
        activeBorderColor: null,
        ...options,
      };

      // TabsListコンテナ要素を取得
      this.tabsList =
        typeof this.options.tabsList === "string"
          ? document.querySelector(this.options.tabsList)
          : this.options.tabsList;

      if (!this.tabsList) {
        throw new Error("Tabs: tabsList not found");
      }

      // グループIDを決定（tabsListのIDまたは自動生成）
      this.groupId = this.tabsList.id || `tabs-${Math.random().toString(36).substring(2, 11)}`;

      // IDが自動生成された場合はtabsListに設定
      if (!this.tabsList.id) {
        this.tabsList.id = this.groupId;
      }

      // バリアントに応じたクラスを追加
      this._applyVariant();

      // トリガー要素を取得（tabsList内から検索）
      this.triggers = Array.from(
        this.tabsList.querySelectorAll(this.options.triggerSelector),
      );

      // コンテンツ要素を取得（同じgroupIdのもののみ）
      this.contents = Array.from(
        document.querySelectorAll(
          `${this.options.contentSelector}[data-tabs-id="${this.groupId}"]`
        ),
      );

      if (this.triggers.length === 0) {
        throw new Error("Tabs: no triggers found");
      }

      // 現在のアクティブな値
      this.currentValue = null;

      // イベントリスナーの参照を保持（クリーンアップ用）
      this.boundHandlers = {
        click: this._handleTriggerClick.bind(this),
        keydown: this._handleKeyDown.bind(this),
        popstate: this._handlePopState.bind(this),
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

      // 初期表示する値を決定
      let initialValue = this._getInitialValue();

      // デフォルト値が指定されていない場合は最初のトリガー
      if (!initialValue && this.triggers.length > 0) {
        initialValue = this.triggers[0].getAttribute("data-tabs-value");
      }

      // 初期値を表示
      if (initialValue) {
        this.setValue(initialValue, false); // 初期表示はコールバックを呼ばない
      }
    }

    /**
     * バリアントに応じたクラスを適用
     * @private
     */
    _applyVariant() {
      // 既存のバリアントクラスを削除
      this.tabsList.classList.remove("tabs-variant-default", "tabs-variant-pills", "tabs-variant-underline");

      // 新しいバリアントクラスを追加
      const variantClass = `tabs-variant-${this.options.variant}`;
      this.tabsList.classList.add(variantClass);
    }

    /**
     * アクセシビリティ属性を設定
     * @private
     */
    _setupAccessibility() {
      // タブリストコンテナにrole="tablist"を設定
      this.tabsList.setAttribute("role", "tablist");
      this.tabsList.setAttribute("aria-label", "タブリスト");

      // トリガーにrole="tab"を設定
      this.triggers.forEach((trigger) => {
        const value = trigger.getAttribute("data-tabs-value");

        trigger.setAttribute("role", "tab");
        trigger.setAttribute("aria-controls", `panel-${value}`);
        trigger.setAttribute("aria-selected", "false");
        trigger.setAttribute("tabindex", "-1");

        if (!trigger.id) {
          trigger.id = `tab-${value}`;
        }
      });

      // コンテンツにrole="tabpanel"を設定
      this.contents.forEach((content) => {
        const value = content.getAttribute("data-tabs-value");

        content.setAttribute("role", "tabpanel");
        content.setAttribute("aria-labelledby", `tab-${value}`);
        content.setAttribute("tabindex", "0");
        content.hidden = true;

        if (!content.id) {
          content.id = `panel-${value}`;
        }
      });
    }

    /**
     * イベントリスナーを設定
     * @private
     */
    _setupEventListeners() {
      // トリガークリックイベント
      this.triggers.forEach((trigger) => {
        trigger.addEventListener("click", this.boundHandlers.click);
      });

      // キーボード操作
      if (this.options.enableKeyboard) {
        this.tabsList.addEventListener("keydown", this.boundHandlers.keydown);
      }

      // ブラウザ履歴との連携
      if (this.options.enableHistory) {
        window.addEventListener("popstate", this.boundHandlers.popstate);
      }
    }

    /**
     * 初期表示する値を決定
     * @private
     * @returns {string|null} 値
     */
    _getInitialValue() {
      // URL のハッシュをチェック
      if (this.options.enableHistory && window.location.hash) {
        const hashValue = window.location.hash.substring(1);
        if (this._isValidValue(hashValue)) {
          return hashValue;
        }
      }

      // デフォルト値
      if (
        this.options.defaultValue &&
        this._isValidValue(this.options.defaultValue)
      ) {
        return this.options.defaultValue;
      }

      return null;
    }

    /**
     * 値が有効かチェック
     * @private
     * @param {string} value - 値
     * @returns {boolean}
     */
    _isValidValue(value) {
      return this.triggers.some(
        (trigger) => trigger.getAttribute("data-tabs-value") === value,
      );
    }

    /**
     * トリガークリックハンドラー
     * @private
     * @param {Event} event - クリックイベント
     */
    _handleTriggerClick(event) {
      const trigger = event.currentTarget;
      const value = trigger.getAttribute("data-tabs-value");

      if (value) {
        this.setValue(value);
      }
    }

    /**
     * キーボード操作ハンドラー
     * @private
     * @param {KeyboardEvent} event - キーボードイベント
     */
    _handleKeyDown(event) {
      const target = event.target;

      // トリガー上でのキーボード操作のみ処理
      if (!target.hasAttribute("data-tabs-value")) {
        return;
      }

      const currentIndex = this.triggers.indexOf(target);
      let nextIndex = -1;

      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
          event.preventDefault();
          nextIndex = (currentIndex + 1) % this.triggers.length;
          break;

        case "ArrowLeft":
        case "ArrowUp":
          event.preventDefault();
          nextIndex =
            (currentIndex - 1 + this.triggers.length) % this.triggers.length;
          break;

        case "Home":
          event.preventDefault();
          nextIndex = 0;
          break;

        case "End":
          event.preventDefault();
          nextIndex = this.triggers.length - 1;
          break;

        default:
          return;
      }

      if (nextIndex !== -1) {
        const nextTrigger = this.triggers[nextIndex];
        const nextValue = nextTrigger.getAttribute("data-tabs-value");
        this.setValue(nextValue);
        nextTrigger.focus();
      }
    }

    /**
     * ブラウザ履歴の戻る/進むハンドラー
     * @private
     * @param {PopStateEvent} event - popstateイベント
     */
    _handlePopState(event) {
      if (event.state && event.state.value) {
        this.setValue(event.state.value, false); // コールバックは呼ばない
      }
    }

    /**
     * 値を設定してコンテンツを表示
     * @param {string} value - 表示する値
     * @param {boolean} [triggerCallback=true] - onValueChangeコールバックを実行するか
     */
    setValue(value, triggerCallback = true) {
      if (!this._isValidValue(value)) {
        console.warn(`Tabs: invalid value "${value}"`);
        return;
      }

      // すでに表示中の場合は何もしない
      if (this.currentValue === value) {
        return;
      }

      const previousValue = this.currentValue;

      // すべてのトリガーを非アクティブ化
      this.triggers.forEach((trigger) => {
        trigger.classList.remove(this.options.activeClass);
        trigger.setAttribute("aria-selected", "false");
        trigger.setAttribute("tabindex", "-1");

        // カスタムカラーをリセット
        if (this.options.activeColor) {
          trigger.style.color = "";
        }
        if (this.options.activeBgColor) {
          trigger.style.backgroundColor = "";
        }
        if (this.options.activeBorderColor) {
          trigger.style.borderColor = "";
          trigger.style.borderBottomColor = "";
        }
      });

      // すべてのコンテンツを非表示
      this.contents.forEach((content) => {
        content.classList.remove(this.options.activeClass);
        content.hidden = true;
      });

      // 指定された値に対応するトリガーとコンテンツをアクティブ化
      const activeTrigger = this.triggers.find(
        (trigger) => trigger.getAttribute("data-tabs-value") === value,
      );
      const activeContent = this.contents.find(
        (content) => content.getAttribute("data-tabs-value") === value,
      );

      if (activeTrigger) {
        activeTrigger.classList.add(this.options.activeClass);
        activeTrigger.setAttribute("aria-selected", "true");
        activeTrigger.setAttribute("tabindex", "0");

        // カスタムカラーを適用
        if (this.options.activeColor) {
          activeTrigger.style.color = this.options.activeColor;
        }
        if (this.options.activeBgColor) {
          activeTrigger.style.backgroundColor = this.options.activeBgColor;
        }
        if (this.options.activeBorderColor) {
          // pillsバリアントの場合はborderColor全体、それ以外はborderBottomColorを設定
          if (this.options.variant === "pills") {
            activeTrigger.style.borderColor = this.options.activeBorderColor;
          } else {
            activeTrigger.style.borderBottomColor =
              this.options.activeBorderColor;
          }
        }
      }

      if (activeContent) {
        activeContent.classList.add(this.options.activeClass);
        activeContent.hidden = false;
      }

      // 現在の値を更新
      this.currentValue = value;

      // ブラウザ履歴に追加
      if (this.options.enableHistory && triggerCallback) {
        const url = new URL(window.location);
        url.hash = value;
        window.history.pushState({ value }, "", url);
      }

      // コールバックを実行
      if (triggerCallback && typeof this.options.onValueChange === "function") {
        this.options.onValueChange(value, previousValue);
      }
    }

    /**
     * 現在のアクティブな値を取得
     * @returns {string|null}
     */
    getValue() {
      return this.currentValue;
    }

    /**
     * トリガーを無効化
     * @param {string} value - 値
     */
    disableTrigger(value) {
      const trigger = this.triggers.find(
        (t) => t.getAttribute("data-tabs-value") === value,
      );
      if (trigger) {
        trigger.setAttribute("disabled", "true");
        trigger.setAttribute("aria-disabled", "true");
        trigger.style.pointerEvents = "none";
        trigger.style.opacity = "0.5";
      }
    }

    /**
     * トリガーを有効化
     * @param {string} value - 値
     */
    enableTrigger(value) {
      const trigger = this.triggers.find(
        (t) => t.getAttribute("data-tabs-value") === value,
      );
      if (trigger) {
        trigger.removeAttribute("disabled");
        trigger.setAttribute("aria-disabled", "false");
        trigger.style.pointerEvents = "";
        trigger.style.opacity = "";
      }
    }

    /**
     * イベントリスナーを削除してクリーンアップ
     */
    destroy() {
      // イベントリスナーを削除
      this.triggers.forEach((trigger) => {
        trigger.removeEventListener("click", this.boundHandlers.click);
      });

      if (this.options.enableKeyboard) {
        this.tabsList.removeEventListener(
          "keydown",
          this.boundHandlers.keydown,
        );
      }

      if (this.options.enableHistory) {
        window.removeEventListener("popstate", this.boundHandlers.popstate);
      }

      // 参照をクリア
      this.triggers = [];
      this.contents = [];
      this.currentValue = null;
    }
  }

  // グローバルスコープに公開
  if (typeof window !== "undefined") {
    window.Tabs = Tabs;
  }

  // CommonJS/Node.js サポート（オプション）
  if (typeof module !== "undefined" && module.exports) {
    module.exports = Tabs;
  }
})();
