// ==========================================
// 定数とデフォルト設定
// ==========================================

// デフォルト値を取得する関数
// config/defaults.js で定義されたCONFIGオブジェクトが存在すれば使用、なければフォールバック
function getConfig() {
  // グローバルのCONFIGオブジェクトがあればそれを使用
  if (typeof CONFIG !== "undefined") {
    return CONFIG;
  }

  // フォールバック: defaults.jsが読み込まれていない場合のデフォルト値
  console.warn("CONFIG not found. Using fallback defaults.");
  return {
    status: "未",
    maker: "三菱以外",
    paid: "有償警告",
    paidMakerWarranty: false,
    showDatetimeName: true,
    newyear: false,
    checks: {
      "status-urgent": false,
      "status-note": false,
      "status-name": false,
      // "status-delay": true,
    },
    texts: {
      statusUrgent: "【至急対応希望】\n",
      statusNote: "備考要確認\n",
      statusName: "奥様の名前の聴取\n",
      statusPaid: "有償警告",
      statusDelay: "お日にちがかかる可能性案内",
    },
    animation: {
      flashColor: "#ffeb3b",
      flashDuration: 300,
    },
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
  showDatetimeName: config.showDatetimeName,
  newyear: config.newyear,
  checks: config.checks,
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
  statusDelayText: DEFAULT_TEXTS.statusDelay,
  dealerInformed: false, // 販売店にて案内済みの状態
  paidStatus: false, // 有償警告の案内済み状態
  delayStatus: false, // お日にちがかかる可能性の案内済み状態
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
function flashElement(
  element,
  color = ANIMATION_CONFIG.flashColor,
  duration = ANIMATION_CONFIG.flashDuration
) {
  if (!element) return;

  // 既存のフラッシュデータを取得または初期化
  let flashData = elementFlashData.get(element);

  if (!flashData) {
    // 初回: 元の背景色を保存
    flashData = {
      originalBackground: element.style.backgroundColor || "",
      timerId: null,
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
    mitsubishiCheckbox: document.getElementById("mitsubishi-checkbox"),
    newyearCheckbox: document.getElementById("newyear-checkbox"),
    showDatetimeNameCheckbox: document.getElementById(
      "show-datetime-name-checkbox"
    ),
    detailedViewCheckbox: document.getElementById("detailed-view-checkbox"),
    paidRadios: document.querySelectorAll(".paid-radio"),
    paidMakerWarrantyCheckbox: document.getElementById(
      "paid-maker-warranty-checkbox"
    ),
    dealerInformedCheckbox: document.getElementById("dealer-informed-checkbox"),
    personSelect: document.getElementById("person-select"),
    updateDatetimeBtn: document.getElementById("update-datetime-btn"),
    resetBtn: document.getElementById("reset-btn"),
    nameInput: document.getElementById("name-input"),
    checkboxes: document.querySelectorAll(".check-item"),
    datetimeNameContainer: document.getElementById("datetime-name-container"),
    shortcutYuMi: document.getElementById("shortcut-yu-mi"),
    shortcutYuSumi: document.getElementById("shortcut-yu-sumi"),
    shortcutMeMi: document.getElementById("shortcut-me-mi"),
    shortcutMeSumi: document.getElementById("shortcut-me-sumi"),
    shortcutGaiMi: document.getElementById("shortcut-gai-mi"),
    shortcutGaiSumi: document.getElementById("shortcut-gai-sumi"),
  };
  return elements;
}

// ステータスチェックボックスの状態を子チェックボックスの状態に基づいて更新する関数
function updateStatusCheckboxState() {
  if (
    !elements.statusCheckbox ||
    !elements.paidStatusCheckbox ||
    !elements.delayStatusCheckbox
  ) {
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

  // #status-display-paid の表示を状態に基づいて更新
  const statusDisplayPaidElement = document.getElementById(
    "status-display-paid"
  );
  if (statusDisplayPaidElement) {
    const paidStatusText = state.paidStatus ? "済" : "未";
    statusDisplayPaidElement.textContent = paidStatusText;
    // 背景色を設定（済=薄い緑、未=薄いピンク）
    statusDisplayPaidElement.style.backgroundColor = state.paidStatus
      ? "#d4edda"
      : "#f8d7da";
  }

  // #status-display-delay の表示を状態に基づいて更新
  const statusDisplayDelayElement = document.getElementById(
    "status-display-delay"
  );
  if (statusDisplayDelayElement) {
    const delayStatusText = state.delayStatus ? "済" : "未";
    statusDisplayDelayElement.textContent = delayStatusText;
    // 背景色を設定（済=薄い緑、未=薄いピンク）
    statusDisplayDelayElement.style.backgroundColor = state.delayStatus
      ? "#d4edda"
      : "#f8d7da";
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
  const dealerInformedDisplayElement = document.getElementById(
    "dealer-informed-display"
  );

  if (!statusPaidElement) return;

  // ラジオボタンで選択された値を取得
  const selectedRadio = document.querySelector(
    '.paid-radio[name="paid"]:checked'
  );
  const selectedValue = selectedRadio ? selectedRadio.value : "";

  // メーカー保証期間内チェックボックスの状態を確認
  const isMakerWarranty =
    elements.paidMakerWarrantyCheckbox &&
    elements.paidMakerWarrantyCheckbox.checked;

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

  // 販売店にて案内済みの表示を更新
  if (dealerInformedDisplayElement) {
    dealerInformedDisplayElement.textContent = state.dealerInformed
      ? " (販売店にて案内済み)"
      : "";
  }

  // status-display要素の表示制御も更新
  updateStatusDisplay();
}

// 状態に基づいてチェックボックスを更新する関数
function updateCheckboxesFromState() {
  // paid-status-checkboxを更新
  if (elements.paidStatusCheckbox) {
    elements.paidStatusCheckbox.checked = state.paidStatus;
  }

  // delay-status-checkboxを更新
  if (elements.delayStatusCheckbox) {
    elements.delayStatusCheckbox.checked = state.delayStatus;
  }

  // ステータスチェックボックスの状態を更新
  updateStatusCheckboxState();
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
    if (personNameElement)
      personNameElement.textContent = elements.personSelect.value;
    if (suffixElement) suffixElement.textContent = "の名前の聴取\n";
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

  // status-delay要素を直接更新（チェックボックスが削除されたため）
  const statusDelayElement = document.getElementById("status-delay");
  if (statusDelayElement) {
    statusDelayElement.textContent = "・" + state.statusDelayText;
  }

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
function updateDatetimeNameVisibility() {
  if (!elements.showDatetimeNameCheckbox || !elements.datetimeNameContainer) {
    return;
  }

  const isVisible = elements.showDatetimeNameCheckbox.checked;

  // trueなら表示、falseなら非表示（div全体を制御）
  elements.datetimeNameContainer.style.display = isVisible ? "" : "none";
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

// 日時・名前表示チェックボックスイベントハンドラ
function setupShowDatetimeNameCheckboxHandler() {
  if (elements.showDatetimeNameCheckbox) {
    elements.showDatetimeNameCheckbox.addEventListener("change", () => {
      updateDatetimeNameVisibility();
    });
  }
}

// 詳細表示チェックボックスイベントハンドラ
function setupDetailedViewCheckboxHandler() {
  if (elements.detailedViewCheckbox) {
    elements.detailedViewCheckbox.addEventListener("change", () => {
      updateDetailedViewVisibility();
    });
  }
}

// 詳細表示の表示/非表示を切り替える関数
function updateDetailedViewVisibility() {
  const isDetailedView =
    elements.detailedViewCheckbox && elements.detailedViewCheckbox.checked;
  const detailedSections = document.querySelectorAll(".detailed-section");

  detailedSections.forEach((section) => {
    if (isDetailedView) {
      section.style.display = "";
    } else {
      section.style.display = "none";
    }
  });
}

// 日時更新ボタンイベントハンドラ
function setupDatetimeButtonHandler() {
  if (elements.updateDatetimeBtn) {
    elements.updateDatetimeBtn.addEventListener("click", () => {
      displayCurrentDateTime();
    });
  }
}

// リセットボタンイベントハンドラ
function setupResetButtonHandler() {
  if (elements.resetBtn) {
    elements.resetBtn.addEventListener("click", () => {
      // オペレーター名を保存
      const currentName = elements.nameInput ? elements.nameInput.value : "";

      // デフォルト値を再適用
      applyDefaults();

      // オペレーター名を復元
      if (elements.nameInput) {
        elements.nameInput.value = currentName;
        updateNameDisplay();
      }

      // 日時を更新
      displayCurrentDateTime();

      // 表示を更新
      updateDisplays();
    });
  }
}

// ショートカット処理のヘルパー関数
function applyShortcut(options = {}) {
  const {
    paidStatus = undefined,
    delayStatus = undefined,
    dealerInformed = undefined,
    applyDefaultsFirst = false,
  } = options;

  // デフォルト値を適用する場合
  if (applyDefaultsFirst) {
    // オペレーター名を保存
    const currentName = elements.nameInput ? elements.nameInput.value : "";

    // デフォルト値を適用
    applyDefaults();

    // オペレーター名を復元
    if (elements.nameInput) {
      elements.nameInput.value = currentName;
      updateNameDisplay();
    }
  }

  // 状態を更新（undefinedでない値のみ）
  if (paidStatus !== undefined) {
    state.paidStatus = paidStatus;
    if (elements.paidStatusCheckbox) {
      elements.paidStatusCheckbox.checked = paidStatus;
    }
  }

  if (delayStatus !== undefined) {
    state.delayStatus = delayStatus;
    if (elements.delayStatusCheckbox) {
      elements.delayStatusCheckbox.checked = delayStatus;
    }
  }

  if (dealerInformed !== undefined) {
    state.dealerInformed = dealerInformed;
    if (elements.dealerInformedCheckbox) {
      elements.dealerInformedCheckbox.checked = dealerInformed;
    }
  }

  // 日時を更新
  displayCurrentDateTime();

  // 表示を更新
  updateDisplays();
  updatePaidDisplay();
  updateDatetimeNameVisibility();

  // カスタムイベントを発火（DOM更新後）
  requestAnimationFrame(() => {
    const resultsElement = document.getElementById("results");
    if (resultsElement) {
      resultsElement.dispatchEvent(
        new CustomEvent("autoCopyResults", {
          bubbles: true,
          detail: {
            source: "shortcut-button",
            timestamp: Date.now(),
          },
        })
      );
    }
  });
}

// ショートカットボタンのイベントハンドラ
function setupShortcutButtonsHandler() {
  // 有未ボタン
  if (elements.shortcutYuMi) {
    elements.shortcutYuMi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: false,
        delayStatus: false,
        dealerInformed: false,
      });
    });
  }

  // 有済ボタン
  if (elements.shortcutYuSumi) {
    elements.shortcutYuSumi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: true,
        delayStatus: true,
      });
    });
  }

  // メーカー保証/未ボタン
  if (elements.shortcutMeMi) {
    elements.shortcutMeMi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: false,
        delayStatus: false,
      });
      // paidMakerWarrantyをtrueに設定
      if (elements.paidMakerWarrantyCheckbox) {
        elements.paidMakerWarrantyCheckbox.checked = true;
        updatePaidDisplay();
      }
    });
  }

  // メーカー保証/済ボタン
  if (elements.shortcutMeSumi) {
    elements.shortcutMeSumi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: true,
        delayStatus: true,
      });
      // paidMakerWarrantyをtrueに設定
      if (elements.paidMakerWarrantyCheckbox) {
        elements.paidMakerWarrantyCheckbox.checked = true;
        updatePaidDisplay();
      }
    });
  }

  // 保証対象外部位/未ボタン
  if (elements.shortcutGaiMi) {
    elements.shortcutGaiMi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: false,
        delayStatus: false,
      });

      // paid radioを「保証対象外部位有償案内」に切り替え
      const outOfWarrantyRadio = document.querySelector(
        'input[name="paid"][value="保証対象外部位有償案内"]'
      );
      if (outOfWarrantyRadio) {
        outOfWarrantyRadio.checked = true;
      }

      // 表示を更新
      updatePaidDisplay();
    });
  }

  // 保証対象外部位/済ボタン
  if (elements.shortcutGaiSumi) {
    elements.shortcutGaiSumi.addEventListener("click", () => {
      applyShortcut({
        applyDefaultsFirst: true,
        paidStatus: true,
        delayStatus: true,
      });

      // paid radioを「保証対象外部位有償案内」に切り替え
      const outOfWarrantyRadio = document.querySelector(
        'input[name="paid"][value="保証対象外部位有償案内"]'
      );
      if (outOfWarrantyRadio) {
        outOfWarrantyRadio.checked = true;
      }

      // 表示を更新
      updatePaidDisplay();
    });
  }
}

// 呼称select変更イベントハンドラ
function setupPersonSelectHandler() {
  if (elements.personSelect) {
    elements.personSelect.addEventListener("change", () => {
      const selectedPerson = elements.personSelect.value;
      updateStateText("statusNameText", selectedPerson + "の名前の聴取\n");

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

      // 状態を更新
      state.paidStatus = isChecked;
      state.delayStatus = isChecked;

      // 状態に基づいてUIを更新
      updateCheckboxesFromState();
    });
  }
}

// paid-status-checkbox変更イベントハンドラ
function setupPaidStatusCheckboxHandler() {
  if (elements.paidStatusCheckbox) {
    elements.paidStatusCheckbox.addEventListener("change", () => {
      // 状態を更新
      state.paidStatus = elements.paidStatusCheckbox.checked;

      // UIを更新
      updateStatusCheckboxState();
      updateStatusDisplay();
    });
  }
}

// delay-status-checkbox変更イベントハンドラ
function setupDelayStatusCheckboxHandler() {
  if (elements.delayStatusCheckbox) {
    elements.delayStatusCheckbox.addEventListener("change", () => {
      // 状態を更新
      state.delayStatus = elements.delayStatusCheckbox.checked;

      // UIを更新
      updateStatusCheckboxState();
      updateStatusDisplay();
    });
  }
}

// メーカーチェックボックス変更イベントハンドラ
function setupMitsubishiCheckboxHandler() {
  if (elements.mitsubishiCheckbox) {
    elements.mitsubishiCheckbox.addEventListener("change", () => {
      console.log("mitsubishi checkbox changed");
      // 年末年始がチェックされている場合は年末年始トークを維持
      if (elements.newyearCheckbox && elements.newyearCheckbox.checked) {
        updateStateText("statusDelayText", "年末年始トーク");
      } else {
        const isMitsubishi = elements.mitsubishiCheckbox.checked;
        if (isMitsubishi) {
          // 三菱
          updateStateText(
            "statusDelayText",
            "通常よりお日にちがかかる可能性案内"
          );
        } else {
          // 三菱以外
          updateStateText("statusDelayText", "お日にちがかかる可能性案内");
        }
      }
      // 表示を再描画
      updateDisplays();
    });
  }
}

// 年末年始チェックボックス変更イベントハンドラ
function setupNewyearCheckboxHandler() {
  if (elements.newyearCheckbox) {
    elements.newyearCheckbox.addEventListener("change", () => {
      console.log("newyear checkbox changed");

      if (elements.newyearCheckbox.checked) {
        // チェックされている場合は「年末年始トーク」に変更
        updateStateText("statusDelayText", "年末年始トーク");
      } else {
        // チェックが外れた場合は、三菱チェックボックスの状態に応じて元に戻す
        const isMitsubishi = !!(
          elements.mitsubishiCheckbox && elements.mitsubishiCheckbox.checked
        );
        if (isMitsubishi) {
          updateStateText(
            "statusDelayText",
            "通常よりお日にちがかかる可能性案内"
          );
        } else {
          updateStateText("statusDelayText", "お日にちがかかる可能性案内");
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

// 販売店にて案内済みチェックボックス変更イベントハンドラ
function setupDealerInformedCheckboxHandler() {
  if (elements.dealerInformedCheckbox) {
    elements.dealerInformedCheckbox.addEventListener("change", () => {
      // 状態を更新
      state.dealerInformed = elements.dealerInformedCheckbox.checked;
      state.paidStatus = elements.dealerInformedCheckbox.checked;

      // 有償警告表示を更新
      updatePaidDisplay();

      // 状態に基づいてUIを更新
      updateCheckboxesFromState();
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
  setupShowDatetimeNameCheckboxHandler();
  setupDetailedViewCheckboxHandler();
  setupDatetimeButtonHandler();
  setupResetButtonHandler();
  setupShortcutButtonsHandler();
  setupPersonSelectHandler();
  setupStatusCheckboxHandler();
  setupPaidStatusCheckboxHandler();
  setupDelayStatusCheckboxHandler();
  setupMitsubishiCheckboxHandler();
  setupNewyearCheckboxHandler();
  setupPaidHandlers();
  setupDealerInformedCheckboxHandler();
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

  // 三菱チェックボックス
  if (elements.mitsubishiCheckbox) {
    elements.mitsubishiCheckbox.checked = DEFAULTS.isMitsubishi;
  }

  // 有償警告ラジオボタン
  elements.paidRadios.forEach((r) => {
    r.checked = r.value === DEFAULTS.paid;
  });

  // メーカー保証期間内チェックボックス
  if (elements.paidMakerWarrantyCheckbox) {
    elements.paidMakerWarrantyCheckbox.checked =
      DEFAULTS.paidMakerWarranty ?? false;
  }

  // 日時・名前表示チェックボックス
  if (elements.showDatetimeNameCheckbox) {
    elements.showDatetimeNameCheckbox.checked =
      DEFAULTS.showDatetimeName ?? true;
  }

  // 年末年始チェックボックス
  if (elements.newyearCheckbox) {
    elements.newyearCheckbox.checked = DEFAULTS.newyear ?? false;
  }

  // チェックボックス
  elements.checkboxes.forEach((cb) => {
    const key = cb.dataset.target;
    cb.checked = !!DEFAULTS.checks[key];
  });

  // statusDelayText を決める（年末年始トークが優先）
  const isNewyear =
    elements.newyearCheckbox && elements.newyearCheckbox.checked;
  if (isNewyear) {
    updateStateText("statusDelayText", "年末年始トーク");
  } else {
    const isMitsubishi = !!(
      elements.mitsubishiCheckbox && elements.mitsubishiCheckbox.checked
    );
    if (isMitsubishi) {
      updateStateText("statusDelayText", "通常よりお日にちがかかる可能性案内");
    } else {
      updateStateText("statusDelayText", "お日にちがかかる可能性案内");
    }
  }

  // 状態を初期化
  state.dealerInformed = false;
  state.paidStatus = false;
  state.delayStatus = false;

  // チェックボックスの状態を初期化
  if (elements.dealerInformedCheckbox) {
    elements.dealerInformedCheckbox.checked = false;
  }
  if (elements.paidStatusCheckbox) {
    elements.paidStatusCheckbox.checked = false;
  }
  if (elements.delayStatusCheckbox) {
    elements.delayStatusCheckbox.checked = false;
  }

  // 有償警告表示を初期化
  updatePaidDisplay();

  // ステータス表示を初期化
  updateStatusDisplay();

  // status-delay要素にテキストを設定（チェックボックスが削除されたため直接設定）
  const statusDelayElement = document.getElementById("status-delay");
  if (statusDelayElement) {
    statusDelayElement.textContent = "・" + state.statusDelayText;
  }
}

// id="results" 内の要素のテキスト変更を監視
function setupMutationObserver() {
  const resultsElement = document.getElementById("results");
  if (!resultsElement) return;

  // 各要素の以前のテキストを保存
  const previousTextMap = new Map();

  // results内のすべてのspan要素の初期テキストを保存
  resultsElement.querySelectorAll("span").forEach((span) => {
    previousTextMap.set(span, span.textContent || "");
  });

  // MutationObserverを使って子要素の変更を監視
  const observer = new MutationObserver((mutations) => {
    // 変更されたspan要素を収集（重複を避ける）
    const changedElements = new Set();

    mutations.forEach((mutation) => {
      let targetElement = null;

      // characterDataの変更（テキストノードの内容変更）
      if (mutation.type === "characterData") {
        targetElement = mutation.target.parentElement;
      }
      // childListの変更（textContentによる直接設定）
      else if (mutation.type === "childList") {
        targetElement = mutation.target;
      }

      // span要素の場合のみ処理（.status-displayクラスを除外）
      if (
        targetElement &&
        targetElement.tagName === "SPAN" &&
        resultsElement.contains(targetElement) &&
        !targetElement.classList.contains("status-display")
      ) {
        const currentText = targetElement.textContent || "";
        const previousText = previousTextMap.get(targetElement) || "";

        // 実際にテキストが変更された場合のみフラッシュ
        if (currentText !== previousText) {
          changedElements.add(targetElement);
          previousTextMap.set(targetElement, currentText);
        }
      }
    });

    // 変更された要素をフラッシュ
    changedElements.forEach((element) => {
      flashElement(element);
    });
  });

  // 監視を開始
  observer.observe(resultsElement, {
    childList: true,
    subtree: true,
    characterData: true,
    characterDataOldValue: true,
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

  // 日時・名前表示の初期状態を設定
  updateDatetimeNameVisibility();

  // 詳細表示の初期状態を設定
  updateDetailedViewVisibility();

  // すべてのイベントハンドラを設定
  setupAllEventHandlers();

  // MutationObserverを設定
  setupMutationObserver();
}

// DOMの読み込みが完了したら初期化
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeApp);
} else {
  // すでに読み込まれている場合は即座に実行
  initializeApp();
}
