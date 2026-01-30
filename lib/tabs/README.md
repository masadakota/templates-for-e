# Tabs Library

シンプルで軽量なタブUIライブラリです。file://プロトコル対応で、Webサーバー不要で動作します。

## 特徴

- ✅ **file://プロトコル対応** - ローカルファイルとして直接ブラウザで開ける
- ✅ **Pure Vanilla JavaScript** - フレームワーク不要、依存関係なし
- ✅ **軽量** - 約10KB（minify前）
- ✅ **アクセシビリティ対応** - ARIA属性、キーボード操作対応
- ✅ **カスタマイズ可能** - 複数のスタイルバリエーション
- ✅ **レスポンシブ** - モバイル・タブレット対応
- ✅ **ダークモード対応** - prefers-color-scheme対応

## インストール

ファイルをダウンロードして、プロジェクトに配置するだけです。

```
your-project/
├── lib/
│   └── tabs/
│       ├── index.js      # JavaScript
│       ├── styles.css    # スタイルシート
│       └── README.md     # このファイル
└── index.html
```

## 基本的な使い方

### 1. HTMLを作成

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Tabs</title>
  <link rel="stylesheet" href="lib/tabs/styles.css">
</head>
<body>
  <!-- タブコンテナ -->
  <div class="tabs-container" id="my-tabs">
    <!-- タブボタンリスト -->
    <div role="tablist" class="tabs-list">
      <button class="tab-button" data-tab="tab1" role="tab">タブ1</button>
      <button class="tab-button" data-tab="tab2" role="tab">タブ2</button>
      <button class="tab-button" data-tab="tab3" role="tab">タブ3</button>
    </div>

    <!-- タブパネル -->
    <div class="tab-panels">
      <div class="tab-panel" data-tab-panel="tab1">
        <h2>タブ1のコンテンツ</h2>
        <p>ここにタブ1の内容が表示されます。</p>
      </div>
      <div class="tab-panel" data-tab-panel="tab2">
        <h2>タブ2のコンテンツ</h2>
        <p>ここにタブ2の内容が表示されます。</p>
      </div>
      <div class="tab-panel" data-tab-panel="tab3">
        <h2>タブ3のコンテンツ</h2>
        <p>ここにタブ3の内容が表示されます。</p>
      </div>
    </div>
  </div>

  <!-- JavaScript -->
  <script src="lib/tabs/index.js"></script>
  <script>
    // タブを初期化
    const tabs = new Tabs({
      container: '#my-tabs',
      defaultTab: 'tab1'
    });
  </script>
</body>
</html>
```

### 2. 重要な属性

**タブボタン:**
- `data-tab="タブID"` - タブの識別子（必須）
- `role="tab"` - アクセシビリティ用（推奨）

**タブパネル:**
- `data-tab-panel="タブID"` - タブボタンと同じID（必須）
- `role="tabpanel"` - アクセシビリティ用（推奨）

**タブリスト:**
- `role="tablist"` - タブボタンの親要素に設定（推奨）

## APIリファレンス

### コンストラクタ

```javascript
const tabs = new Tabs(options);
```

#### オプション

| オプション | 型 | デフォルト | 説明 |
|----------|-----|----------|------|
| `container` | string \| HTMLElement | **必須** | タブコンテナのセレクタまたは要素 |
| `defaultTab` | string | `null` | 初期表示するタブのID |
| `onChange` | function | `null` | タブ変更時のコールバック |
| `tabSelector` | string | `'[data-tab]'` | タブボタンのセレクタ |
| `panelSelector` | string | `'[data-tab-panel]'` | タブパネルのセレクタ |
| `activeClass` | string | `'active'` | アクティブ時のクラス名 |
| `enableKeyboard` | boolean | `true` | キーボード操作を有効化 |
| `enableHistory` | boolean | `false` | ブラウザ履歴との連携 |

#### 使用例

```javascript
const tabs = new Tabs({
  container: '#my-tabs',
  defaultTab: 'home',
  onChange: (tabId, previousTab) => {
    console.log(`タブが変更されました: ${previousTab} → ${tabId}`);
  },
  enableKeyboard: true,
  enableHistory: true
});
```

### メソッド

#### showTab(tabId, triggerCallback)

指定したタブを表示します。

```javascript
tabs.showTab('tab2');                  // タブ2を表示（コールバック実行）
tabs.showTab('tab2', false);           // タブ2を表示（コールバック実行しない）
```

#### getCurrentTab()

現在アクティブなタブのIDを取得します。

```javascript
const currentTab = tabs.getCurrentTab();
console.log('現在のタブ:', currentTab);
```

#### disableTab(tabId)

指定したタブを無効化します。

```javascript
tabs.disableTab('tab3');  // タブ3を無効化
```

#### enableTab(tabId)

指定したタブを有効化します。

```javascript
tabs.enableTab('tab3');   // タブ3を有効化
```

#### destroy()

イベントリスナーを削除してクリーンアップします。

```javascript
tabs.destroy();  // タブインスタンスを破棄
```

## スタイルバリエーション

### デフォルトスタイル

```html
<div class="tabs-container">
  <!-- ... -->
</div>
```

### ピルスタイル

丸みを帯びたボタン風のタブです。

```html
<div class="tabs-container pills">
  <!-- ... -->
</div>
```

### ボックススタイル

ボックス型のタブです。

```html
<div class="tabs-container boxed">
  <!-- ... -->
</div>
```

### 縦タブ

サイドバー風の縦タブレイアウトです。

```html
<div class="tabs-container vertical">
  <!-- ... -->
</div>
```

### アニメーション付き

タブ切り替え時にフェードインアニメーションが適用されます。

```html
<div class="tabs-container animated">
  <!-- ... -->
</div>
```

## キーボード操作

キーボードでタブを操作できます（`enableKeyboard: true` の場合）。

| キー | 動作 |
|------|------|
| `←` / `→` | 前/次のタブに移動 |
| `↑` / `↓` | 前/次のタブに移動 |
| `Home` | 最初のタブに移動 |
| `End` | 最後のタブに移動 |
| `Tab` | フォーカスを次の要素に移動 |

## イベント

### onChange コールバック

タブが変更されたときに呼び出されます。

```javascript
const tabs = new Tabs({
  container: '#my-tabs',
  onChange: (tabId, previousTab) => {
    console.log('新しいタブ:', tabId);
    console.log('前のタブ:', previousTab);

    // カスタム処理
    if (tabId === 'profile') {
      loadUserProfile();
    }
  }
});
```

## ブラウザ履歴との連携

`enableHistory: true` を設定すると、タブの状態がブラウザ履歴に保存されます。

```javascript
const tabs = new Tabs({
  container: '#my-tabs',
  enableHistory: true  // ブラウザ履歴に保存
});
```

**動作:**
- タブを切り替えると URL のハッシュが変更されます（例: `#tab1`）
- ブラウザの戻る/進むボタンでタブの履歴を移動できます
- ページをリロードしても最後に表示していたタブが復元されます

## カスタムスタイル

### CSSカスタマイズ

デフォルトのスタイルを上書きできます。

```css
/* タブボタンの色を変更 */
.tab-button {
  color: #333;
  font-weight: 600;
}

.tab-button.active {
  color: #10b981;
  border-bottom-color: #10b981;
}

/* タブパネルのパディングを調整 */
.tab-panel {
  padding: 32px;
}
```

### CSS変数を使用

```css
:root {
  --tab-color: #666;
  --tab-active-color: #2563eb;
  --tab-border-color: #e0e0e0;
}

.tab-button {
  color: var(--tab-color);
}

.tab-button.active {
  color: var(--tab-active-color);
  border-bottom-color: var(--tab-active-color);
}
```

## 高度な使用例

### 動的にタブを追加

```javascript
const container = document.querySelector('#my-tabs');
const tabsList = container.querySelector('.tabs-list');
const tabPanels = container.querySelector('.tab-panels');

// 新しいタブボタンを追加
const newButton = document.createElement('button');
newButton.className = 'tab-button';
newButton.setAttribute('data-tab', 'new-tab');
newButton.setAttribute('role', 'tab');
newButton.textContent = '新しいタブ';
tabsList.appendChild(newButton);

// 新しいタブパネルを追加
const newPanel = document.createElement('div');
newPanel.className = 'tab-panel';
newPanel.setAttribute('data-tab-panel', 'new-tab');
newPanel.setAttribute('role', 'tabpanel');
newPanel.innerHTML = '<h2>新しいコンテンツ</h2>';
tabPanels.appendChild(newPanel);

// タブを再初期化
tabs.destroy();
tabs = new Tabs({ container: '#my-tabs' });
```

### 条件付きでタブを表示/非表示

```javascript
const tabs = new Tabs({
  container: '#my-tabs',
  onChange: (tabId) => {
    // 特定のタブが選択されたときだけ別のタブを有効化
    if (tabId === 'advanced') {
      tabs.enableTab('expert');
    } else {
      tabs.disableTab('expert');
    }
  }
});
```

### 外部イベントと連携

```javascript
// フォームの送信時に確認タブに移動
document.querySelector('#my-form').addEventListener('submit', (e) => {
  e.preventDefault();
  tabs.showTab('confirmation');
});

// データ読み込み完了後にタブを有効化
fetch('/api/data')
  .then(response => response.json())
  .then(data => {
    tabs.enableTab('results');
    tabs.showTab('results');
  });
```

## トラブルシューティング

### タブが表示されない

**原因:** `data-tab` と `data-tab-panel` の値が一致していない可能性があります。

```html
<!-- ❌ 間違い -->
<button data-tab="tab1">タブ1</button>
<div data-tab-panel="tab-1">コンテンツ</div>

<!-- ✅ 正しい -->
<button data-tab="tab1">タブ1</button>
<div data-tab-panel="tab1">コンテンツ</div>
```

### キーボード操作が動かない

**原因:** `enableKeyboard` が `false` になっているか、タブボタンにフォーカスが当たっていない可能性があります。

```javascript
// キーボード操作を有効化
const tabs = new Tabs({
  container: '#my-tabs',
  enableKeyboard: true  // これを true に設定
});
```

### スタイルが適用されない

**原因:** CSSファイルの読み込みパスが間違っている可能性があります。

```html
<!-- パスを確認 -->
<link rel="stylesheet" href="lib/tabs/styles.css">
```

## ブラウザサポート

- ✅ Chrome 60+
- ✅ Firefox 60+
- ✅ Safari 10.1+
- ✅ Edge 79+
- ❌ IE11（非対応）

## ライセンス

MIT License

## 貢献

バグ報告や機能リクエストは、GitHubのIssuesでお願いします。

## 更新履歴

### v1.0.0 (2026-01-30)
- 初回リリース
- 基本的なタブ機能
- アクセシビリティ対応
- キーボード操作サポート
- 複数のスタイルバリエーション
- ブラウザ履歴との連携

## 参考

- [WAI-ARIA Authoring Practices - Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [MDN - ARIA: tab role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role)
