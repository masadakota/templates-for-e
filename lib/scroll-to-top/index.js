/**
 * ScrollToTop - ページトップに戻るボタンを提供するライブラリ
 *
 * スクロール位置に応じて表示/非表示が切り替わり、
 * クリックでページトップにスムーズスクロールします。
 *
 * @example
 * new ScrollToTop();
 *
 * @example
 * new ScrollToTop({
 *   buttonId: 'my-scroll-btn',
 *   showAfter: 500,
 *   backgroundColor: '#007bff'
 * });
 */
(function () {
  'use strict';

  class ScrollToTop {
    /**
     * @param {Object} options - 設定オプション
     * @param {string} options.buttonId - ボタン要素のID (デフォルト: 'scroll-to-top')
     * @param {number} options.showAfter - ボタンを表示するスクロール位置(px) (デフォルト: 300)
     * @param {string} options.scrollBehavior - スクロール動作 ('smooth' | 'auto') (デフォルト: 'smooth')
     * @param {string} options.backgroundColor - ボタンの背景色 (デフォルト: 'var(--accent)')
     * @param {string} options.position - ボタンの位置 ('bottom-right' | 'bottom-left' | 'top-right' | 'top-left') (デフォルト: 'bottom-right')
     * @param {boolean} options.autoCreate - ボタンを自動生成するか (デフォルト: true)
     */
    constructor(options = {}) {
      this.options = {
        buttonId: 'scroll-to-top',
        showAfter: 300,
        scrollBehavior: 'smooth',
        backgroundColor: 'var(--muted-foreground)',
        position: 'bottom-right',
        autoCreate: true,
        ...options
      };

      this.button = null;
      this.init();
    }

    /**
     * 初期化
     */
    init() {
      // 既存のボタンを検索
      this.button = document.getElementById(this.options.buttonId);

      // ボタンが存在しない場合、自動生成
      if (!this.button && this.options.autoCreate) {
        this.createButton();
      }

      if (!this.button) {
        console.warn(`ScrollToTop: Button with id "${this.options.buttonId}" not found.`);
        return;
      }

      this.setupEventListeners();
      this.toggleButton(); // 初期表示チェック
    }

    /**
     * ボタンを生成してDOMに追加
     */
    createButton() {
      // ボタン要素を生成
      this.button = document.createElement('button');
      this.button.id = this.options.buttonId;
      this.button.setAttribute('aria-label', '上に戻る');
      this.button.setAttribute('title', '上に戻る');

      // SVGアイコンを追加
      this.button.innerHTML = `
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 19V5M12 5L5 12M12 5L19 12"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      `;

      // スタイルを適用
      this.applyStyles();

      // DOMに追加
      document.body.appendChild(this.button);
    }

    /**
     * ボタンにスタイルを適用
     */
    applyStyles() {
      if (!this.button) return;

      const positions = {
        'bottom-right': { bottom: '20px', right: '20px' },
        'bottom-left': { bottom: '20px', left: '20px' },
        'top-right': { top: '20px', right: '20px' },
        'top-left': { top: '20px', left: '20px' }
      };

      const pos = positions[this.options.position] || positions['bottom-right'];

      Object.assign(this.button.style, {
        position: 'fixed',
        ...pos,
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        backgroundColor: this.options.backgroundColor,
        color: 'white',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        display: 'none',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: '0',
        transform: 'scale(0.8)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
        zIndex: '1000'
      });
    }

    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
      // スクロールイベント
      window.addEventListener('scroll', () => this.toggleButton());

      // クリックイベント
      this.button.addEventListener('click', () => this.scrollToTop());
    }

    /**
     * スクロール位置に応じてボタンを表示/非表示
     */
    toggleButton() {
      if (!this.button) return;

      if (window.scrollY > this.options.showAfter) {
        // まずdisplay: flexに設定
        this.button.style.display = 'flex';
        // ブラウザに強制的にレイアウトを再計算させる
        this.button.offsetHeight;
        // 次のフレームでopacityとtransformを変更してアニメーションを発火
        requestAnimationFrame(() => {
          this.button.style.opacity = '1';
          this.button.style.transform = 'scale(1)';
        });
      } else {
        this.button.style.opacity = '0';
        this.button.style.transform = 'scale(0.8)';
        // アニメーション終了後にdisplayをnoneに
        setTimeout(() => {
          if (this.button.style.opacity === '0') {
            this.button.style.display = 'none';
          }
        }, 300); // transition時間と合わせる
      }
    }

    /**
     * ページトップにスクロール
     */
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: this.options.scrollBehavior
      });
    }

    /**
     * ボタンを破棄（イベントリスナーを削除）
     */
    destroy() {
      if (this.button) {
        this.button.style.display = 'none';
      }
      // 注: scroll イベントリスナーの削除には名前付き関数が必要
      // 現在の実装では removeEventListener は未対応
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.ScrollToTop = ScrollToTop;
  }
})();
