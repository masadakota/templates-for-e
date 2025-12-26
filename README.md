# 後処理テンプレ

## ファイル構成

### HTMLファイル
- **[src/templates.html](src/templates.html)** - メインのHTMLファイル（ブラウザで直接開けます）

### CSSファイル
- **[src/styles/templates.css](src/styles/templates.css)** - スタイル定義

### JavaScriptファイル
- **[src/scripts/templates.js](src/scripts/templates.js)** - すべての機能を含むメインスクリプト
- **[src/copy-handler.js](src/copy-handler.js)** - コピー機能（既存）

### 設定ファイル
- **[src/config/defaults.js](src/config/defaults.js)** - デフォルト値の設定（チェックボックス、ラジオボタン、テキスト等）

## 使用方法

### ローカルで使用（Webサーバー不要）

1. [src/templates.html](src/templates.html) をブラウザで直接開く
2. file:// プロトコルで動作します（CORSの問題なし）

### デフォルト値のカスタマイズ

[src/config/defaults.js](src/config/defaults.js) を編集することで、チェックボックスやラジオボタンのデフォルト値を変更できます。

**設定可能な項目:**
- `status`: "済" または "未" - 案内済チェックボックスのデフォルト値
- `maker`: "三菱" または "三菱以外" - メーカーチェックボックスのデフォルト値
- `paid`: "有償警告" など - 有償警告ラジオボタンのデフォルト値
- `checks`: 各チェックボックスのデフォルト状態 (true/false)
  - `status-urgent`: 至急対応希望
  - `status-note`: 備考要確認
  - `status-name`: 名前の聴取
  - `status-delay`: お日にちがかかる可能性
- `texts`: 各種テキストメッセージ
- `animation`: アニメーション設定（色、時間）

**例:**
```javascript
const CONFIG = {
  status: "済",
  checks: {
    "status-delay": false
  }
};
```

### コードの構成

[src/scripts/templates.js](src/scripts/templates.js) は以下のセクションに分かれています：

1. **定数とデフォルト設定** - アプリケーション全体で使用する定数
2. **状態管理** - アプリケーションの状態を管理
3. **ユーティリティ関数** - アニメーション、日時フォーマット等
4. **DOM要素管理と表示更新** - DOM操作と表示ロジック
5. **イベントハンドラ** - ユーザーインタラクションの処理
6. **初期化** - アプリケーションの起動処理

## 開発履歴

### リファクタリング前
- 744行の単一HTMLファイル（HTML、CSS、JavaScript混在）

### リファクタリング後
- HTML: 220行（構造のみ）
- CSS: 28行（スタイルのみ）
- JavaScript: 600行超（機能を整理して統合）

## 改善点

1. **関心の分離** - HTML、CSS、JavaScriptを分離
2. **コードの整理** - 機能ごとにセクション分け
3. **保守性の向上** - 各セクションが単一の責任を持つ
4. **可読性** - コメントとセクション分けで理解しやすい構造
5. **Webサーバー不要** - file://プロトコルで直接実行可能
