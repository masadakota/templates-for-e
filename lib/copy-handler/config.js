// コピーハンドラー設定ファイル
// コピー機能に関する設定を管理

window.COPY_HANDLER_CONFIG = {
  // コピー可能な要素のクラス名
  targetClassName: "copyable",

  // フラッシュアニメーション設定
  flashColor: "#b4dfff", // コピー時のフラッシュ色 #fff6a5
  transitionClass: "copy-flash-transition", // トランジションクラス名

  // 無視する要素（右クリックメニューを無効化しない要素）
  ignoreElements: ["input", "textarea", "button", "select"],

  // 自動コピー対象の要素ID
  autoCopyTargetId: "results",

  // クリックイベント設定
  copyOnLeftClick: false,    // 左クリックでコピー（デフォルト: 無効）
  copyOnMiddleClick: false,  // 中ボタンクリックでコピー（デフォルト: 無効）
  copyOnRightClick: true,    // 右クリックでコピー（デフォルト: 有効）

  // コピーアイコン表示設定
  showCopyIcon: true,        // コピーアイコンを表示（デフォルト: 有効）

  // コピー成功時のコールバック関数
  onCopySuccess: (function () {
    let originalText = null;
    let originalColor = null;
    let originalFontWeight = null;
    let timeoutId = null;

    return function (copiedText, copiedElement) {
      const instructionElement = document.getElementById("copy-instruction");
      if (!instructionElement) return;

      // 初回のみ元のテキスト、色、フォントの太さを保存
      if (originalText === null) {
        originalText = instructionElement.textContent;
        const computedStyle = window.getComputedStyle(instructionElement);
        originalColor = computedStyle.color;
        originalFontWeight = computedStyle.fontWeight;
      }

      // 既存のタイムアウトをクリア
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // テキスト、色、フォントの太さを変更
      instructionElement.textContent = "コピーしました";
      instructionElement.style.color = "#0078d4"; // 青色に変更
      instructionElement.style.fontWeight = "bold"; // 太字に変更

      // 500ms後に元に戻す
      timeoutId = setTimeout(() => {
        instructionElement.textContent = originalText;
        instructionElement.style.color = originalColor; // 元の色に戻す
        instructionElement.style.fontWeight = originalFontWeight; // 元のフォントの太さに戻す
        timeoutId = null;
      }, 500);
    };
  })(),
};
