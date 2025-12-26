// ==========================================
// 定数とデフォルト設定
// ==========================================

// デフォルト値を取得する関数
// config/defaults.js で定義されたCONFIGオブジェクトが存在すれば使用、なければフォールバック
function getConfig() {
  // グローバルのCONFIGオブジェクトがあればそれを使用
  if (typeof CONFIG !== 'undefined') {
    return CONFIG;
  }

  // フォールバック: defaults.jsが読み込まれていない場合のデフォルト値
  console.warn('CONFIG not found. Using fallback defaults.');
  return {
    status: "未",
    maker: "三菱以外",
    paid: "有償警告",
    paidMakerWarranty: false,
    showCcName: true,
    newyear: false,
    checks: {
      "status-urgent": false,
      "status-note": false,
      "status-name": false,
      "status-delay": true,
    },
    texts: {
      statusUrgent: "【至急対応希望】\n",
      statusNote: "備考要確認\n",
      statusName: "奥様の名前の聴取をお願いします。\n",
      statusPaid: "有償警告",
      statusDelay: "お日にちがかかる可能性案内"
    },
    animation: {
      flashColor: '#ffeb3b',
      flashDuration: 500
    }
  };
}

// 設定を読み込む
const config = getConfig();
const DEFAULT_TEXTS = config.texts;
const DEFAULTS = {
  status: config.status,
  maker: config.maker,
  paid: config.paid,
  paidMakerWarranty: config.paidMakerWarranty,
  showCcName: config.showCcName,
  newyear: config.newyear,
  checks: config.checks
};
const ANIMATION_CONFIG = config.animation;

// ==========================================
// 状態管理
// ==========================================

// 状態を保持するオブジェクト
const state = {
  statusUrgentText: DEFAULT_TEXTS.statusUrgent,
  statusNoteText: DEFAULT_TEXTS.statusNote,
  statusNameText: DEFAULT_TEXTS.statusName,
  statusPaidText: DEFAULT_TEXTS.statusPaid,
  statusDelayText: DEFAULT_TEXTS.statusDelay
};

// targetId に対応する最新の表示文字列を返す
function getTextFor(targetId) {
  switch (targetId) {
    case "status-urgent":
      return state.statusUrgentText;
    case "status-note":
      return "・" + state.statusNoteText;
    case "status-name":
      return "・" + state.statusNameText;
    case "status-delay":
      return "・" + state.statusDelayText;
    default:
      return "";
  }
}

// 状態を更新する関数
function updateStateText(key, value) {
  if (state.hasOwnProperty(key)) {
    state[key] = value;
  }
}

// ==========================================
// ユーティリティ関数
// ==========================================

// 要素ごとの元の背景色とタイマーを保持するWeakMap
const elementFlashData = new WeakMap();

// 指定した要素の背景色を一定時間変更する関数
function flashElement(element, color = ANIMATION_CONFIG.flashColor, duration = ANIMATION_CONFIG.flashDuration) {
  if (!element) return;

  // 既存のフラッシュデータを取得または初期化
  let flashData = elementFlashData.get(element);

  if (!flashData) {
    // 初回: 元の背景色を保存
    flashData = {
      originalBackground: element.style.backgroundColor || '',
      timerId: null
    };
    elementFlashData.set(element, flashData);
  }

  // 既存のタイマーがあればクリア
  if (flashData.timerId) {
    clearTimeout(flashData.timerId);
  }

  // 背景色を変更
  element.style.backgroundColor = color;

  // 新しいタイマーを設定
  flashData.timerId = setTimeout(() => {
    element.style.backgroundColor = flashData.originalBackground;
    flashData.timerId = null;
  }, duration);
}

// 現在の日時をフォーマットして返す関数
function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  return `${year}/${month}/${day} ${hours}:${minutes} `;
}

// 現在の日時を表示する関数
function displayCurrentDateTime() {
  const formattedDateTime = getCurrentDateTime();
  const datetimeElement = document.getElementById("current-datetime");
  if (datetimeElement) {
    datetimeElement.textContent = formattedDateTime;
  }
}

// ==========================================
// DOM要素管理と表示更新
// ==========================================

// DOM要素の参照を保持
let elements = {};

// DOM要素を初期化
function initializeElements() {
  elements = {
    statusCheckbox: document.getElementById("status-checkbox"),
    paidStatusCheckbox: document.getElementById("paid-status-checkbox"),
    delayStatusCheckbox: document.getElementById("delay-status-checkbox"),
    makerCheckbox: document.getElementById("maker-checkbox"),
    newyearCheckbox: document.getElementById("newyear-checkbox"),
    showCcNameCheckbox: document.getElementById("show-cc-name-checkbox"),
    paidRadios: document.querySelectorAll(".paid-radio"),
    paidMakerWarrantyCheckbox: document.getElementById("paid-maker-warranty-checkbox"),
    personSelect: document.getElementById("person-select"),
    updateDatetimeBtn: document.getElementById("update-datetime-btn"),
    nameInput: document.getElementById("name-input"),
    checkboxes: document.querySelectorAll(".check-item"),
    makerCheckboxContainer: document.getElementById("maker-checkbox-container"),
    datetimeCcNameContainer: document.getElementById("datetime-cc-name-container")
  };
  return elements;
}

// ステータスチェックボックスの状態を子チェックボックスの状態に基づいて更新する関数
function updateStatusCheckboxState() {
  if (!elements.statusCheckbox || !elements.paidStatusCheckbox || !elements.delayStatusCheckbox) {
    return;
  }

  const paidChecked = elements.paidStatusCheckbox.checked;
  const delayChecked = elements.delayStatusCheckbox.checked;

  if (paidChecked && delayChecked) {
    // 両方チェックされている場合
    elements.statusCheckbox.checked = true;
    elements.statusCheckbox.indeterminate = false;
  } else if (!paidChecked && !delayChecked) {
    // 両方チェックされていない場合
    elements.statusCheckbox.checked = false;
    elements.statusCheckbox.indeterminate = false;
  } else {
    // 混在している場合（不確定状態）
    elements.statusCheckbox.checked = false;
    elements.statusCheckbox.indeterminate = true;
  }

  updateStatusDisplay();
}

// ステータス表示を更新する関数
function updateStatusDisplay() {
  // チェックボックスがチェックされていれば「済」、そうでなければ「未」
  const selectedStatus =
    elements.statusCheckbox && elements.statusCheckbox.checked ? "済" : "未";

  // #status-value を更新（結果表示エリア用、改行付き）
  const statusDisplay = document.getElementById("status-value");
  if (statusDisplay) {
    statusDisplay.textContent = selectedStatus + "\n";
  }

  // #status-display-paid の表示を paid-status-checkbox の値に基づいて更新
  const statusDisplayPaidElement = document.getElementById("status-display-paid");
  if (statusDisplayPaidElement) {
    const paidStatus =
      elements.paidStatusCheckbox && elements.paidStatusCheckbox.checked ? "済" : "未";
    statusDisplayPaidElement.textContent = paidStatus;
    // 背景色を設定（済=薄い緑、未=薄いピンク）
    statusDisplayPaidElement.style.backgroundColor = paidStatus === "済" ? "#d4edda" : "#f8d7da";
  }

  // #status-display-delay の表示を delay-status-checkbox の値に基づいて更新
  const statusDisplayDelayElement = document.getElementById("status-display-delay");
  if (statusDisplayDelayElement) {
    const delayStatus =
      elements.delayStatusCheckbox && elements.delayStatusCheckbox.checked ? "済" : "未";
    statusDisplayDelayElement.textContent = delayStatus;
    // 背景色を設定（済=薄い緑、未=薄いピンク）
    statusDisplayDelayElement.style.backgroundColor = delayStatus === "済" ? "#d4edda" : "#f8d7da";
  }

  // #status-paid の表示状態に応じて #status-display-paid の表示を制御
  const statusPaidElement = document.getElementById("status-paid");
  if (statusPaidElement && statusDisplayPaidElement) {
    const isPaidVisible = statusPaidElement.textContent.trim() !== "";
    statusDisplayPaidElement.style.display = isPaidVisible ? "" : "none";
  }

  // #status-delay の表示状態に応じて #status-display-delay の表示を制御
  const statusDelayElement = document.getElementById("status-delay");
  if (statusDelayElement && statusDisplayDelayElement) {
    const isDelayVisible = statusDelayElement.textContent.trim() !== "";
    statusDisplayDelayElement.style.display = isDelayVisible ? "" : "none";
  }
}

// 有償警告表示を更新する関数
function updatePaidDisplay() {
  const statusPaidElement = document.getElementById("status-paid");

  if (!statusPaidElement) return;

  // ラジオボタンで選択された値を取得
  const selectedRadio = document.querySelector('.paid-radio[name="paid"]:checked');
  const selectedValue = selectedRadio ? selectedRadio.value : "";

  // メーカー保証期間内チェックボックスの状態を確認
  const isMakerWarranty = elements.paidMakerWarrantyCheckbox && elements.paidMakerWarrantyCheckbox.checked;

  // 表示内容を決定
  let displayText = "";

  if (selectedValue) {
    if (isMakerWarranty && selectedValue !== "保証対象外部位有償案内") {
      // メーカー保証期間内がtrueで、保証対象外部位有償案内がfalseの場合
      displayText = "・メーカー保証期間内の有償警告";
    } else {
      // それ以外の場合は選択された値をそのまま表示
      displayText = "・" + selectedValue;
    }
  }

  statusPaidElement.textContent = displayText;

  // status-display要素の表示制御も更新
  updateStatusDisplay();
}

// status-name専用の表示更新関数
function updateStatusNameDisplay(isChecked) {
  const prefixElement = document.getElementById("status-name-prefix");
  const personNameElement = document.getElementById("person-name");
  const suffixElement = document.getElementById("status-name-suffix");

  if (isChecked) {
    // チェックされている場合：3つの要素に分けて表示
    if (prefixElement) prefixElement.textContent = "・";
    if (personNameElement) personNameElement.textContent = elements.personSelect.value;
    if (suffixElement) suffixElement.textContent = "の名前の聴取をお願いします。\n";
  } else {
    // チェックされていない場合：すべて空に
    if (prefixElement) prefixElement.textContent = "";
    if (personNameElement) personNameElement.textContent = "";
    if (suffixElement) suffixElement.textContent = "";
  }
}

// 全表示を現在の状態で更新する
function updateDisplays() {
  console.log("updateDisplays called");
  elements.checkboxes.forEach((cb) => {
    // status-name の場合は専用関数を使用
    if (cb.dataset.target === "status-name") {
      updateStatusNameDisplay(cb.checked);
    } else {
      const display = document.getElementById(cb.dataset.target);
      display.textContent = cb.checked ? getTextFor(cb.dataset.target) : "";
    }
  });

  // status-display要素の表示制御も更新
  updateStatusDisplay();
}

// 名前表示を更新する関数
function updateNameDisplay() {
  const nameValue = elements.nameInput.value.trim();
  const nameDisplayElement = document.getElementById("name-display");
  if (nameDisplayElement) {
    nameDisplayElement.textContent = nameValue;
  }
}

// CC・名前表示の表示/非表示を更新する関数
function updateCcNameVisibility() {
  if (!elements.showCcNameCheckbox || !elements.datetimeCcNameContainer) {
    return;
  }

  const isVisible = elements.showCcNameCheckbox.checked;

  // trueなら表示、falseなら非表示（div全体を制御）
  elements.datetimeCcNameContainer.style.display = isVisible ? "" : "none";
}

// ==========================================
// イベントハンドラ
// ==========================================

// 名前入力イベントハンドラ
function setupNameInputHandler() {
  if (elements.nameInput) {
    elements.nameInput.addEventListener("input", () => {
      updateNameDisplay();
    });
  }
}

// CC・名前表示チェックボックスイベントハンドラ
function setupShowCcNameCheckboxHandler() {
  if (elements.showCcNameCheckbox) {
    elements.showCcNameCheckbox.addEventListener("change", () => {
      updateCcNameVisibility();
    });
  }
}

// 日時更新ボタンイベントハンドラ
function setupDatetimeButtonHandler() {
  if (elements.updateDatetimeBtn) {
    elements.updateDatetimeBtn.addEventListener("click", () => {
      displayCurrentDateTime();
    });
  }
}

// 呼称select変更イベントハンドラ
function setupPersonSelectHandler() {
  if (elements.personSelect) {
    elements.personSelect.addEventListener("change", () => {
      const selectedPerson = elements.personSelect.value;
      updateStateText('statusNameText', selectedPerson + "の名前の聴取をお願いします。\n");

      // person-name要素のみを更新（flashElementはMutationObserverが自動的に実行）
      const personNameElement = document.getElementById("person-name");
      if (personNameElement) {
        personNameElement.textContent = selectedPerson;
      }
    });
  }
}

// ステータスチェックボックス変更イベントハンドラ
function setupStatusCheckboxHandler() {
  if (elements.statusCheckbox) {
    elements.statusCheckbox.addEventListener("change", () => {
      // indeterminateの場合は、クリックでcheckedに変更
      if (elements.statusCheckbox.indeterminate) {
        elements.statusCheckbox.indeterminate = false;
        elements.statusCheckbox.checked = true;
      }

      const isChecked = elements.statusCheckbox.checked;

      // 子チェックボックスを連動させる
      if (elements.paidStatusCheckbox) {
        elements.paidStatusCheckbox.checked = isChecked;
      }
      if (elements.delayStatusCheckbox) {
        elements.delayStatusCheckbox.checked = isChecked;
      }

      updateStatusDisplay();
    });
  }
}

// paid-status-checkbox変更イベントハンドラ
function setupPaidStatusCheckboxHandler() {
  if (elements.paidStatusCheckbox) {
    elements.paidStatusCheckbox.addEventListener("change", () => {
      updateStatusCheckboxState();
      updateStatusDisplay();
    });
  }
}

// delay-status-checkbox変更イベントハンドラ
function setupDelayStatusCheckboxHandler() {
  if (elements.delayStatusCheckbox) {
    elements.delayStatusCheckbox.addEventListener("change", () => {
      updateStatusCheckboxState();
      updateStatusDisplay();
    });
  }
}

// メーカーチェックボックス変更イベントハンドラ
function setupMakerCheckboxHandler() {
  if (elements.makerCheckbox) {
    elements.makerCheckbox.addEventListener("change", () => {
      console.log("maker checkbox changed");
      // 年末年始トークがチェックされている場合は何もしない
      if (elements.newyearCheckbox && elements.newyearCheckbox.checked) {
        return;
      }
      // チェックされていれば「三菱」、そうでなければ「三菱以外」
      const isMitsubishi = elements.makerCheckbox.checked;
      if (isMitsubishi) {
        // 三菱
        updateStateText('statusDelayText', "通常よりお日にちがかかる可能性案内");
      } else {
        // 三菱以外
        updateStateText('statusDelayText', "お日にちがかかる可能性案内");
      }
      // 表示を再描画
      updateDisplays();
    });
  }
}

// 年末年始トークチェックボックス変更イベントハンドラ
function setupNewyearCheckboxHandler() {
  if (elements.newyearCheckbox) {
    elements.newyearCheckbox.addEventListener("change", () => {
      console.log("newyear checkbox changed");

      if (elements.newyearCheckbox.checked) {
        // チェックされている場合は「年末年始トーク」に変更
        updateStateText('statusDelayText', "年末年始トーク");
        // 三菱チェックボックスを非表示
        if (elements.makerCheckboxContainer) {
          elements.makerCheckboxContainer.style.display = "none";
        }
      } else {
        // チェックが外れた場合は、メーカーチェックボックスの状態に応じて元に戻す
        const isMitsubishi = elements.makerCheckbox && elements.makerCheckbox.checked;
        if (isMitsubishi) {
          updateStateText('statusDelayText', "通常よりお日にちがかかる可能性案内");
        } else {
          updateStateText('statusDelayText', "お日にちがかかる可能性案内");
        }
        // 三菱チェックボックスを表示
        if (elements.makerCheckboxContainer) {
          elements.makerCheckboxContainer.style.display = "";
        }
      }
      // 表示を再描画
      updateDisplays();
    });
  }
}

// 有償警告のイベントハンドラ
function setupPaidHandlers() {
  // ラジオボタンのイベントハンドラ
  elements.paidRadios.forEach((radio) => {
    radio.addEventListener("change", () => {
      updatePaidDisplay();
    });
  });

  // メーカー保証期間内チェックボックスのイベントハンドラ
  if (elements.paidMakerWarrantyCheckbox) {
    elements.paidMakerWarrantyCheckbox.addEventListener("change", () => {
      updatePaidDisplay();
    });
  }
}

// チェックボックス変更イベントハンドラ
function setupCheckboxesHandler() {
  elements.checkboxes.forEach((cb) => {
    cb.addEventListener("change", () => {
      // status-name の場合は専用関数を使用
      if (cb.dataset.target === "status-name") {
        updateStatusNameDisplay(cb.checked);
      } else {
        const display = document.getElementById(cb.dataset.target);
        display.textContent = cb.checked ? getTextFor(cb.dataset.target) : "";
      }

      // status-display要素の表示制御も更新
      updateStatusDisplay();
    });
  });
}

// すべてのイベントハンドラを設定
function setupAllEventHandlers() {
  setupNameInputHandler();
  setupShowCcNameCheckboxHandler();
  setupDatetimeButtonHandler();
  setupPersonSelectHandler();
  setupStatusCheckboxHandler();
  setupPaidStatusCheckboxHandler();
  setupDelayStatusCheckboxHandler();
  setupMakerCheckboxHandler();
  setupNewyearCheckboxHandler();
  setupPaidHandlers();
  setupCheckboxesHandler();
}

// ==========================================
// 初期化
// ==========================================

// 定数から input の初期値を適用する
function applyDefaults() {
  // ステータスチェックボックス（"済"ならtrue、"未"ならfalse）
  if (elements.statusCheckbox) {
    elements.statusCheckbox.checked = DEFAULTS.status === "済";
  }

  // メーカーチェックボックス（"三菱"ならtrue、"三菱以外"ならfalse）
  if (elements.makerCheckbox) {
    elements.makerCheckbox.checked = DEFAULTS.maker === "三菱";
  }

  // 有償警告ラジオボタン
  elements.paidRadios.forEach((r) => {
    r.checked = r.value === DEFAULTS.paid;
  });

  // メーカー保証期間内チェックボックス
  if (elements.paidMakerWarrantyCheckbox) {
    elements.paidMakerWarrantyCheckbox.checked = DEFAULTS.paidMakerWarranty ?? false;
  }

  // CC・名前表示チェックボックス
  if (elements.showCcNameCheckbox) {
    elements.showCcNameCheckbox.checked = DEFAULTS.showCcName ?? true;
  }

  // 年末年始トークチェックボックス
  if (elements.newyearCheckbox) {
    elements.newyearCheckbox.checked = DEFAULTS.newyear ?? false;
    // チェック状態に応じてメーカーチェックボックスの表示を制御
    if (elements.newyearCheckbox.checked && elements.makerCheckboxContainer) {
      elements.makerCheckboxContainer.style.display = "none";
    }
  }

  // チェックボックス
  elements.checkboxes.forEach((cb) => {
    const key = cb.dataset.target;
    cb.checked = !!DEFAULTS.checks[key];
  });

  // statusDelayText を決める（年末年始トークが優先）
  const isNewyear = elements.newyearCheckbox && elements.newyearCheckbox.checked;
  if (isNewyear) {
    updateStateText('statusDelayText', "年末年始トーク");
  } else {
    const isMitsubishi = elements.makerCheckbox && elements.makerCheckbox.checked;
    if (isMitsubishi) {
      updateStateText('statusDelayText', "通常よりお日にちがかかる可能性案内");
    } else {
      updateStateText('statusDelayText', "お日にちがかかる可能性案内");
    }
  }

  // 有償警告表示を初期化
  updatePaidDisplay();

  // ステータス表示を初期化
  updateStatusDisplay();
}

// id="results" 内の要素のテキスト変更を監視
function setupMutationObserver() {
  const resultsElement = document.getElementById('results');
  if (!resultsElement) return;

  // 各要素の以前のテキストを保存
  const previousTextMap = new Map();

  // results内のすべてのspan要素の初期テキストを保存
  resultsElement.querySelectorAll('span').forEach(span => {
    previousTextMap.set(span, span.textContent || '');
  });

  // MutationObserverを使って子要素の変更を監視
  const observer = new MutationObserver((mutations) => {
    // 変更されたspan要素を収集（重複を避ける）
    const changedElements = new Set();

    mutations.forEach((mutation) => {
      let targetElement = null;

      // characterDataの変更（テキストノードの内容変更）
      if (mutation.type === 'characterData') {
        targetElement = mutation.target.parentElement;
      }
      // childListの変更（textContentによる直接設定）
      else if (mutation.type === 'childList') {
        targetElement = mutation.target;
      }

      // span要素の場合のみ処理（.status-displayクラスを除外）
      if (targetElement &&
          targetElement.tagName === 'SPAN' &&
          resultsElement.contains(targetElement) &&
          !targetElement.classList.contains('status-display')) {

        const currentText = targetElement.textContent || '';
        const previousText = previousTextMap.get(targetElement) || '';

        // 実際にテキストが変更された場合のみフラッシュ
        if (currentText !== previousText) {
          changedElements.add(targetElement);
          previousTextMap.set(targetElement, currentText);
        }
      }
    });

    // 変更された要素をフラッシュ
    changedElements.forEach(element => {
      flashElement(element);
    });
  });

  // 監視を開始
  observer.observe(resultsElement, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true
  });
}

// アプリケーションの初期化
function initializeApp() {
  // DOM要素を初期化
  initializeElements();

  // デフォルト値を適用
  applyDefaults();

  // 日時を表示
  displayCurrentDateTime();

  // 初期描画
  updateDisplays();

  // CC・名前表示の初期状態を設定
  updateCcNameVisibility();

  // すべてのイベントハンドラを設定
  setupAllEventHandlers();

  // MutationObserverを設定
  setupMutationObserver();
}

// DOMの読み込みが完了したら初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // すでに読み込まれている場合は即座に実行
  initializeApp();
}
