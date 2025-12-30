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
 * @param {Object} config - 設定オブジェクト（デフォルト: グローバルのCOPY_HANDLER_CONFIG）
 */
function initCopyOnRightClick(config = window.COPY_HANDLER_CONFIG) {
  // 設定ファイルが読み込まれていない場合のデフォルト値
  const defaultConfig = {
    targetClassName: "copyable",
    flashColor: "#fff6a5",
    transitionClass: "copy-flash-transition",
    ignoreElements: ["input", "textarea", "button", "select"]
  };

  const {
    targetClassName,
    flashColor,
    transitionClass,
    ignoreElements,
    onCopySuccess
  } = { ...defaultConfig, ...config };

  // デバッグ用ログ
  console.log('[Copy Handler] initCopyOnRightClick config:', {
    config: window.COPY_HANDLER_CONFIG,
    flashColor,
    mergedConfig: { targetClassName, flashColor, transitionClass, ignoreElements }
  });

  // 各要素の元の背景色を保存するWeakMap
  const originalBackgrounds = new WeakMap();

  document.addEventListener("contextmenu", (e) => {
    if (ignoreElements.some((sel) => e.target.closest(sel))) return;

    // 指定されたclass名を持つ要素かチェック
    const el = e.target.closest(`.${targetClassName}`);
    if (!el) return;

    // copyable要素の場合のみpreventDefaultを実行
    e.preventDefault();

    const text = el.innerText?.trim() ?? "";
    if (!text) return;

    copyText(text).then(() => {
      // 初回のみ元の背景色を保存
      if (!originalBackgrounds.has(el)) {
        originalBackgrounds.set(el, window.getComputedStyle(el).backgroundColor);
      }
      const originalBg = originalBackgrounds.get(el);

      // 現在の transition を一時的にオフ
      el.classList.remove(transitionClass);

      // 即座に色を変更
      el.style.backgroundColor = flashColor;

      // 次の描画フレームで transition を有効化し、元の色へ戻す
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add(transitionClass);
          el.style.backgroundColor = originalBg;
        });
      });

      // コールバック関数を実行
      if (typeof onCopySuccess === 'function') {
        onCopySuccess(text, el);
      }
    });
  });
}

/**
 * 自動コピー機能を初期化
 * @param {Object} config - 設定オブジェクト（デフォルト: グローバルのCOPY_HANDLER_CONFIG）
 */
function initAutoCopy(config = window.COPY_HANDLER_CONFIG) {
  // 設定ファイルが読み込まれていない場合のデフォルト値
  const defaultConfig = {
    flashColor: "#fff6a5",
    transitionClass: "copy-flash-transition",
    autoCopyTargetId: "results"
  };

  const {
    flashColor,
    transitionClass,
    autoCopyTargetId,
    onCopySuccess
  } = { ...defaultConfig, ...config };

  // デバッグ用ログ
  console.log('[Copy Handler] initAutoCopy config:', {
    config: window.COPY_HANDLER_CONFIG,
    flashColor,
    mergedConfig: { flashColor, transitionClass, autoCopyTargetId }
  });

  // 各要素の元の背景色を保存するWeakMap
  const originalBackgrounds = new WeakMap();

  document.addEventListener('autoCopyResults', (e) => {
    // 指定された要素からのイベントのみ処理
    if (e.target.id !== autoCopyTargetId) return;

    const text = e.target.innerText?.trim() ?? "";
    if (!text) return;

    copyText(text).then(() => {
      const el = e.target;

      // 初回のみ元の背景色を保存
      if (!originalBackgrounds.has(el)) {
        originalBackgrounds.set(el, window.getComputedStyle(el).backgroundColor);
      }
      const originalBg = originalBackgrounds.get(el);

      // 現在の transition を一時的にオフ
      el.classList.remove(transitionClass);

      // 即座に色を変更
      el.style.backgroundColor = flashColor;

      // 次の描画フレームで transition を有効化し、元の色へ戻す
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          el.classList.add(transitionClass);
          el.style.backgroundColor = originalBg;
        });
      });

      // コールバック関数を実行
      if (typeof onCopySuccess === 'function') {
        onCopySuccess(text, el);
      }
    }).catch((err) => {
      console.error('Auto copy failed:', err);
    });
  });
}

// DOMContentLoaded または即座に初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    initCopyOnRightClick();
    initAutoCopy();
  });
} else {
  initCopyOnRightClick();
  initAutoCopy();
}
