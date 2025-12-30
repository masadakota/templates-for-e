# 後処理テンプレ - プロジェクトドキュメント

## プロジェクト概要

このプロジェクトは、コールセンターの後処理作業を効率化するためのテンプレート生成Webアプリケーションです。
チェックボックスやフォーム入力から自動的に定型文を生成し、右クリックでクリップボードにコピーできます。

**重要な特徴:**
- ✅ file://プロトコルで動作（Webサーバー不要）
- ✅ Pure Vanilla JavaScript（フレームワーク不要）
- ✅ ローカルファイルとして直接ブラウザで開ける
- ✅ 設定ファイルでデフォルト値をカスタマイズ可能

## 現在のファイル構成

### エントリーポイント

**アプリ選択画面:**
- [index.html](index.html) - ルートエントリーポイント（複数アプリの選択画面）

**個別アプリ:**
- [templates/index.html](templates/index.html) - 後処理テンプレアプリ

**サブコンポーネント（iframe）:**
- [components/outbound.html](components/outbound.html) - 架電用コンポーネント
- [components/inbound.html](components/inbound.html) - 受電用コンポーネント

### JavaScript（ルート直下）

**新しいアーキテクチャ:**
- [scripts/app.js](scripts/app.js) - 新エントリーポイント（ES Module）
- [store/StateManager.js](store/StateManager.js) - 状態管理クラス
- [store/initialState.js](store/initialState.js) - 初期状態定義
- [store/selectors/statusSelectors.js](store/selectors/statusSelectors.js) - セレクター
- [utils/dom.js](utils/dom.js) - DOM操作ユーティリティ

**レガシーコード:**
- [scripts/templates.js](scripts/templates.js) - 既存メインロジック（785行）
- [copy-handler.js](copy-handler.js) - クリップボードコピー機能

**設定:**
- [config/defaults.js](config/defaults.js) - デフォルト設定

**未使用ファイル（削除候補）:**
- [scripts/main.js](scripts/main.js) - フローダイアグラム用（別機能）
- [components/flowDiagram.js](components/flowDiagram.js) - 空の実装
- [components/flowControls.js](components/flowControls.js) - 空の実装
- [utils/index.js](utils/index.js) - 未使用

### CSS（styles/）

- [styles/templates.css](styles/templates.css) - メインスタイル
- [styles/copy-handler.css](styles/copy-handler.css) - コピーアニメーション
- [styles/main.css](styles/main.css) - フローダイアグラム用（別機能）

## アーキテクチャの問題点

### 1. モノリシックなコード構成

**問題:**
- `templates.js` が785行の単一ファイル
- 状態管理、イベント処理、DOM操作がすべて混在
- 機能の追加・変更が困難

**現在の構造:**
```
templates.js (785行)
├── 設定読み込み (54行)
├── 状態管理 (37行)
├── ユーティリティ関数 (63行)
├── DOM管理・表示更新 (227行)
├── イベントハンドラー (226行)
└── 初期化 (172行)
```

### 2. グローバルな可変状態

**問題:**
```javascript
const state = {
  statusUrgentText: "...",
  dealerInformed: false,
  paidStatus: false,
  delayStatus: false,
};
```

- グローバルな可変オブジェクト
- 状態変更の追跡が困難
- デバッグが難しい
- テストが書きづらい

### 3. 密結合なイベントハンドラー

**問題:**
- 12個以上の個別setup関数
- イベントハンドラー間の依存関係が不明確
- カスケード更新による予期しない動作

**例:**
```javascript
function setupStatusCheckboxHandler() {
  // 状態を更新
  state.paidStatus = isChecked;
  state.delayStatus = isChecked;

  // 複数の更新関数を呼び出し
  updateCheckboxesFromState();
  updateStatusCheckboxState();
  updateStatusDisplay();
}
```

### 4. 命令的なDOM操作

**問題:**
- 要素ごとに手動でDOMを更新
- 更新漏れのリスク
- コード重複

**例:**
```javascript
const element = document.getElementById("status-paid");
element.textContent = displayText;
element.style.backgroundColor = isPaid ? "#d4edda" : "#f8d7da";
```

## React/Next.jsパターンへの改善計画

### 目標

Vanilla JavaScriptを維持しつつ、以下のReact/Next.jsパターンを適用:
- ✅ モジュラーなコンポーネント構造
- ✅ 状態管理の一元化（Redux/Zustandパターン）
- ✅ カスタムフック的な再利用可能ロジック
- ✅ 宣言的なUI更新

### 現在のファイル構造（リファクタリング後）

```
d:\projects\web\templates-for-e\
├── index.html                  # ルートエントリーポイント（アプリ選択）
├── templates\                  # 後処理テンプレアプリ
│   └── index.html
├── app\                        # 共有コード（Next.js風）
│   ├── store\                  # 状態管理
│   │   ├── StateManager.js           # コア状態管理クラス ✅
│   │   ├── initialState.js           # 初期状態定義 ✅
│   │   └── selectors\
│   │       └── statusSelectors.js    # 派生状態の計算 ✅
│   ├── components\             # UIコンポーネント
│   │   ├── outbound.html             # 架電用（iframe）
│   │   ├── inbound.html              # 受電用（iframe）
│   │   ├── StatusCheckbox\           # 今後実装
│   │   ├── DateTimeDisplay\
│   │   ├── PaidWarning\
│   │   └── ResultsPanel\
│   ├── hooks\                  # カスタムフック（今後実装）
│   │   ├── useCheckboxState.js
│   │   └── useFlashAnimation.js
│   ├── utils\                  # ユーティリティ
│   │   └── dom.js                    # DOM操作ヘルパー ✅
│   ├── config\
│   │   └── defaults.js               # 設定（既存）
│   ├── styles\
│   │   ├── templates.css
│   │   ├── copy-handler.css
│   │   └── main.css
│   └── scripts\
│       ├── app.js                    # 新エントリーポイント ✅
│       ├── templates.js              # レガシー（移行中）
│       └── main.js                   # フローダイアグラム用
├── CLAUDE.md                   # このファイル
└── README.md
```

## file://プロトコル対応の実装方法

### ES Modulesの使用

**HTMLでの読み込み:**
```html
<script type="module" src="../src/scripts/main.js"></script>
```

**JavaScriptでのimport/export:**
```javascript
// エクスポート
export class StateManager { /* ... */ }
export default StateManager;

// インポート
import StateManager from '../store/StateManager.js';
import { getElement } from '../utils/dom.js';
```

**重要な注意点:**
- ✅ `type="module"` を指定
- ✅ 相対パスで `.js` 拡張子を明記
- ✅ モダンブラウザで動作（Chrome, Firefox, Edge, Safari）
- ❌ IE11は非対応（必要なら別途対応）

### 動的importの回避

file://プロトコルでは動的importに制限があるため、静的importのみを使用:

```javascript
// ✅ OK: 静的import
import StateManager from './store/StateManager.js';

// ❌ NG: 動的import（file://で問題の可能性）
const module = await import('./store/StateManager.js');
```

## StateManagerクラスの設計

### コンセプト

Redux/Zustandにインスパイアされた軽量な状態管理クラス:

```javascript
class StateManager {
  constructor(initialState, options)
  getState()                    // 現在の状態を取得
  setState(updater, actionType) // 状態を更新
  subscribe(listener, selector) // 状態変更を購読
  use(middleware)               // ミドルウェアを追加
  undo()                        // タイムトラベルデバッグ
}
```

### 主要機能

**1. イミュータブルな状態更新:**
```javascript
store.setState(prevState => ({
  ...prevState,
  status: {
    ...prevState.status,
    paidStatus: true
  }
}));
```

**2. サブスクリプション型の更新通知:**
```javascript
const unsubscribe = store.subscribe((newState, prevState, action) => {
  console.log('State changed:', action.type);
  updateUI(newState);
});
```

**3. セレクターによる最適化:**
```javascript
// paidStatusが変更された時だけ実行
store.subscribe(
  (newState) => updatePaidDisplay(newState),
  state => state.status.paidStatus  // selector
);
```

**4. ミドルウェアサポート:**
```javascript
// ロギングミドルウェア
store.use((prevState, nextState, action) => {
  console.log('Action:', action.type);
  console.log('Prev:', prevState);
  console.log('Next:', nextState);
});

// バリデーションミドルウェア
store.use((prevState, nextState) => {
  if (!nextState.status) {
    console.error('Invalid state: missing status');
    return false; // 更新をキャンセル
  }
});
```

## コンポーネントパターン

### 基本構造

```javascript
export class StatusCheckbox {
  constructor(store, elements) {
    this.store = store;
    this.elements = elements;
    this.cleanupFns = [];
  }

  // React の componentDidMount に相当
  mount() {
    this._setupEventListeners();
    this._subscribeToStore();
    this._initializeState();
  }

  // React の componentWillUnmount に相当
  unmount() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }

  _setupEventListeners() { /* ... */ }
  _subscribeToStore() { /* ... */ }
  _initializeState() { /* ... */ }
}
```

### ライフサイクル

```javascript
// main.js
const statusCheckbox = new StatusCheckbox(store, elements);

// マウント
statusCheckbox.mount();

// 使用中...

// アンマウント（ページ遷移時など）
statusCheckbox.unmount();
```

## 段階的な実装ステップ

### Phase 1: 基盤構築（Week 1）

**Day 1-2: StateManager実装**
- [x] StateManagerクラスの作成
- [x] ユニットテストの作成
- [x] イミュータブル更新の検証
- [x] サブスクリプション機能のテスト

**Day 3: 状態構造の設計**
- [x] initialState.jsの作成
- [x] 現在のstateオブジェクトからの移行計画
- [x] セレクター関数の実装

**Day 4: ユーティリティ作成**
- [x] dom.js - DOM操作ヘルパー
- [x] datetime.js - 日時フォーマット
- [x] animation.js - フラッシュアニメーション

**Day 5: エントリーポイント作成**
- [x] main.js - 新しいエントリーポイント
- [x] 既存コードとの並行動作
- [x] 双方向の状態同期

### Phase 2: コンポーネント抽出（Week 2）

**Day 1: DateTimeDisplay**
- [ ] コンポーネントクラスの作成
- [ ] イベントハンドラーの移行
- [ ] 統合テスト

**Day 2: CheckboxGroup**
- [ ] 汎用的なチェックボックス管理
- [ ] data-target属性の活用
- [ ] 複数チェックボックスの一括管理

**Day 3: StatusCheckbox**
- [ ] indeterminate状態の管理
- [ ] 親子チェックボックスの同期
- [ ] 複雑なロジックのテスト

**Day 4-5: その他のコンポーネント**
- [ ] PaidWarning - 有償警告表示
- [ ] DelayNotice - 遅延通知
- [ ] PersonName - 名前入力
- [ ] ResultsPanel - 結果表示

### Phase 3: 移行とクリーンアップ（Week 3）

**Day 1-2: 全イベントハンドラーの移行**
- [ ] すべてのsetup関数をコンポーネントに移行
- [ ] 動作確認とテスト

**Day 3: 古いコードの削除**
- [ ] templates.jsの縮小
- [ ] グローバルstate変数の削除
- [ ] 不要な関数の削除

**Day 4: パフォーマンス最適化**
- [ ] 不要な再レンダリングの削減
- [ ] セレクターのメモ化
- [ ] バッチ更新の実装

**Day 5: ドキュメント整備**
- [ ] コードコメントの追加
- [ ] README.mdの更新
- [ ] 使用方法の明文化

## 使用方法

### 開発環境

**必要なもの:**
- モダンブラウザ（Chrome, Firefox, Edge, Safari）
- テキストエディタ（VS Code推奨）

**開発の流れ:**
1. ファイルを編集
2. ブラウザで `templates/index.html` を開く（またはリロード）
3. DevToolsのConsoleでデバッグ
4. 必要に応じて修正

### デバッグ

**StateManagerのデバッグ:**
```javascript
// ブラウザのConsoleで
window.__STORE__.getState()        // 現在の状態を確認
window.__STORE__.getHistory()      // 状態変更履歴を確認
window.__STORE__.undo()            // 前の状態に戻る
```

**ロギング有効化:**
```javascript
const store = new StateManager(initialState, {
  enableLogging: true,      // 状態変更をログ出力
  enableValidation: true,   // 状態のバリデーション
  enableTimeTravel: true    // タイムトラベルデバッグ
});
```

### 設定のカスタマイズ

[src/config/defaults.js](src/config/defaults.js) を編集:

```javascript
const CONFIG = {
  status: "済",           // デフォルトのステータス
  maker: "三菱",          // デフォルトのメーカー
  newyear: false,         // 年末年始の初期状態
  checks: {
    "status-urgent": false,
    // "status-delay": true
  },
  texts: {
    statusUrgent: "【至急対応希望】\n",
    // ... その他のテキスト
  },
  animation: {
    flashColor: "#ffeb3b",    // フラッシュアニメーションの色
    flashDuration: 300        // アニメーション時間（ms）
  }
};
```

## テスト戦略

### ユニットテスト

**StateManagerのテスト例:**
```javascript
test('should update state immutably', () => {
  const store = new StateManager({ count: 0 });
  const initialState = store.getState();

  store.setState({ count: 1 });

  expect(store.getState()).toEqual({ count: 1 });
  expect(initialState).toEqual({ count: 0 }); // 元の状態は変更されない
});
```

**コンポーネントのテスト例:**
```javascript
test('should update state when checkbox changes', () => {
  const component = new StatusCheckbox(store, elements);
  component.mount();

  elements.statusCheckbox.checked = true;
  elements.statusCheckbox.dispatchEvent(new Event('change'));

  expect(store.getState().status.paidStatus).toBe(true);
});
```

### 統合テスト

ブラウザで実際の操作をテスト:
1. チェックボックスをクリック → 結果表示が更新されるか
2. ラジオボタンを選択 → 有償警告表示が変わるか
3. 日時更新ボタン → 現在時刻が反映されるか
4. 右クリック → クリップボードにコピーされるか

## よくある質問

### Q: なぜReactを使わないのか？

**A:** このアプリケーションの要件:
- file://プロトコルで動作する必要がある
- ビルドツール不要
- 軽量（フレームワークのオーバーヘッドなし）
- シンプルな機能（Reactほどの複雑さは不要）

Vanilla JSでReactのパターンを適用することで、シンプルさを保ちつつ保守性を向上させます。

### Q: ES Modulesは古いブラウザで動作するか？

**A:** ES Modules (type="module") のサポート:
- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 10.1+
- ✅ Edge 16+
- ❌ IE11（非対応）

必要に応じてBabelなどでトランスパイル可能ですが、現時点では不要と判断。

### Q: なぜiframeを使っているのか？

**A:** 現在のoutbound.html/inbound.htmlはiframeで読み込まれていますが、将来的には:
- コンポーネントとして統合
- iframeを削除してインラインHTML化
- 同じStateManagerを共有

が推奨されます。Phase 2以降で対応予定。

## 参考リソース

### コードパターン

- **Redux**: https://redux.js.org/ - 状態管理パターンの参考
- **Zustand**: https://github.com/pmndrs/zustand - 軽量な状態管理の参考
- **React Hooks**: https://react.dev/reference/react - カスタムフックパターンの参考

### ES Modules

- **MDN**: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **JavaScript Modules**: https://v8.dev/features/modules

## 貢献者

- プロジェクト作成: 2025年
- リファクタリング計画: 2025-12-30

## ライセンス

（必要に応じて記載）
