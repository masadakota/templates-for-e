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

  // コピー成功時のコールバック関数
  onCopySuccess: (function () {
    let originalText = null;
    let timeoutId = null;

    return function (copiedText, copiedElement) {
      const instructionElement = document.getElementById("copy-instruction");
      if (!instructionElement) return;

      // 初回のみ元のテキストを保存
      if (originalText === null) {
        originalText = instructionElement.textContent;
      }

      // 既存のタイムアウトをクリア
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }

      // テキストを変更
      instructionElement.textContent = "コピーしました";
      instructionElement.style.color = "#0078d4"; // 青色に変更
      // instructionElement.style.fontWeight = "bold"; // 太字に変更

      // 1000ms後に元に戻す
      timeoutId = setTimeout(() => {
        instructionElement.textContent = originalText;
        instructionElement.style.color = "#888"; // 元の色に戻す
        // instructionElement.style.fontWeight = ""; // フォントの太さを元に戻す
        timeoutId = null;
      }, 500);
    };
  })(),
};
