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
 * 複数のターゲットクラスを指定:
 * <input type="checkbox"
 *        data-target-classes="delay-notice delay-notice-for-taishogai"
 *        data-true-value="年末年始トーク"
 *        data-priority="1" />
 * <span class="delay-notice"></span>
 * <span class="delay-notice-for-taishogai"></span>
 *
 * 優先度付きチェックボックス（同じdata-target-classを持つ複数要素）:
 * <input type="checkbox"
 *        data-target-class="delay-notice"
 *        data-true-value="通常よりお日にちがかかる可能性案内"
 *        data-priority="1" />
 * <input type="checkbox"
 *        data-target-class="delay-notice"
 *        data-true-value="年末年始トーク"
 *        data-priority="2" />
 * <span class="delay-notice"></span>
 * ※ 複数チェックされた場合、data-priorityの値が小さい方（優先度が高い）が反映されます
 * ※ data-priorityが未指定の場合は999として扱われます
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
        checkboxSelector: 'input[type="checkbox"][data-target-class], input[type="checkbox"][data-target-classes]',
        selectSelector: 'select[data-target-class], select[data-target-classes]',
        inputSelector: 'input[data-target-class]:not([type="checkbox"]), input[data-target-classes]:not([type="checkbox"])',
        trueValueAttr: "data-true-value",
        falseValueAttr: "data-false-value",
        targetClassAttr: "data-target-class",
        targetClassesAttr: "data-target-classes",
        priorityAttr: "data-priority",
        defaultTrueValue: "済",
        defaultFalseValue: "未",
        ...options,
      };

      this.elements = [];
      this.cleanupFns = [];
      // ターゲット要素の元のテキストを保存するMap
      this.originalTexts = new Map();
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
     * 要素からターゲットクラスを取得（data-target-class または data-target-classes）
     * @private
     * @returns {string[]} ターゲットクラスの配列
     */
    _getTargetClasses(element) {
      const targetClass = element.getAttribute(this.options.targetClassAttr);
      const targetClasses = element.getAttribute(this.options.targetClassesAttr);

      if (targetClasses) {
        // data-target-classesがある場合、スペース区切りで分割
        return targetClasses.trim().split(/\s+/).filter(cls => cls);
      } else if (targetClass) {
        // data-target-classがある場合
        return [targetClass];
      }

      return [];
    }

    /**
     * 個別の要素をセットアップ
     * @private
     */
    _setupElement(element) {
      const targetClasses = this._getTargetClasses(element);

      if (targetClasses.length === 0) {
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
      const targetClasses = this._getTargetClasses(element);

      // 各ターゲットクラスについて優先度を評価して更新
      targetClasses.forEach(targetClass => {
        this._updateTargetsWithPriority(targetClass);
      });
    }

    /**
     * 優先度を考慮してターゲットを更新
     * @private
     */
    _updateTargetsWithPriority(targetClass) {
      // 同じtargetClassを持つ全要素を取得（data-target-class または data-target-classes）
      const elementsWithSameTarget = this.elements.filter((el) => {
        const targetClasses = this._getTargetClasses(el);
        return targetClasses.includes(targetClass);
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
        } else {
          value = element.value;
          isActive = value !== "" && value !== null && value !== undefined;
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
      this._updateTargets(targetClass, selectedValue);
    }

    /**
     * 指定したクラスの全要素を更新
     * @private
     */
    _updateTargets(targetClass, value) {
      const targets = document.querySelectorAll(`.${targetClass}`);

      targets.forEach((target) => {
        // 元のテキストを保存（初回のみ）
        if (!this.originalTexts.has(targetClass)) {
          this.originalTexts.set(targetClass, target.textContent);
        }

        // 空白の場合は元のテキストを表示
        if (value === "" || value === null || value === undefined) {
          target.textContent = this.originalTexts.get(targetClass) || "";
        } else {
          target.textContent = value;
        }
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
      // 全てのユニークなtargetClassを取得（data-target-class と data-target-classes の両方）
      const uniqueTargetClasses = new Set();

      this.elements.forEach((el) => {
        const targetClasses = this._getTargetClasses(el);
        targetClasses.forEach(cls => uniqueTargetClasses.add(cls));
      });

      // 各targetClassについて優先度を考慮して更新
      uniqueTargetClasses.forEach((targetClass) => {
        if (targetClass) {
          this._updateTargetsWithPriority(targetClass);
        }
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
      this.originalTexts.clear();
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
