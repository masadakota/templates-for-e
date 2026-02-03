/**
 * Form Binder
 * フォーム要素（checkbox, select, input等）の状態をターゲット要素にバインド（結び付け）します
 *
 * 基本的な使用方法:
 * <script src="../lib/form-binder/index.js"></script>
 * <script>
 *   const formBinder = new FormBinder();  // 自動的に初期化されます
 * </script>
 *
 * カスタムオプション:
 * <script>
 *   const formBinder = new FormBinder({
 *     defaultTrueValue: "✓",
 *     defaultFalseValue: "✗",
 *     autoInit: false,  // 自動初期化を無効化（必要に応じて）
 *     root: document.querySelector('#my-form')  // 特定の要素内のみを対象
 *   });
 *
 *   // autoInit: false の場合は手動で初期化
 *   formBinder.init();
 * </script>
 *
 * HTML例:
 *
 * チェックボックス（IDターゲット）:
 * <input type="checkbox"
 *        data-fb-target="#status-result"
 *        data-true-value="完了"
 *        data-false-value="未完了" />
 * <span id="status-result">未完了</span>
 *
 * チェックボックス（クラスターゲット）:
 * <input type="checkbox"
 *        data-fb-target=".status-text"
 *        data-true-value="済"
 *        data-false-value="未" />
 * <span class="status-text">未</span>
 *
 * 複数のターゲットを指定:
 * <input type="checkbox"
 *        data-fb-target=".delay-notice, .delay-notice-for-taishogai"
 *        data-true-value="年末年始トーク"
 *        data-priority="1" />
 * <span class="delay-notice"></span>
 * <span class="delay-notice-for-taishogai"></span>
 *
 * 優先度付きチェックボックス（同じターゲットを持つ複数要素）:
 * <input type="checkbox"
 *        data-fb-target=".delay-notice"
 *        data-true-value="通常よりお日にちがかかる可能性案内"
 *        data-priority="1" />
 * <input type="checkbox"
 *        data-fb-target=".delay-notice"
 *        data-true-value="年末年始トーク"
 *        data-priority="2" />
 * <span class="delay-notice"></span>
 * ※ 複数チェックされた場合、data-priorityの値が小さい方（優先度が高い）が反映されます
 * ※ data-priorityが未指定の場合は999として扱われます
 *
 * セレクトボックス:
 * <select data-fb-target=".bui-text">
 *   <option value="">選択してください</option>
 *   <option value="便座のひび">便座のひび</option>
 * </select>
 * <span class="bui-text"></span>
 *
 * テキスト入力:
 * <input type="text"
 *        data-fb-target=".bui-text"
 *        placeholder="自由に入力" />
 * <span class="bui-text"></span>
 *
 * ラジオボタン:
 * <input type="radio"
 *        name="payment-type"
 *        value="有償"
 *        data-fb-target="#payment-status" />
 * <input type="radio"
 *        name="payment-type"
 *        value="無償"
 *        data-fb-target="#payment-status" />
 * <span id="payment-status"></span>
 * ※ チェックされたラジオボタンのvalue値が反映されます
 *
 * 複雑なセレクタ:
 * <input type="checkbox"
 *        data-fb-target="div.container > .result, #backup-result"
 *        data-true-value="完了" />
 * <div class="container">
 *   <span class="result"></span>
 * </div>
 * <span id="backup-result"></span>
 *
 * value属性を持つ要素（HTMLを含む）:
 * <button data-fb-target="#result"
 *         value="<strong>重要</strong>なメッセージ">
 *   クリック
 * </button>
 * <div id="result"></div>
 * ※ value属性の値がターゲット要素のinnerHTMLに設定されます
 */

(function () {
  "use strict";

  class FormBinder {
    constructor(options = {}) {
      this.options = {
        checkboxSelector: 'input[type="checkbox"][data-fb-target]',
        selectSelector: 'select[data-fb-target]',
        inputSelector: 'input[data-fb-target]:not([type="checkbox"])',
        // value属性を持つ要素（button, その他の要素）
        valueSelector: '[value][data-fb-target]:not(input):not(select):not(option)',
        trueValueAttr: "data-true-value",
        falseValueAttr: "data-false-value",
        targetAttr: "data-fb-target",
        priorityAttr: "data-priority",
        defaultTrueValue: "true",
        defaultFalseValue: "false",
        autoInit: true,  // 自動初期化を有効化（デフォルト）
        root: document,  // 検索のルート要素
        ...options,
      };

      this.elements = [];
      this.cleanupFns = [];
      // ターゲットセレクタごとに元のHTMLを保存するMap
      this.originalContents = new Map();

      // 自動初期化（オプションで無効化可能）
      if (this.options.autoInit) {
        this.init(this.options.root);
      }
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

      // value属性を持つ要素を検索（button等）
      const valueElements = Array.from(
        root.querySelectorAll(this.options.valueSelector)
      );

      this.elements = [...checkboxes, ...selects, ...inputs, ...valueElements];

      this.elements.forEach((element) => {
        this._setupElement(element);
      });

      this._updateAllTargets();

      console.log(
        `[FormBinder] Initialized ${checkboxes.length} checkboxes, ${selects.length} selects, ${inputs.length} inputs, ${valueElements.length} value elements`
      );
    }

    /**
     * 要素からターゲットセレクタを取得
     * @private
     * @returns {string|null} ターゲットセレクタ
     */
    _getTargetSelector(element) {
      return element.getAttribute(this.options.targetAttr);
    }

    /**
     * 個別の要素をセットアップ
     * @private
     */
    _setupElement(element) {
      const targetSelector = this._getTargetSelector(element);

      if (!targetSelector) {
        console.warn("[FormBinder] Missing data-fb-target:", element);
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
      const targetSelector = this._getTargetSelector(element);

      if (targetSelector) {
        this._updateTargetsWithPriority(targetSelector);
      }
    }

    /**
     * 優先度を考慮してターゲットを更新
     * @private
     */
    _updateTargetsWithPriority(targetSelector) {
      // 同じtargetSelectorを持つ全要素を取得
      const elementsWithSameTarget = this.elements.filter((el) => {
        return this._getTargetSelector(el) === targetSelector;
      });

      if (elementsWithSameTarget.length === 0) {
        return;
      }

      // 各要素の値と優先度を取得
      const candidates = elementsWithSameTarget.map((element) => {
        const priority = parseInt(
          element.getAttribute(this.options.priorityAttr) || "999",
          10
        );
        let value = null;
        let isActive = false;

        if (element.tagName === "SELECT") {
          value = element.value;
          isActive = value !== "" && value !== null && value !== undefined;
        } else if (element.type === "checkbox") {
          isActive = element.checked;
          if (isActive) {
            value =
              element.getAttribute(this.options.trueValueAttr) ||
              this.options.defaultTrueValue;
          } else {
            // data-false-valueが明示的に設定されている場合のみ使用
            const falseValueAttr = element.getAttribute(this.options.falseValueAttr);
            if (falseValueAttr !== null) {
              value = falseValueAttr;
            } else {
              // data-false-valueが省略されている場合は空文字（元のテキストを保持）
              value = "";
            }
          }
        } else if (element.type === "radio") {
          // ラジオボタンはチェックされている場合のみアクティブ
          isActive = element.checked;
          if (isActive) {
            value = element.value;
          } else {
            value = "";
          }
        } else if (element.tagName === "INPUT") {
          // テキスト入力など、その他のinput要素
          value = element.value;
          isActive = value !== "" && value !== null && value !== undefined;
        } else {
          // value属性を持つその他の要素（button等）
          const valueAttr = element.getAttribute("value");
          if (valueAttr !== null) {
            value = valueAttr;
            isActive = true; // value属性を持つ要素は常にアクティブ
          }
        }

        return { element, priority, value, isActive };
      });

      // チェックされている（アクティブな）要素の中で最も優先度が高いものを選択
      const activeCandidates = candidates.filter((c) => c.isActive);

      let selectedValue = null;

      if (activeCandidates.length > 0) {
        // 優先度が最も高い（数値が小さい）ものを選択
        activeCandidates.sort((a, b) => a.priority - b.priority);
        selectedValue = activeCandidates[0].value;
      } else {
        // アクティブな要素がない場合は空文字（元のテキストを保持）
        selectedValue = "";
      }

      // ターゲット要素を更新
      this._updateTargets(targetSelector, selectedValue);
    }

    /**
     * 指定したセレクタの全要素を更新
     * @private
     * @param {string} targetSelector - ターゲットセレクタ
     * @param {string} value - 設定する値
     */
    _updateTargets(targetSelector, value) {
      try {
        const targets = document.querySelectorAll(targetSelector);

        targets.forEach((target) => {
          // 元のHTMLを保存（初回のみ）
          if (!this.originalContents.has(targetSelector)) {
            this.originalContents.set(targetSelector, target.innerHTML);
          }

          // 空白の場合は元のHTMLを表示
          if (value === "" || value === null || value === undefined) {
            target.innerHTML = this.originalContents.get(targetSelector) || "";
          } else {
            target.innerHTML = value;
          }
        });

        if (targets.length === 0) {
          console.warn(
            `[FormBinder] No targets found for selector: ${targetSelector}`
          );
        }
      } catch (error) {
        console.error(
          `[FormBinder] Invalid selector: ${targetSelector}`,
          error
        );
      }
    }

    /**
     * 全要素の状態を反映
     * @private
     */
    _updateAllTargets() {
      // 全てのユニークなtargetSelectorを取得
      const uniqueTargetSelectors = new Set();

      this.elements.forEach((el) => {
        const targetSelector = this._getTargetSelector(el);
        if (targetSelector) {
          uniqueTargetSelectors.add(targetSelector);
        }
      });

      // 各targetSelectorについて優先度を考慮して更新
      uniqueTargetSelectors.forEach((targetSelector) => {
        this._updateTargetsWithPriority(targetSelector);
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
        console.warn(`[FormBinder] Element not found: ${id}`);
      }
    }

    /**
     * プログラムから対象要素を更新
     * @param {string} targetSelector - 対象のセレクタ
     * @param {string} value - 設定する値（HTMLタグも使用可能）
     */
    updateTargets(targetSelector, value) {
      this._updateTargets(targetSelector, value);
    }

    /**
     * クリーンアップ（イベントリスナーの削除）
     */
    cleanup() {
      this.cleanupFns.forEach((fn) => fn());
      this.cleanupFns = [];
      this.elements = [];
      this.originalContents.clear();
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

  // グローバルに公開
  window.FormBinder = FormBinder;
})();
