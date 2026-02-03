/**
 * 汎用ユーティリティ関数
 *
 * プロジェクト全体で使用する汎用的なヘルパー関数
 */
(function () {
  'use strict';

  /**
   * ユニークなIDを生成
   * @returns {string} ランダムなユニークID
   */
  function generateUniqueId() {
    return 'id-' + Math.random().toString(36).slice(2, 18);
  }

  /**
   * 入力値のバリデーション（空文字列でないかチェック）
   * @param {*} input - チェックする値
   * @returns {boolean} 有効な文字列ならtrue
   */
  function validateInput(input) {
    return typeof input === 'string' && input.trim() !== '';
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.Utils = {
      generateUniqueId,
      validateInput
    };
  }
})();