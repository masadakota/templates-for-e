// JavaScript configuration object for CallFlow (flat keys, no deep nesting)
// This file allows the app to load config when opened via file:// (no HTTP server needed)
window.FLOW_CONFIG = {
  initial: {
    text: "修理のご依頼でしょうか？",
    buttons: [
      {
        label: "はい",
        action: "yes",
        kv: { key: "isRepairRequest", value: "true" },
      },
      {
        label: "いいえ",
        action: "no",
        kv: { key: "isRepairRequest", value: "false" },
      },
    ],
  },

  telephoneNumber: {
    text: "お客様のお電話番号を教えていただけますでしょうか？",
    buttons: [
      {
        label: "OK",
        action: "yes",
        kv: { key: "isTelephoneNumberOk", value: "true" },
      },
    ],
  },

  manufacturer: {
    text: "メーカーはどちらでしょうか？",
    default: "未選択",
    manufacturerOptions: ["三菱", "パナソニック", "TOTO", "LIXIL"],
    kv_key: "manufacturer",
  },

  manufacturerConfirm: {
    text: "メーカーは【{manufacturer}】ですね？",
  },
  // ここに続きのフローを追加する。
};
