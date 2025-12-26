/**
 * テキストをクリップボードにコピーする関数
 * @param {string} text - コピーするテキスト
 * @returns {Promise} - コピー処理の Promise
 */
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      ok ? resolve() : reject();
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * 右クリックでコピー機能を初期化する
 * @param {string} targetClassName - コピー可能にする要素のclass名（デフォルト: "copyable"）
 */
function initCopyOnRightClick(targetClassName = "copyable") {
  document.addEventListener("contextmenu", (e) => {
    const ignore = ["input", "textarea", "button", "select"];
    if (ignore.some((sel) => e.target.closest(sel))) return;

    // 指定されたclass名を持つ要素かチェック
    const el = e.target.closest(`.${targetClassName}`);
    if (!el) return;

    // copyable要素の場合のみpreventDefaultを実行
    e.preventDefault();

    const text = el.innerText?.trim() ?? "";
    if (!text) return;

    copyText(text).then(() => {
      const originalBg = window.getComputedStyle(el).backgroundColor;

      // 現在の transition を一時的にオフ
      el.classList.remove("copy-flash-transition");

      // 即座に色を変更（ここでは黄色）
      el.style.backgroundColor = "#fff6a5";

      // 次の描画フレームで transition を有効化し、元の色へ戻す
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add("copy-flash-transition");
          el.style.backgroundColor = originalBg;
        });
      });
    });
  });
}

// DOMContentLoaded または即座に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => initCopyOnRightClick());
} else {
  initCopyOnRightClick();
}
