/**
 * datetime-display - 日時表示の自動更新ライブラリ
 *
 * 指定したクラス名の要素に現在の日時を表示し、分が変わるタイミングで自動更新します。
 *
 * @example
 * // デフォルト設定で初期化（.datetime-displayクラスを対象、"M/D H:MM" 形式）
 * new DateTimeDisplay().init();
 *
 * @example
 * // テンプレート文字列で形式を指定
 * new DateTimeDisplay().init({
 *   format: 'YYYY/MM/DD HH:mm:ss'
 * });
 *
 * @example
 * // カスタムセレクターとフォーマット関数で初期化
 * new DateTimeDisplay().init({
 *   selector: '.timestamp',
 *   format: (date) => date.toLocaleString('ja-JP')
 * });
 */
(function () {
  'use strict';

  class DateTimeDisplay {
    constructor() {
      this.selector = '.datetime-display';
      this.format = this.defaultFormat;
      this.updateTimer = null;
    }

    /**
     * テンプレート文字列からフォーマット関数を作成
     *
     * サポートするトークン:
     * - YYYY: 4桁の年（例: 2026）
     * - YY: 2桁の年（例: 26）
     * - MM: 2桁の月（例: 01）
     * - M: 月（例: 1）
     * - DD: 2桁の日（例: 01）
     * - D: 日（例: 1）
     * - HH: 2桁の時（例: 09）
     * - H: 時（例: 9）
     * - mm: 2桁の分（例: 05）
     * - m: 分（例: 5）
     * - ss: 2桁の秒（例: 03）
     * - s: 秒（例: 3）
     *
     * @param {string} template - テンプレート文字列
     * @returns {Function} フォーマット関数
     */
    createTemplateFormatter(template) {
      return (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();

        // トークンマップ（長いトークンから順に処理するため）
        const tokens = {
          'YYYY': year.toString(),
          'YY': year.toString().slice(-2),
          'MM': month.toString().padStart(2, '0'),
          'DD': day.toString().padStart(2, '0'),
          'HH': hours.toString().padStart(2, '0'),
          'mm': minutes.toString().padStart(2, '0'),
          'ss': seconds.toString().padStart(2, '0'),
          'M': month.toString(),
          'D': day.toString(),
          'H': hours.toString(),
          'm': minutes.toString(),
          's': seconds.toString()
        };

        // 正規表現で一括置換（長いトークンが優先されるように順序を保証）
        let result = template;
        for (const [token, value] of Object.entries(tokens)) {
          result = result.replace(new RegExp(token, 'g'), value);
        }

        return result;
      };
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
     *
     * @param {Object} options - 設定オプション（オプショナル）
     * @param {string} options.selector - 対象要素のCSSセレクター
     * @param {string|Function} options.format - 日時のフォーマット
     * @returns {DateTimeDisplay} このインスタンス（メソッドチェーン用）
     */
    init(options = {}) {
      // init()で渡されたオプションがあれば上書き
      if (options.selector) {
        this.selector = options.selector;
      }

      if (options.format) {
        if (typeof options.format === 'string') {
          this.format = this.createTemplateFormatter(options.format);
        } else if (typeof options.format === 'function') {
          this.format = options.format;
        }
      }

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
