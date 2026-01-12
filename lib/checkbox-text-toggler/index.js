/**
 * Form Text Toggler
 * フォーム要素（checkbox, select, input等）の状態に応じて、指定したクラスの要素のテキストを切り替えます
 *
 * 使用方法:
 * <script src="../lib/checkbox-text-toggler/index.js"></script>
 *
 * HTML例:
 *
 * チェックボックス:
 * <input type="checkbox"
 *        data-target-class="status-text"
 *        data-true-value="済"
 *        data-false-value="未" />
 * <span class="status-text">未</span>
 *
 * セレクトボックス:
 * <select data-target-class="bui-text">
 *   <option value="">選択してください</option>
 *   <option value="便座のひび">便座のひび</option>
 * </select>
 * <span class="bui-text"></span>
 *
 * テキスト入力:
 * <input type="text"
 *        data-target-class="bui-text"
 *        placeholder="自由に入力" />
 * <span class="bui-text"></span>
 */

(function () {
  "use strict";

  class FormTextToggler {
    constructor(options = {}) {
      this.options = {
        checkboxSelector: 'input[type="checkbox"][data-target-class]',
        selectSelector: 'select[data-target-class]',
        inputSelector: 'input[data-target-class]:not([type="checkbox"])',
        trueValueAttr: "data-true-value",
        falseValueAttr: "data-false-value",
        targetClassAttr: "data-target-class",
        defaultTrueValue: "済",
        defaultFalseValue: "未",
        ...options,
      };

      this.elements = [];
      this.cleanupFns = [];
    }

    /**
     * 初期化
     * @param {HTMLElement|Document} root - 検索のルート要素（デフォルト: document）
     */
    init(root = document) {
      this.cleanup();

      // チェックボックスを検索
      const checkboxes = Array.from(
        root.querySelectorAll(this.options.checkboxSelector)
      );

      // セレクトボックスを検索
      const selects = Array.from(
        root.querySelectorAll(this.options.selectSelector)
      );

      // テキスト入力を検索（checkbox以外のinput）
      const inputs = Array.from(
        root.querySelectorAll(this.options.inputSelector)
      );

      this.elements = [...checkboxes, ...selects, ...inputs];

      this.elements.forEach((element) => {
        this._setupElement(element);
      });

      this._updateAllTargets();

      console.log(
        `[FormTextToggler] Initialized ${checkboxes.length} checkboxes, ${selects.length} selects, ${inputs.length} inputs`
      );
    }

    /**
     * 個別の要素をセットアップ
     * @private
     */
    _setupElement(element) {
      const targetClass = element.getAttribute(this.options.targetClassAttr);

      if (!targetClass) {
        console.warn("[FormTextToggler] Missing target class:", element);
        return;
      }

      const handler = () => this._handleChange(element);

      // checkboxとselectは"change"イベント、inputは"input"イベントも追加
      if (element.tagName === "INPUT" && element.type !== "checkbox") {
        element.addEventListener("input", handler);
        this.cleanupFns.push(() => {
          element.removeEventListener("input", handler);
        });
      }

      element.addEventListener("change", handler);

      this.cleanupFns.push(() => {
        element.removeEventListener("change", handler);
      });
    }

    /**
     * 要素の変更を処理
     * @private
     */
    _handleChange(element) {
      const targetClass = element.getAttribute(this.options.targetClassAttr);
      let newValue;

      if (element.tagName === "SELECT") {
        // selectの場合は選択されたvalueを使用
        newValue = element.value;
      } else if (element.type === "checkbox") {
        // checkboxの場合はtrue/false値を使用
        const trueValue =
          element.getAttribute(this.options.trueValueAttr) ||
          this.options.defaultTrueValue;
        const falseValue =
          element.getAttribute(this.options.falseValueAttr) ||
          this.options.defaultFalseValue;

        newValue = element.checked ? trueValue : falseValue;
      } else {
        // その他のinput要素の場合はvalueを使用
        newValue = element.value;
      }

      this._updateTargets(targetClass, newValue);
    }

    /**
     * 指定したクラスの全要素を更新
     * @private
     */
    _updateTargets(targetClass, value) {
      const targets = document.querySelectorAll(`.${targetClass}`);

      targets.forEach((target) => {
        target.textContent = value;
      });

      if (targets.length === 0) {
        console.warn(
          `[FormTextToggler] No targets found for class: ${targetClass}`
        );
      }
    }

    /**
     * 全要素の状態を反映
     * @private
     */
    _updateAllTargets() {
      this.elements.forEach((element) => {
        this._handleChange(element);
      });
    }

    /**
     * 特定の要素を手動で更新
     * @param {string} id - 要素のID
     * @param {boolean|string} value - 設定する値（checkboxの場合はboolean、selectの場合はstring）
     */
    setElementValue(id, value) {
      const element = document.getElementById(id);
      if (element) {
        if (element.type === "checkbox") {
          element.checked = value;
        } else {
          element.value = value;
        }
        this._handleChange(element);
      } else {
        console.warn(`[FormTextToggler] Element not found: ${id}`);
      }
    }

    /**
     * プログラムから対象要素を更新
     * @param {string} targetClass - 対象のクラス名
     * @param {string} value - 設定する値
     */
    updateTargets(targetClass, value) {
      this._updateTargets(targetClass, value);
    }

    /**
     * クリーンアップ（イベントリスナーの削除）
     */
    cleanup() {
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];
      this.elements = [];
    }

    /**
     * 新しい要素を動的に追加
     * @param {HTMLElement} element - 追加する要素
     */
    addElement(element) {
      if (!this.elements.includes(element)) {
        this.elements.push(element);
        this._setupElement(element);
        this._handleChange(element);
      }
    }

    /**
     * 要素を削除
     * @param {HTMLElement} element - 削除する要素
     */
    removeElement(element) {
      const index = this.elements.indexOf(element);
      if (index > -1) {
        this.elements.splice(index, 1);
      }
    }
  }

  // グローバルに公開（後方互換性のため両方公開）
  window.FormTextToggler = FormTextToggler;
  window.CheckboxTextToggler = FormTextToggler; // 旧名称でもアクセス可能

  // 自動初期化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!window.__checkboxTextToggler) {
        window.__checkboxTextToggler = new FormTextToggler();
        window.__checkboxTextToggler.init();
      }
    });
  } else {
    if (!window.__checkboxTextToggler) {
      window.__checkboxTextToggler = new FormTextToggler();
      window.__checkboxTextToggler.init();
    }
  }
})();
