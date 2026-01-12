/**
 * CopyHandler クラス
 * クリップボードコピーとフラッシュアニメーションを管理するクラス
 */
class CopyHandler {
  // 静的プロパティ: グローバルインスタンス
  static #globalInstance = null;

  // インスタンスプロパティ
  #config;
  #originalBackgrounds;
  #isInitialized;

  /**
   * コンストラクタ
   * @param {Object} config - 設定オブジェクト
   */
  constructor(config = {}) {
    this.#config = this.#mergeConfig(config);
    this.#originalBackgrounds = new WeakMap();
    this.#isInitialized = true;

    console.log('[CopyHandler] Instance created with config:', this.#config);
  }

  /**
   * デフォルト設定と引数の設定をマージ
   * @param {Object} config - カスタム設定
   * @returns {Object} - マージされた設定
   */
  #mergeConfig(config) {
    const defaultConfig = {
      flashColor: "#b4dfff",
      transitionClass: "copy-flash-transition",
      onCopySuccess: null  // コピー成功時のコールバック
    };

    return { ...defaultConfig, ...config };
  }

  /**
   * WeakMapから元の背景色を取得（初回は保存）
   * @param {HTMLElement} element - 対象要素
   * @returns {string} - 元の背景色
   */
  #getOriginalBackground(element) {
    if (!this.#originalBackgrounds.has(element)) {
      const bgColor = window.getComputedStyle(element).backgroundColor;
      this.#originalBackgrounds.set(element, bgColor);
    }
    return this.#originalBackgrounds.get(element);
  }

  /**
   * フラッシュアニメーションを実行（プライベート）
   * @param {HTMLElement} element - 対象要素
   * @param {string} flashColor - フラッシュカラー
   * @param {string} transitionClass - トランジションクラス名
   */
  #flashElement(element, flashColor, transitionClass) {
    const originalBg = this.#getOriginalBackground(element);

    // transition を一時的に削除
    element.classList.remove(transitionClass);

    // フラッシュカラーを即座に適用
    element.style.backgroundColor = flashColor;

    // 次のフレームで transition を復元して元の色に戻す
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        element.classList.add(transitionClass);
        element.style.backgroundColor = originalBg;
      });
    });
  }

  /**
   * テキストをクリップボードにコピー（静的メソッド）
   * @param {string} text - コピーするテキスト
   * @returns {Promise<void>}
   */
  static copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        document.body.removeChild(ta);
        ok ? resolve() : reject(new Error('execCommand failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * 新しいインスタンスを作成してグローバルに登録
   * @param {Object} config - 設定オブジェクト
   * @returns {CopyHandler} - 作成されたインスタンス
   */
  static createInstance(config = {}) {
    const instance = new CopyHandler(config);
    CopyHandler.#globalInstance = instance;
    return instance;
  }

  /**
   * グローバルインスタンスを取得
   * @returns {CopyHandler|null} - グローバルインスタンス
   */
  static getInstance() {
    return CopyHandler.#globalInstance;
  }

  /**
   * テキストをクリップボードにコピー（インスタンスメソッド）
   * @param {string} text - コピーするテキスト
   * @returns {Promise<void>}
   */
  copyText(text) {
    return CopyHandler.copyText(text);
  }

  /**
   * テキストをコピーしてフラッシュアニメーションを実行
   * @param {HTMLElement} element - フラッシュ対象の要素
   * @param {string} text - コピーするテキスト（省略時は element.innerText）
   * @param {Object} options - オプション（flashColor, transitionClass を上書き可能）
   * @returns {Promise<string>} - コピーしたテキスト
   */
  async copyWithFlash(element, text = null, options = {}) {
    // テキスト抽出（未指定時は element.innerText）
    const copyText = text ?? element.innerText?.trim() ?? "";
    if (!copyText) {
      throw new Error('No text to copy');
    }

    // 設定マージ（インスタンス設定 + メソッドオプション）
    const config = { ...this.#config, ...options };
    const { flashColor, transitionClass, onCopySuccess } = config;

    try {
      // コピー実行
      await CopyHandler.copyText(copyText);

      // フラッシュアニメーション
      this.#flashElement(element, flashColor, transitionClass);

      // コールバック実行
      if (typeof onCopySuccess === 'function') {
        onCopySuccess(copyText, element);
      }

      return copyText;
    } catch (err) {
      console.error('Copy with flash failed:', err);
      throw err;
    }
  }

  /**
   * フラッシュアニメーションのみを実行（コピーなし）
   * @param {HTMLElement} element - フラッシュ対象の要素
   * @param {Object} options - オプション（flashColor, transitionClass を上書き可能）
   */
  performFlash(element, options = {}) {
    const config = { ...this.#config, ...options };
    const { flashColor, transitionClass } = config;

    this.#flashElement(element, flashColor, transitionClass);
  }

  /**
   * 右クリックでコピー機能を初期化
   * @param {Object} options - オプション設定
   */
  initCopyOnRightClick(options = {}) {
    const config = { ...this.#config, ...options };
    const {
      targetClassName = 'copyable',
      ignoreElements = ['input', 'textarea', 'button', 'select']
    } = config;

    document.addEventListener('contextmenu', (e) => {
      // 無視する要素の場合はスキップ
      if (ignoreElements.some((sel) => e.target.closest(sel))) return;

      // .copyable 要素を探す
      const el = e.target.closest(`.${targetClassName}`);
      if (!el) return;

      // デフォルトの右クリックメニューを防止
      e.preventDefault();

      // テキストを取得してコピー
      const text = el.innerText?.trim() ?? "";
      if (!text) return;

      // copyWithFlash を呼び出す際は、onCopySuccess を含むインスタンス設定を使用
      // options で明示的に上書きされている場合のみ反映
      this.copyWithFlash(el, text, options);
    });

    console.log('[CopyHandler] Right-click copy initialized');
  }
}

// グローバルインスタンスの自動作成と右クリック機能の初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    const instance = CopyHandler.createInstance(window.COPY_HANDLER_CONFIG || {});
    instance.initCopyOnRightClick();
    console.log('[CopyHandler] Global instance created on DOMContentLoaded');
  });
} else {
  const instance = CopyHandler.createInstance(window.COPY_HANDLER_CONFIG || {});
  instance.initCopyOnRightClick();
  console.log('[CopyHandler] Global instance created immediately');
}
