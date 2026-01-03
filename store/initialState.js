/**
 * Initial State Factory
 *
 * Creates the initial state object for the application.
 * Uses CONFIG from defaults.js if available, otherwise uses fallback values.
 */

/**
 * Create initial state from configuration
 * @param {Object} config - Configuration object from defaults.js
 * @returns {Object} Initial state
 */
export function createInitialState(config = {}) {
  // Fallback defaults if CONFIG is not loaded
  const defaultConfig = {
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
      "model-check": false,
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

  // Merge with provided config
  const mergedConfig = { ...defaultConfig, ...config };
  const texts = { ...defaultConfig.texts, ...(config.texts || {}) };
  const checks = { ...defaultConfig.checks, ...(config.checks || {}) };
  const animation = { ...defaultConfig.animation, ...(config.animation || {}) };

  return {
    // Text content state
    texts: {
      statusUrgent: texts.statusUrgent,
      statusName: texts.statusName,
      statusNote: texts.statusNote,
      statusPaid: texts.statusPaid,
      statusDelay: texts.statusDelay,
    },

    // Checkbox/radio states
    checkboxes: {
      statusUrgent: checks["status-urgent"],
      statusName: checks["status-name"],
      statusNote: checks["status-note"],
      modelCheck: checks["model-check"],
      // statusDelay: checks["status-delay"],
      mitsubishi: mergedConfig.maker === "三菱",
      newyear: mergedConfig.newyear,
      showDatetimeName: mergedConfig.showDatetimeName,
    },

    // Status tracking
    status: {
      main: mergedConfig.status === "済",
      dealerInformed: false,
      paidStatus: false,
      delayStatus: false,
    },

    // Form values
    forms: {
      paidRadio: mergedConfig.paid,
      paidMakerWarranty: mergedConfig.paidMakerWarranty,
      personSelect: "奥様",
      nameInput: "",
    },

    // UI state
    ui: {
      showDatetimeName: mergedConfig.showDatetimeName,
      mitsubishiCheckboxVisible: !mergedConfig.newyear,
      currentDateTime: "",
    },

    // Animation config
    animation: {
      flashColor: animation.flashColor,
      flashDuration: animation.flashDuration,
    },

    // Metadata
    _meta: {
      lastUpdate: Date.now(),
      version: "1.0.0",
    }
  };
}

export default createInitialState;
