/**
 * DOM操作ユーティリティ関数
 *
 * コードの重複を減らし、保守性を向上させるための
 * DOM操作ヘルパー関数をまとめたもの
 */
(function () {
  "use strict";

  /**
   * 要素を安全に取得（エラーハンドリング付き）
   * @param {string} id - 要素のID
   * @returns {HTMLElement|null} 要素またはnull
   */
  function getElement(id) {
    const element = document.getElementById(id);
    if (!element) {
      console.warn(`Element not found: #${id}`);
    }
    return element;
  }

  /**
   * IDマッピングから複数の要素を取得
   * @param {Object} ids - キーと要素IDのマップ
   * @returns {Object} キーと要素のマップ
   *
   * @example
   * const elements = getElements({
   *   button: 'my-button',
   *   input: 'my-input'
   * });
   */
  function getElements(ids) {
    const elements = {};
    for (const [key, id] of Object.entries(ids)) {
      elements[key] = getElement(id);
    }
    return elements;
  }

  /**
   * 要素のテキストコンテンツを安全に更新
   * @param {string} elementId - 要素のID
   * @param {string} text - テキストコンテンツ
   */
  function updateText(elementId, text) {
    const element = getElement(elementId);
    if (element) {
      element.textContent = text;
    }
  }

  /**
   * 要素の表示/非表示を切り替え
   * @param {string} elementId - 要素のID
   * @param {boolean} isVisible - 表示状態
   */
  function toggleVisibility(elementId, isVisible) {
    const element = getElement(elementId);
    if (element) {
      element.style.display = isVisible ? "" : "none";
    }
  }

  /**
   * 型安全なクエリセレクター
   * @param {string} selector - CSSセレクター
   * @param {Element} parent - 親要素（デフォルト: document）
   * @returns {Element|null} 要素またはnull
   */
  function querySelector(selector, parent = document) {
    const element = parent.querySelector(selector);
    if (!element) {
      console.warn(`Element not found: ${selector}`);
    }
    return element;
  }

  /**
   * 配列を返すquerySelectorAll
   * @param {string} selector - CSSセレクター
   * @param {Element} parent - 親要素（デフォルト: document）
   * @returns {Array<Element>} 要素の配列
   */
  function querySelectorAll(selector, parent = document) {
    return Array.from(parent.querySelectorAll(selector));
  }

  /**
   * 要素に複数の属性を設定
   * @param {HTMLElement} element - 対象の要素
   * @param {Object} attributes - 設定する属性
   */
  function setAttributes(element, attributes) {
    if (!element) return;
    for (const [key, value] of Object.entries(attributes)) {
      element.setAttribute(key, value);
    }
  }

  /**
   * 自動クリーンアップ付きイベントリスナーを追加
   * @param {HTMLElement} element - 対象の要素
   * @param {string} event - イベント名
   * @param {Function} handler - イベントハンドラー
   * @returns {Function} クリーンアップ関数
   */
  function addEventListener(element, event, handler) {
    if (!element) return () => {};
    element.addEventListener(event, handler);
    return () => element.removeEventListener(event, handler);
  }

  /**
   * セレクターで要素を取得してイベントをディスパッチ
   * @param {string} selector - CSSセレクター
   * @param {string} eventType - イベントタイプ
   * @param {Object} options - イベントオプション
   * @param {boolean} [options.bubbles=true] - イベントをバブリングさせるか
   * @param {boolean} [options.cancelable=true] - イベントをキャンセル可能にするか
   * @returns {boolean} 要素が見つかってイベントをディスパッチできたらtrue
   */
  function dispatchEventBySelector(selector, eventType, options = {}) {
    const element = document.querySelector(selector);
    if (!element) {
      console.warn(`要素が見つかりません: ${selector}`);
      return false;
    }

    const {
      bubbles = true,
      cancelable = true,
      ...rest
    } = options;

    element.dispatchEvent(new Event(eventType, {
      bubbles,
      cancelable,
      ...rest
    }));
    return true;
  }

  // グローバルスコープに公開
  if (typeof window !== "undefined") {
    window.DomUtils = {
      getElement,
      getElements,
      updateText,
      toggleVisibility,
      querySelector,
      querySelectorAll,
      setAttributes,
      addEventListener,
      dispatchEventBySelector,
    };
  }
})();
