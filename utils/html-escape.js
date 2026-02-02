/**
 * HTML Escape Utility
 * HTMLコードを自動的にエスケープしてPrism.jsで表示可能にする
 */
(function () {
  'use strict';

  /**
   * HTMLコードをエスケープする
   * @param {string} html - エスケープするHTML文字列
   * @returns {string} エスケープされた文字列
   */
  function escapeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  /**
   * data-code属性を持つ<code>要素を自動的にエスケープして表示
   */
  function autoEscapeCodeBlocks() {
    // data-code属性を持つすべての<code>要素を取得
    const codeElements = document.querySelectorAll('code[data-code]');

    codeElements.forEach((codeElement) => {
      const rawHTML = codeElement.getAttribute('data-code');
      if (rawHTML) {
        // HTMLをエスケープしてテキストコンテンツとして設定
        codeElement.textContent = rawHTML;

        // Prism.jsで再ハイライト
        if (window.Prism) {
          Prism.highlightElement(codeElement);
        }
      }
    });
  }

  /**
   * インデントを正規化する（共通のインデントを削除）
   * @param {string} code - 正規化するコード文字列
   * @returns {string} 正規化されたコード
   */
  function normalizeIndent(code) {
    const lines = code.split('\n');

    // 空行を除いた行を取得
    const nonEmptyLines = lines.filter(line => line.trim().length > 0);

    if (nonEmptyLines.length === 0) {
      return code;
    }

    // 最小インデント数を計算
    const minIndent = Math.min(
      ...nonEmptyLines.map(line => {
        const match = line.match(/^(\s*)/);
        return match ? match[1].length : 0;
      })
    );

    // 共通インデントを削除
    const normalized = lines
      .map(line => {
        // 空行はそのまま
        if (line.trim().length === 0) {
          return '';
        }
        // 共通インデントを削除
        return line.slice(minIndent);
      })
      .join('\n');

    // 前後の空行を削除
    return normalized.trim();
  }

  /**
   * <template>タグ内のHTMLを自動的にエスケープして表示
   */
  function autoEscapeFromTemplate() {
    // data-template-id属性を持つ<code>要素を取得
    const codeElements = document.querySelectorAll('code[data-template-id]');

    codeElements.forEach((codeElement) => {
      const templateId = codeElement.getAttribute('data-template-id');
      const template = document.getElementById(templateId);

      if (template && template.tagName === 'TEMPLATE') {
        // <template>の内容を取得（HTMLとして）
        let rawHTML = template.innerHTML;

        // インデントを正規化
        rawHTML = normalizeIndent(rawHTML);

        // HTMLをテキストとして設定（自動的にエスケープされる）
        codeElement.textContent = rawHTML;

        // Prism.jsで再ハイライト
        if (window.Prism) {
          Prism.highlightElement(codeElement);
        }
      }
    });
  }

  /**
   * 初期化関数
   */
  function init() {
    // DOMContentLoadedイベントで実行
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        autoEscapeCodeBlocks();
        autoEscapeFromTemplate();
      });
    } else {
      // すでにDOMが読み込まれている場合は即座に実行
      autoEscapeCodeBlocks();
      autoEscapeFromTemplate();
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.HTMLEscape = {
      escape: escapeHTML,
      init: init,
      autoEscapeCodeBlocks: autoEscapeCodeBlocks,
      autoEscapeFromTemplate: autoEscapeFromTemplate,
    };
  }

  // 自動初期化
  init();
})();
