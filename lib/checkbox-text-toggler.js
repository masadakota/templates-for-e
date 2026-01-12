/**
 * Checkbox Text Toggler
 * チェックボックスの状態に応じて、指定したクラスの要素のテキストを切り替えます
 *
 * 使用方法:
 * 1. HTMLでチェックボックスに以下のdata属性を設定:
 *    - data-target-class: 更新対象の要素のクラス名
 *    - data-true-value: チェック時のテキスト（デフォルト: "済"）
 *    - data-false-value: 未チェック時のテキスト（デフォルト: "未"）
 *
 * 2. JavaScriptで初期化:
 *    import CheckboxTextToggler from './lib/checkbox-text-toggler.js';
 *    const toggler = new CheckboxTextToggler();
 *    toggler.init();
 *
 * または自動初期化を使用:
 *    import './lib/checkbox-text-toggler.js';
 *
 * HTML例:
 * <input type="checkbox"
 *        data-target-class="status-text"
 *        data-true-value="済"
 *        data-false-value="未" />
 * <span class="status-text">未</span>
 */

export class CheckboxTextToggler {
  constructor(options = {}) {
    this.options = {
      checkboxSelector: 'input[type="checkbox"][data-target-class]',
      trueValueAttr: 'data-true-value',
      falseValueAttr: 'data-false-value',
      targetClassAttr: 'data-target-class',
      defaultTrueValue: '済',
      defaultFalseValue: '未',
      autoInit: true,
      ...options
    };

    this.checkboxes = [];
    this.cleanupFns = [];
  }

  /**
   * 初期化
   * @param {HTMLElement|Document} root - 検索のルート要素（デフォルト: document）
   */
  init(root = document) {
    this.cleanup();

    // 対象のチェックボックスを検索
    this.checkboxes = Array.from(
      root.querySelectorAll(this.options.checkboxSelector)
    );

    // 各チェックボックスにイベントリスナーを設定
    this.checkboxes.forEach(checkbox => {
      this._setupCheckbox(checkbox);
    });

    // 初期状態を反映
    this._updateAllTargets();

    console.log(`[CheckboxTextToggler] Initialized ${this.checkboxes.length} checkboxes`);
  }

  /**
   * 個別のチェックボックスをセットアップ
   * @private
   */
  _setupCheckbox(checkbox) {
    const targetClass = checkbox.getAttribute(this.options.targetClassAttr);

    if (!targetClass) {
      console.warn('[CheckboxTextToggler] Missing target class:', checkbox);
      return;
    }

    // changeイベントリスナー
    const handler = () => this._handleChange(checkbox);
    checkbox.addEventListener('change', handler);

    // クリーンアップ関数を保存
    this.cleanupFns.push(() => {
      checkbox.removeEventListener('change', handler);
    });
  }

  /**
   * チェックボックスの変更を処理
   * @private
   */
  _handleChange(checkbox) {
    const targetClass = checkbox.getAttribute(this.options.targetClassAttr);
    const trueValue = checkbox.getAttribute(this.options.trueValueAttr)
      || this.options.defaultTrueValue;
    const falseValue = checkbox.getAttribute(this.options.falseValueAttr)
      || this.options.defaultFalseValue;

    const newValue = checkbox.checked ? trueValue : falseValue;

    // 対象要素を更新
    this._updateTargets(targetClass, newValue);
  }

  /**
   * 指定したクラスの全要素を更新
   * @private
   */
  _updateTargets(targetClass, value) {
    const targets = document.querySelectorAll(`.${targetClass}`);

    targets.forEach(target => {
      target.textContent = value;
    });

    if (targets.length === 0) {
      console.warn(`[CheckboxTextToggler] No targets found for class: ${targetClass}`);
    }
  }

  /**
   * 全チェックボックスの状態を反映
   * @private
   */
  _updateAllTargets() {
    this.checkboxes.forEach(checkbox => {
      this._handleChange(checkbox);
    });
  }

  /**
   * 特定のチェックボックスを手動で更新
   * @param {string} id - チェックボックスのID
   * @param {boolean} checked - チェック状態
   */
  setCheckboxState(id, checked) {
    const checkbox = document.getElementById(id);
    if (checkbox) {
      checkbox.checked = checked;
      this._handleChange(checkbox);
    } else {
      console.warn(`[CheckboxTextToggler] Checkbox not found: ${id}`);
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
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
    this.checkboxes = [];
  }

  /**
   * 新しいチェックボックスを動的に追加
   * @param {HTMLElement} checkbox - 追加するチェックボックス要素
   */
  addCheckbox(checkbox) {
    if (!this.checkboxes.includes(checkbox)) {
      this.checkboxes.push(checkbox);
      this._setupCheckbox(checkbox);
      this._handleChange(checkbox);
    }
  }

  /**
   * チェックボックスを削除
   * @param {HTMLElement} checkbox - 削除するチェックボックス要素
   */
  removeCheckbox(checkbox) {
    const index = this.checkboxes.indexOf(checkbox);
    if (index > -1) {
      this.checkboxes.splice(index, 1);
      // 対応するクリーンアップ関数も実行して削除
      // （簡易実装のため、全体を再初期化）
    }
  }
}

// デフォルトインスタンスをエクスポート
export default CheckboxTextToggler;

// 自動初期化（オプション）
if (typeof window !== 'undefined') {
  // DOMContentLoadedで自動初期化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      if (!window.__checkboxTextToggler) {
        window.__checkboxTextToggler = new CheckboxTextToggler();
        window.__checkboxTextToggler.init();
      }
    });
  } else {
    // すでに読み込み済みの場合は即座に初期化
    if (!window.__checkboxTextToggler) {
      window.__checkboxTextToggler = new CheckboxTextToggler();
      window.__checkboxTextToggler.init();
    }
  }
}
