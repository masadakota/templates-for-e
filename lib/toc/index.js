/**
 * TOC (Table of Contents) Generator
 * シンプルな目次生成ライブラリ
 */
(function () {
  'use strict';

  class TOC {
    /**
     * @param {Object} options - 設定オプション
     * @param {string} options.tocSelector - 目次を表示する要素のセレクター
     * @param {string} options.contentSelector - コンテンツ要素のセレクター
     * @param {string} options.headingSelector - 見出し要素のセレクター (デフォルト: 'h2, h3')
     * @param {string} options.linkColor - リンクの色 (デフォルト: 'var(--foreground)')
     * @param {string} options.linkHoverColor - リンクホバー時の色
     * @param {string} options.indentSize - h3のインデントサイズ (デフォルト: '1rem')
     * @param {boolean} options.smoothScroll - スムーススクロールを有効化 (デフォルト: true)
     * @param {boolean} options.orderedList - 番号付きリストを有効化 (デフォルト: false)
     * @param {Function} options.onClick - カスタムクリックハンドラー
     */
    constructor(options = {}) {
      this.options = {
        tocSelector: options.tocSelector || '#toc',
        contentSelector: options.contentSelector || '#content',
        headingSelector: options.headingSelector || 'h2, h3',
        linkColor: options.linkColor || 'var(--foreground)',
        linkHoverColor: options.linkHoverColor || 'var(--accent)',
        indentSize: options.indentSize || '1rem',
        smoothScroll: options.smoothScroll !== false,
        orderedList: options.orderedList !== false,
        onClick: options.onClick || null,
      };

      this.tocElement = null;
      this.contentElement = null;
      this.headings = [];
      this.numbering = {
        h2: 0,
        h3: 0,
        h4: 0,
      };
    }

    /**
     * 目次を初期化して生成
     */
    init() {
      this.tocElement = document.querySelector(this.options.tocSelector);
      this.contentElement = document.querySelector(this.options.contentSelector);

      if (!this.tocElement) {
        console.warn(`TOC: 目次要素が見つかりません: ${this.options.tocSelector}`);
        return;
      }

      if (!this.contentElement) {
        console.warn(`TOC: コンテンツ要素が見つかりません: ${this.options.contentSelector}`);
        return;
      }

      this.headings = this.contentElement.querySelectorAll(this.options.headingSelector);

      if (this.headings.length === 0) {
        console.warn('TOC: 見出しが見つかりません');
        return;
      }

      this.generate();
    }

    /**
     * 目次を生成
     */
    generate() {
      const ul = document.createElement('ul');

      // カウンターをリセット
      this.numbering = { h2: 0, h3: 0, h4: 0 };

      this.headings.forEach((heading, index) => {
        // 見出しにIDを追加
        if (!heading.id) {
          heading.id = this._generateId(heading.textContent, index);
        }

        const li = this._createListItem(heading);
        ul.appendChild(li);
      });

      this.tocElement.appendChild(ul);
    }

    /**
     * リストアイテムを作成
     * @param {HTMLElement} heading - 見出し要素
     * @returns {HTMLElement} リストアイテム
     */
    _createListItem(heading) {
      const li = document.createElement('li');
      const a = document.createElement('a');

      // 見出しレベルを取得
      const headingLevel = parseInt(heading.tagName.substring(1));
      li.setAttribute('data-level', headingLevel);

      // 番号を生成
      const numberText = this.options.orderedList ? this._generateNumber(headingLevel) : '';

      // テキストを設定（番号付き）
      if (numberText) {
        const numberSpan = document.createElement('span');
        numberSpan.className = 'toc-number';
        numberSpan.textContent = numberText;
        a.appendChild(numberSpan);

        const textSpan = document.createElement('span');
        textSpan.className = 'toc-text';
        textSpan.textContent = heading.textContent;
        a.appendChild(textSpan);
      } else {
        a.textContent = heading.textContent;
      }

      a.href = `#${heading.id}`;

      // クリックイベント
      a.addEventListener('click', (e) => {
        e.preventDefault();

        // カスタムハンドラーがあれば実行
        if (this.options.onClick) {
          this.options.onClick(heading, e);
        } else {
          // デフォルトのスクロール処理
          heading.scrollIntoView({
            behavior: this.options.smoothScroll ? 'smooth' : 'auto',
            block: 'start',
          });

          // URLを更新
          if (history.pushState) {
            history.pushState(null, null, `#${heading.id}`);
          } else {
            location.hash = heading.id;
          }
        }
      });

      li.appendChild(a);
      return li;
    }

    /**
     * 見出しレベルに基づいて番号を生成
     * @param {number} level - 見出しレベル (2, 3, 4...)
     * @returns {string} 番号テキスト (例: "1. ", "1.1. ")
     */
    _generateNumber(level) {
      const tag = `h${level}`;

      // 現在のレベルのカウンターをインクリメント
      this.numbering[tag]++;

      // 下位レベルのカウンターをリセット
      for (let i = level + 1; i <= 6; i++) {
        const lowerTag = `h${i}`;
        if (this.numbering[lowerTag] !== undefined) {
          this.numbering[lowerTag] = 0;
        }
      }

      // 番号テキストを生成
      if (level === 2) {
        return `${this.numbering.h2}. `;
      } else if (level === 3) {
        return `${this.numbering.h2}.${this.numbering.h3}. `;
      } else if (level === 4) {
        return `${this.numbering.h2}.${this.numbering.h3}.${this.numbering.h4}. `;
      }

      return '';
    }

    /**
     * 見出しからIDを生成
     * @param {string} text - 見出しテキスト
     * @param {number} index - インデックス
     * @returns {string} 生成されたID
     */
    _generateId(text, index) {
      // 日本語や特殊文字を含むテキストをサニタイズ
      const sanitized = text
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]/g, '');

      return sanitized || `heading-${index}`;
    }

    /**
     * 目次を破棄
     */
    destroy() {
      if (this.tocElement) {
        this.tocElement.innerHTML = '';
      }
    }

    /**
     * 目次を再生成
     */
    refresh() {
      this.destroy();
      this.init();
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.TOC = TOC;
  }
})();
