/**
 * FileDrop - txtファイルのドラッグ&ドロップ機能を提供するライブラリ
 *
 * @example
 * new FileDrop({
 *   dropZoneId: 'drop-zone',
 *   fileInputId: 'file-input',
 *   fileContentId: 'file-content',
 *   onFileLoad: (text, fileName) => {
 *     console.log('File loaded:', fileName);
 *   }
 * });
 */
(function () {
  'use strict';

  class FileDrop {
    /**
     * @param {Object} options - 設定オプション
     * @param {string} options.dropZoneId - ドロップゾーン要素のID
     * @param {string} options.fileInputId - ファイル入力要素のID
     * @param {Function} [options.onFileLoad] - ファイル読み込み完了時のコールバック (text, fileName) => {}
     * @param {Function} [options.onError] - エラー発生時のコールバック (errorMessage, file) => {}
     * @param {string} [options.acceptExtension='.txt'] - 受け付けるファイル拡張子
     */
    constructor(options = {}) {
      this.dropZoneId = options.dropZoneId || 'drop-zone';
      this.fileInputId = options.fileInputId || 'file-input';
      this.onFileLoad = options.onFileLoad || null;
      this.onError = options.onError || null;
      this.acceptExtension = options.acceptExtension || '.txt';

      this.dropZone = document.getElementById(this.dropZoneId);
      this.fileInput = document.getElementById(this.fileInputId);

      if (!this.dropZone || !this.fileInput) {
        console.error('FileDrop: 必要な要素が見つかりません');
        return;
      }

      this._init();
    }

    /**
     * イベントリスナーを初期化
     * @private
     */
    _init() {
      // ドラッグオーバー時のスタイル変更
      this.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.dropZone.style.borderColor = 'var(--accent)';
        this.dropZone.style.backgroundColor = 'color-mix(in srgb, var(--accent) 10%, transparent)';
      });

      // ドラッグが離れた時
      this.dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._resetDropZoneStyle();
      });

      // ドロップ時の処理
      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        this._resetDropZoneStyle();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
          this._handleFile(files[0]);
        }
      });

      // クリック時にファイル選択ダイアログを表示
      this.dropZone.addEventListener('click', () => {
        this.fileInput.click();
      });

      // ファイル選択時の処理
      this.fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        if (files.length > 0) {
          this._handleFile(files[0]);
        }
      });
    }

    /**
     * ドロップゾーンのスタイルをリセット
     * @private
     */
    _resetDropZoneStyle() {
      this.dropZone.style.borderColor = '#ccc';
      this.dropZone.style.backgroundColor = 'var(--card)';
    }

    /**
     * ファイルを読み込んで表示
     * @private
     * @param {File} file - 読み込むファイル
     */
    _handleFile(file) {
      // 拡張子チェック
      if (!file.name.endsWith(this.acceptExtension)) {
        const errorMessage = `${this.acceptExtension}ファイルのみ対応しています`;
        if (this.onError) {
          this.onError(errorMessage, file);
        } else {
          alert(errorMessage);
        }
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        const text = e.target.result;

        // ドロップゾーンにファイル名を表示
        this.dropZone.innerHTML = `
          <p style="margin: 0; color: var(--muted-foreground)">
            ✅ ${file.name}<br />
            <small>クリックして別のファイルを選択</small>
          </p>
        `;

        // コールバック実行（表示処理はコールバックで行う）
        if (this.onFileLoad) {
          this.onFileLoad(text, file.name);
        }
      };

      reader.onerror = () => {
        const errorMessage = 'ファイルの読み込みに失敗しました';
        if (this.onError) {
          this.onError(errorMessage, file);
        } else {
          alert(errorMessage);
        }
      };

      reader.readAsText(file, 'UTF-8');
    }

    /**
     * ドロップゾーンをリセット
     */
    reset() {
      this.fileInput.value = '';

      this.dropZone.innerHTML = `
        <p style="margin: 0; color: var(--muted-foreground)">
          📄 txtファイルをここにドラッグ&ドロップ<br />
          またはクリックしてファイルを選択
        </p>
      `;
    }
  }

  // グローバルスコープに公開
  if (typeof window !== 'undefined') {
    window.FileDrop = FileDrop;
  }
})();
