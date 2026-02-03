/**
 * clock - 日時表示の自動更新ライブラリ
 *
 * 指定したクラス名の要素に現在の日時を表示し、分が変わるタイミングで自動更新します。
 * dayjsライブラリを使用して日時のフォーマットを行います。
 *
 * @requires dayjs - グローバルスコープにdayjsが必要です
 *
 * @example
 * // デフォルト設定で初期化（.clockクラスを対象、"M/D H:mm" 形式）
 * new Clock();
 *
 * @example
 * // dayjsのフォーマット文字列で形式を指定
 * new Clock({
 *   format: 'YYYY/MM/DD HH:mm:ss'
 * });
 *
 * @example
 * // カスタムセレクターとフォーマット関数で初期化
 * new Clock({
 *   selector: '.timestamp',
 *   format: (dayjsObj) => dayjsObj.format('YYYY年M月D日 H時m分')
 * });
 */
(function () {
  "use strict";

  class Clock {
    constructor({ selector = ".clock", format = "M/D H:mm" } = {}) {
      // dayjsの存在チェック
      if (typeof dayjs === "undefined") {
        throw new Error(
          "Clockにはライブラリのdayjsが必要です。<script>タグでdayjsをClockより先に読み込んでください。",
        );
      }

      this.selector = selector;
      this.updateTimer = null;

      // formatオプションの処理
      if (typeof format === "string") {
        // 文字列の場合はdayjsのフォーマット文字列として使用
        this.format = (dayjsObj) => dayjsObj.format(format);
      } else if (typeof format === "function") {
        // 関数の場合はそのまま使用（dayjsオブジェクトを受け取る）
        this.format = format;
      }

      // 初期化を自動実行
      this.init();
    }

    /**
     * すべての対象要素の日時を更新
     */
    updateTimestamp() {
      const now = dayjs();
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
     * constructorで自動的に呼ばれます
     *
     * @private
     * @returns {Clock} このインスタンス（メソッドチェーン用）
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
  if (typeof window !== "undefined") {
    window.Clock = Clock;
  }
})();
