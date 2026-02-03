/**
 * InputClear - テキストボックスに自動的にクリアボタンを追加するライブラリ
 *
 * 使用方法:
 *   HTML: <input type="text" class="clearable" placeholder="入力してください">
 *   JS:   new InputClear({ selector: '.clearable' });
 *
 * または data-clearable 属性を使用:
 *   HTML: <input type="text" data-clearable placeholder="入力してください">
 *   JS:   new InputClear();
 */
(function () {
  'use strict';

  /**
   * デフォルト設定
   */
  const DEFAULTS = {
    selector: '[data-clearable]',           // 対象セレクター
    buttonClass: 'input-clear-button',      // ボタンのクラス名
    wrapperClass: 'input-clear-wrapper',    // ラッパーのクラス名
    buttonHTML: '×',                        // ボタンの内容（HTML可）
    showOnFocus: false,                     // フォーカス時のみ表示
    showOnValue: true,                      // 値がある時のみ表示
    position: 'right',                      // ボタンの位置 ('right' | 'left')
    onClear: null,                          // クリア時のコールバック
    animation: true,                        // アニメーション有効化
  };

  /**
   * InputClear クラス
   */
  class InputClear {
    /**
     * @param {Object} options - 設定オプション
     * @param {string} options.selector - 対象のinput要素のセレクター
     * @param {string} options.buttonClass - クリアボタンのクラス名
     * @param {string} options.wrapperClass - ラッパー要素のクラス名
     * @param {string} options.buttonHTML - ボタンの内容
     * @param {boolean} options.showOnFocus - フォーカス時のみ表示
     * @param {boolean} options.showOnValue - 値がある時のみ表示
     * @param {string} options.position - ボタンの位置
     * @param {Function} options.onClear - クリア時のコールバック
     * @param {boolean} options.animation - アニメーション有効化
     */
    constructor(options = {}) {
      this.options = { ...DEFAULTS, ...options };
      this.instances = [];
      this.styleInjected = false;

      this._injectStyles();
      this._init();
    }

    /**
     * 初期化
     * @private
     */
    _init() {
      const inputs = document.querySelectorAll(this.options.selector);
      inputs.forEach(input => this._setupInput(input));
    }

    /**
     * 個別のinput要素にクリアボタンを追加
     * @private
     * @param {HTMLInputElement} input - 対象のinput要素
     */
    _setupInput(input) {
      // 既に設定済みの場合はスキップ
      if (input.dataset.inputClearInitialized === 'true') {
        return;
      }

      // text系のinputのみ対応
      const supportedTypes = ['text', 'search', 'tel', 'url', 'email', 'password'];
      if (!supportedTypes.includes(input.type)) {
        console.warn('InputClear: Unsupported input type:', input.type);
        return;
      }

      // ラッパー要素を作成
      const wrapper = document.createElement('div');
      wrapper.className = this.options.wrapperClass;

      // ボタン位置によるクラス追加
      if (this.options.position === 'left') {
        wrapper.classList.add('input-clear-left');
      }

      // inputをラッパーで囲む
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);

      // クリアボタンを作成
      const button = document.createElement('button');
      button.type = 'button';
      button.className = this.options.buttonClass;
      button.innerHTML = this.options.buttonHTML;
      button.setAttribute('aria-label', 'Clear input');
      button.tabIndex = -1; // タブ順序から除外

      // ボタンを追加
      wrapper.appendChild(button);

      // イベントリスナーを設定
      const instance = {
        input,
        button,
        wrapper,
        listeners: {}
      };

      instance.listeners.buttonClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._clearInput(input, button);
      };

      instance.listeners.inputChange = () => {
        this._updateButtonVisibility(input, button);
      };

      instance.listeners.inputFocus = () => {
        if (this.options.showOnFocus) {
          wrapper.classList.add('input-clear-focused');
          this._updateButtonVisibility(input, button);
        }
      };

      instance.listeners.inputBlur = () => {
        if (this.options.showOnFocus) {
          wrapper.classList.remove('input-clear-focused');
          this._updateButtonVisibility(input, button);
        }
      };

      button.addEventListener('click', instance.listeners.buttonClick);
      input.addEventListener('input', instance.listeners.inputChange);
      input.addEventListener('change', instance.listeners.inputChange);

      if (this.options.showOnFocus) {
        input.addEventListener('focus', instance.listeners.inputFocus);
        input.addEventListener('blur', instance.listeners.inputBlur);
      }

      // 初期状態を設定
      this._updateButtonVisibility(input, button);

      // マーク済みにする
      input.dataset.inputClearInitialized = 'true';

      // インスタンスを保存
      this.instances.push(instance);
    }

    /**
     * input要素の値をクリア
     * @private
     * @param {HTMLInputElement} input - 対象のinput要素
     * @param {HTMLButtonElement} button - クリアボタン
     */
    _clearInput(input, button) {
      const oldValue = input.value;
      input.value = '';

      // inputイベントを発火（他のライブラリとの互換性のため）
      const inputEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(inputEvent);

      const changeEvent = new Event('change', { bubbles: true });
      input.dispatchEvent(changeEvent);

      // カスタムイベントを発火
      const clearEvent = new CustomEvent('inputclear', {
        bubbles: true,
        detail: { oldValue }
      });
      input.dispatchEvent(clearEvent);

      // コールバックを実行
      if (typeof this.options.onClear === 'function') {
        this.options.onClear(input, oldValue);
      }

      // ボタンの表示を更新
      this._updateButtonVisibility(input, button);

      // フォーカスを戻す
      input.focus();
    }

    /**
     * クリアボタンの表示/非表示を更新
     * @private
     * @param {HTMLInputElement} input - 対象のinput要素
     * @param {HTMLButtonElement} button - クリアボタン
     */
    _updateButtonVisibility(input, button) {
      const hasValue = input.value.length > 0;
      const isFocused = document.activeElement === input;

      let shouldShow = false;

      if (this.options.showOnValue && hasValue) {
        if (this.options.showOnFocus) {
          shouldShow = isFocused;
        } else {
          shouldShow = true;
        }
      }

      if (shouldShow) {
        button.classList.add('visible');
      } else {
        button.classList.remove('visible');
      }
    }

    /**
     * スタイルを注入
     * @private
     */
    _injectStyles() {
      if (this.styleInjected) return;

      const style = document.createElement('style');
      style.textContent = `
        .${this.options.wrapperClass} {
          position: relative;
          display: inline-block;
          width: 100%;
        }

        .${this.options.wrapperClass} input {
          width: 100%;
          padding-right: 2.5em;
        }

        .${this.options.wrapperClass}.input-clear-left input {
          padding-right: 0.5em;
          padding-left: 2.5em;
        }

        .${this.options.buttonClass} {
          position: absolute;
          top: 50%;
          right: 0.5em;
          transform: translateY(-50%);
          background: transparent;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
          line-height: 1;
          padding: 0.25em 0.5em;
          color: #999;
          opacity: 0;
          visibility: hidden;
          transition: ${this.options.animation ? 'opacity 0.2s, visibility 0.2s' : 'none'};
          z-index: 1;
        }

        .${this.options.wrapperClass}.input-clear-left .${this.options.buttonClass} {
          right: auto;
          left: 0.5em;
        }

        .${this.options.buttonClass}.visible {
          opacity: 1;
          visibility: visible;
        }

        .${this.options.buttonClass}:hover {
          color: #333;
        }

        .${this.options.buttonClass}:focus {
          outline: 2px solid #007bff;
          outline-offset: 2px;
        }

        .${this.options.buttonClass}:active {
          color: #000;
        }
      `;

      document.head.appendChild(style);
      this.styleInjected = true;
    }

    /**
     * 新しいinput要素を動的に追加
     * @public
     * @param {HTMLInputElement|string} input - input要素またはセレクター
     */
    add(input) {
      if (typeof input === 'string') {
        const elements = document.querySelectorAll(input);
        elements.forEach(el => this._setupInput(el));
      } else if (input instanceof HTMLInputElement) {
        this._setupInput(input);
      }
    }

    /**
     * 特定のinput要素のクリアボタンを削除
     * @public
     * @param {HTMLInputElement} input - 対象のinput要素
     */
    remove(input) {
      const index = this.instances.findIndex(inst => inst.input === input);
      if (index === -1) return;

      const instance = this.instances[index];

      // イベントリスナーを削除
      instance.button.removeEventListener('click', instance.listeners.buttonClick);
      instance.input.removeEventListener('input', instance.listeners.inputChange);
      instance.input.removeEventListener('change', instance.listeners.inputChange);

      if (this.options.showOnFocus) {
        instance.input.removeEventListener('focus', instance.listeners.inputFocus);
        instance.input.removeEventListener('blur', instance.listeners.inputBlur);
      }

      // ラッパーを削除してinputを元に戻す
      const parent = instance.wrapper.parentNode;
      parent.insertBefore(instance.input, instance.wrapper);
      parent.removeChild(instance.wrapper);

      // マークを削除
      delete instance.input.dataset.inputClearInitialized;

      // インスタンスリストから削除
      this.instances.splice(index, 1);
    }

    /**
     * すべてのクリアボタンを削除して破棄
     * @public
     */
    destroy() {
      // すべてのインスタンスを削除（逆順で）
      for (let i = this.instances.length - 1; i >= 0; i--) {
        this.remove(this.instances[i].input);
      }
    }

    /**
     * 設定を更新
     * @public
     * @param {Object} options - 新しい設定
     */
    updateOptions(options) {
      this.options = { ...this.options, ...options };

      // 既存のインスタンスを再初期化
      const inputs = this.instances.map(inst => inst.input);
      this.destroy();
      inputs.forEach(input => this._setupInput(input));
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.InputClear = InputClear;
  }

  // CommonJS/Node.js対応
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = InputClear;
  }
})();
