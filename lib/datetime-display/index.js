/**
 * datetime-display - 日時表示の自動更新ライブラリ
 *
 * 指定したクラス名の要素に現在の日時を表示し、分が変わるタイミングで自動更新します。
 *
 * @example
 * // デフォルト設定で初期化（.datetime-displayクラスを対象）
 * new DateTimeDisplay().init();
 *
 * @example
 * // カスタム設定で初期化
 * new DateTimeDisplay({
 *   selector: '.timestamp',
 *   format: (date) => date.toLocaleString('ja-JP')
 * }).init();
 */
(function () {
  'use strict';

  class DateTimeDisplay {
    /**
     * @param {Object} options - 設定オプション
     * @param {string} options.selector - 対象要素のCSSセレクター（デフォルト: '.datetime-display'）
     * @param {Function} options.format - 日時のフォーマット関数（デフォルト: "M/D H:MM" 形式）
     */
    constructor(options = {}) {
      this.selector = options.selector || '.datetime-display';
      this.format = options.format || this.defaultFormat;
      this.updateTimer = null;
    }

    /**
     * デフォルトのフォーマット関数
     * "1/1 1:01" の形式で返す
     *
     * @param {Date} date - フォーマット対象の日時
     * @returns {string} フォーマット済みの日時文字列
     */
    defaultFormat(date) {
      const month = date.getMonth() + 1; // 0-11なので+1
      const day = date.getDate();
      const hours = date.getHours();
      const minutes = date.getMinutes();

      return `${month}/${day} ${hours}:${minutes.toString().padStart(2, '0')}`;
    }

    /**
     * すべての対象要素の日時を更新
     */
    updateTimestamp() {
      const now = new Date();
      const formatted = this.format(now);

      document.querySelectorAll(this.selector).forEach((element) => {
        element.textContent = formatted;
      });
    }

    /**
     * 次の分の00秒に更新をスケジュール
     */
    scheduleNextUpdate() {
      const now = new Date();
      const seconds = now.getSeconds();
      const milliseconds = now.getMilliseconds();

      // 次の分の00秒までの時間を計算（ミリ秒）
      const delay = (60 - seconds) * 1000 - milliseconds;

      this.updateTimer = setTimeout(() => {
        this.updateTimestamp();
        this.scheduleNextUpdate(); // 次の更新をスケジュール
      }, delay);
    }

    /**
     * 初期化して自動更新を開始
     */
    init() {
      // 初回実行
      this.updateTimestamp();

      // 次の更新をスケジュール
      this.scheduleNextUpdate();

      return this;
    }

    /**
     * 自動更新を停止
     */
    destroy() {
      if (this.updateTimer) {
        clearTimeout(this.updateTimer);
        this.updateTimer = null;
      }
    }
  }

  // グローバルスコープに公開（file://プロトコル対応）
  if (typeof window !== 'undefined') {
    window.DateTimeDisplay = DateTimeDisplay;
  }
})();
