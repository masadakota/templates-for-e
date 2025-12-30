# 後処理テンプレ

## ファイル構成

### エントリーポイント
- **[index.html](index.html)** - アプリケーション選択画面
- **[templates/index.html](templates/index.html)** - 後処理テンプレアプリ

### 共有コード（ルート直下）

**新しいアーキテクチャ（React/Next.jsパターン）:**
- **[scripts/app.js](scripts/app.js)** - 新しいエントリーポイント（ES Module）
- **[store/StateManager.js](store/StateManager.js)** - 状態管理クラス（Redux/Zustandパターン）
- **[store/initialState.js](store/initialState.js)** - 初期状態定義
- **[store/selectors/statusSelectors.js](store/selectors/statusSelectors.js)** - 派生状態の計算
- **[utils/dom.js](utils/dom.js)** - DOM操作ユーティリティ

**レガシーコード（段階的に移行予定）:**
- **[scripts/templates.js](scripts/templates.js)** - 既存のメインスクリプト
- **[copy-handler.js](copy-handler.js)** - コピー機能

**スタイル:**
- **[styles/templates.css](styles/templates.css)** - スタイル定義
- **[styles/copy-handler.css](styles/copy-handler.css)** - コピーアニメーション

**設定:**
- **[config/defaults.js](config/defaults.js)** - デフォルト値の設定

**コンポーネント:**
- **[components/outbound.html](components/outbound.html)** - 架電用コンポーネント
- **[components/inbound.html](components/inbound.html)** - 受電用コンポーネント

## 使用方法

### ローカルで使用（Webサーバー不要）

1. [index.html](index.html) をブラウザで直接開く（アプリ選択画面）
2. または [templates/index.html](templates/index.html) を直接開く
3. file:// プロトコルで動作します（CORSの問題なし）
4. ES Modulesを使用（モダンブラウザ: Chrome, Firefox, Edge, Safari）

### デバッグ

ブラウザのDevTools Consoleで以下が利用可能:

```javascript
// 現在の状態を確認
window.__STORE__.getState()

// 状態変更履歴を確認
window.__STORE__.getHistory()

// 前の状態に戻る（タイムトラベルデバッグ）
window.__STORE__.undo()
```

### デフォルト値のカスタマイズ

[config/defaults.js](config/defaults.js) を編集することで、チェックボックスやラジオボタンのデフォルト値を変更できます。

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
    // "status-delay": false
  }
};
```

### コードの構成

[scripts/templates.js](scripts/templates.js) は以下のセクションに分かれています：

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

### Phase 1（完了）- 基盤構築

1. **React/Next.jsパターンの導入** - StateManager、Selectors、Utilities
2. **状態管理の一元化** - Redux/Zustand風の状態管理クラス
3. **イミュータブルな状態更新** - 予測可能な状態変更
4. **タイムトラベルデバッグ** - 状態変更履歴の追跡とundo機能
5. **モジュラーな構造** - ES Modulesによるコード分割
6. **後方互換性** - 既存コードと並行動作

### 今後の予定（Phase 2以降）

- コンポーネントクラスの抽出（StatusCheckbox、DateTimeDisplayなど）
- カスタムフック的な再利用可能ロジック
- イベントハンドラーの段階的移行
- templates.jsの縮小・削除

詳細は [CLAUDE.md](CLAUDE.md) を参照してください。
