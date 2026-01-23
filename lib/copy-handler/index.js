/**
 * CopyHandler クラス
 * クリップボードコピーとフラッシュアニメーションを管理するクラス
 *
 * 使用方法:
 * <script src="../lib/copy-handler/index.js"></script>
 * <script>
 *   const copyHandler = new CopyHandler({
 *     flashColor: "#ffeb3b",      // フラッシュアニメーションの色
 *     showCopyIcon: true,          // コピーアイコンを表示するか
 *     copyIconColor: "#007bff",    // コピーアイコンの色（nullの場合はCSS変数を使用）
 *     includeTh: false             // th要素をコピー対象にするか（デフォルト: false）
 *   });
 *   copyHandler.init();
 * </script>
 *
 * または、デフォルト設定で初期化:
 * <script>
 *   const copyHandler = new CopyHandler();
 *   copyHandler.init();
 * </script>
 *
 * 個別の機能のみ有効化する場合:
 * <script>
 *   const copyHandler = new CopyHandler();
 *   copyHandler.initCopyOnRightClick();  // 右クリックコピーのみ
 * </script>
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
      onCopySuccess: null,       // コピー成功時のコールバック
      showCopyIcon: true,        // コピーアイコンを表示するか
      copyIconColor: null        // コピーアイコンの色（nullの場合はCSS変数を使用）
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

  /**
   * コピーアイコンクリックでコピー機能を初期化
   * @param {Object} options - オプション設定
   */
  initCopyOnIconClick(options = {}) {
    const config = { ...this.#config, ...options };
    const {
      targetClassName = 'copyable',
      ignoreElements = ['input', 'textarea', 'button', 'select'],
      showCopyIcon = true
    } = config;

    // アイコンを表示しない場合は初期化しない
    if (!showCopyIcon) {
      console.log('[CopyHandler] Icon click copy disabled (showCopyIcon: false)');
      return;
    }

    document.addEventListener('click', (e) => {
      // 無視する要素の場合はスキップ
      if (ignoreElements.some((sel) => e.target.closest(sel))) return;

      // .copyable 要素を探す
      const el = e.target.closest(`.${targetClassName}`);
      if (!el) return;

      // クリック位置が ::after 疑似要素の範囲内かチェック
      const rect = el.getBoundingClientRect();
      const iconSize = 20;
      const iconPadding = 4;
      const iconRight = rect.right - iconPadding;
      const iconTop = rect.top + iconPadding;
      const iconLeft = iconRight - iconSize;
      const iconBottom = iconTop + iconSize;

      const clickX = e.clientX;
      const clickY = e.clientY;

      // アイコン領域内のクリックでない場合はスキップ
      if (clickX < iconLeft || clickX > iconRight || clickY < iconTop || clickY > iconBottom) {
        return;
      }

      // デフォルトの動作を防止
      e.preventDefault();
      e.stopPropagation();

      // テキストを取得してコピー
      const text = el.innerText?.trim() ?? "";
      if (!text) return;

      // copyWithFlash を呼び出す
      this.copyWithFlash(el, text, options);
    });

    console.log('[CopyHandler] Icon click copy initialized');
  }

  /**
   * コピーアイコンの表示/非表示を設定
   * @param {boolean} show - trueで表示、falseで非表示
   */
  setCopyIconVisibility(show) {
    const styleId = 'copy-handler-icon-visibility';
    let style = document.getElementById(styleId);

    if (!show) {
      // アイコンを非表示
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = '.copyable::after { display: none !important; }';

      // パディングクラスを削除
      document.querySelectorAll('.copyable').forEach(el => {
        el.classList.remove('copyable-with-icon');
      });
    } else {
      // アイコンを表示
      if (style) {
        style.remove();
      }

      // パディングクラスを追加
      document.querySelectorAll('.copyable').forEach(el => {
        el.classList.add('copyable-with-icon');
      });

      // アイコンの色を設定
      this.#setCopyIconColor(this.#config.copyIconColor);
    }
  }

  /**
   * コピーアイコンの色を設定
   * @private
   * @param {string|null} color - アイコンの色（nullの場合はCSS変数を使用）
   */
  #setCopyIconColor(color) {
    const styleId = 'copy-handler-icon-color';
    let style = document.getElementById(styleId);

    if (color) {
      // カスタムカラーを設定
      if (!style) {
        style = document.createElement('style');
        style.id = styleId;
        document.head.appendChild(style);
      }
      style.textContent = `.copyable::after { background-color: ${color} !important; }`;
    } else {
      // カスタムカラーを削除（CSS変数を使用）
      if (style) {
        style.remove();
      }
    }
  }

  /**
   * すべてのコピー機能を一括初期化
   * @param {Object} options - オプション設定（各初期化メソッドに渡される）
   */
  init(options = {}) {
    this.initCopyOnRightClick(options);
    this.initCopyOnIconClick(options);
    this.initCopyOnTableCellClick(options);
    this.setCopyIconVisibility(this.#config.showCopyIcon !== false);
    console.log('[CopyHandler] All copy features initialized');
  }

  /**
   * .copyable-table のセルクリックでコピー機能を初期化
   * @param {Object} options - オプション設定
   */
  initCopyOnTableCellClick(options = {}) {
    const config = { ...this.#config, ...options };
    const {
      tableClassName = 'copyable-table',
      copyOnLeftClick = false,
      copyOnMiddleClick = false,
      copyOnRightClick = true,
      includeTh = false  // thをコピー対象にするか（デフォルト: false）
    } = config;

    // セレクターを構築（includeTh の設定に基づく）
    const cellSelector = includeTh
      ? `.${tableClassName} th, .${tableClassName} td`
      : `.${tableClassName} td`;

    // 左クリック・中クリック対応
    if (copyOnLeftClick || copyOnMiddleClick) {
      document.addEventListener('mousedown', (e) => {
        // 左クリック（button: 0）または中クリック（button: 1）のチェック
        const isLeftClick = e.button === 0 && copyOnLeftClick;
        const isMiddleClick = e.button === 1 && copyOnMiddleClick;

        if (!isLeftClick && !isMiddleClick) return;

        // .copyable-table 内のセルを探す
        const cell = e.target.closest(cellSelector);
        if (!cell) return;

        // デフォルトの動作を防止
        e.preventDefault();
        e.stopPropagation();

        // テキストを取得してコピー
        const text = cell.innerText?.trim() ?? "";
        if (!text) return;

        // copyWithFlash を呼び出す
        this.copyWithFlash(cell, text, options);
      });

      console.log('[CopyHandler] Table cell click copy initialized (left/middle)');
    }

    // 右クリック対応
    if (copyOnRightClick) {
      document.addEventListener('contextmenu', (e) => {
        // .copyable-table 内のセルを探す
        const cell = e.target.closest(cellSelector);
        if (!cell) return;

        // デフォルトの動作を防止
        e.preventDefault();
        e.stopPropagation();

        // テキストを取得してコピー
        const text = cell.innerText?.trim() ?? "";
        if (!text) return;

        // copyWithFlash を呼び出す
        this.copyWithFlash(cell, text, options);
      });

      console.log('[CopyHandler] Table cell right-click copy initialized');
    }
  }
}
