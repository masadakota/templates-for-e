// デフォルト値の設定ファイル
// このファイルを編集することで、チェックボックスやラジオボタンのデフォルト値を変更できます

const CONFIG = {
  // ステータス: "済" または "未"
  status: "未",

  // メーカー: "三菱" または "三菱以外"
  maker: "三菱以外",

  // 有償警告ラジオボタンのデフォルト値: "有償警告" または "保証対象外部位有償案内"
  paid: "有償警告",

  // メーカー保証期間内チェックボックスのデフォルト状態 (true/false)
  paidMakerWarranty: false,

  // CC・名前表示のデフォルト状態 (true/false)
  showCcName: true,

  // チェックボックスのデフォルト状態 (true/false)
  checks: {
    "status-urgent": false,  // 至急対応希望
    "status-note": false,     // 備考要確認
    "status-name": false,     // 名前の聴取
    "status-delay": true      // お日にちがかかる可能性
  },

  // 年末年始トークチェックボックスのデフォルト状態 (true/false)
  newyear: true,

  // 各種テキストメッセージ
  texts: {
    statusUrgent: "【至急対応希望】\n",
    statusNote: "備考要確認\n",
    statusName: "奥様の名前の聴取をお願いします。\n",
    statusPaid: "有償警告",
    statusDelay: "お日にちがかかる可能性案内"
  },

  // アニメーション設定
  animation: {
    flashColor: "#ffeb3b",    // ハイライト色
    flashDuration: 500        // ハイライト時間（ミリ秒）
  }
};
