# Tabs Library

シンプルで軽量なタブUIライブラリです。file://プロトコル対応で、Webサーバー不要で動作します。

## 特徴

- ✅ **file://プロトコル対応** - ローカルファイルとして直接ブラウザで開ける
- ✅ **Pure Vanilla JavaScript** - フレームワーク不要、依存関係なし
- ✅ **軽量** - 約10KB（minify前）
- ✅ **アクセシビリティ対応** - ARIA属性、キーボード操作対応
- ✅ **別階層配置可能** - タブリストとパネルを別の場所に配置できる

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
  <!-- タブボタン -->
  <div class="tabs-container" id="my-tabs">
    <div role="tablist" class="tabs-list">
      <button class="tabs-trigger" data-tab="tab1" role="tab">タブ1</button>
      <button class="tabs-trigger" data-tab="tab2" role="tab">タブ2</button>
      <button class="tabs-trigger" data-tab="tab3" role="tab">タブ3</button>
    </div>
  </div>

  <!-- タブパネル（別の場所に配置可能） -->
  <div id="content-area">
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
      panelContainer: '#content-area',
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
| `tabsList` | string \| HTMLElement | **必須** | TabsListコンテナのセレクタまたは要素 |
| `tabsContent` | string \| HTMLElement | `null` | TabsContentコンテナ（未指定時はtabsListと同じ） |
| `defaultValue` | string | `null` | 初期表示する値 |
| `onValueChange` | function | `null` | 値変更時のコールバック |
| `triggerSelector` | string | `'[data-tab]'` | TabsTriggerのセレクタ |
| `contentSelector` | string | `'[data-tab-panel]'` | TabsContentのセレクタ |
| `activeClass` | string | `'active'` | アクティブ時のクラス名 |
| `enableKeyboard` | boolean | `true` | キーボード操作を有効化 |
| `enableHistory` | boolean | `false` | ブラウザ履歴との連携 |
| `activeColor` | string | `null` | アクティブなトリガーの文字色 |
| `activeBgColor` | string | `null` | アクティブなトリガーの背景色 |
| `activeBorderColor` | string | `null` | アクティブなトリガーのボーダー色 |

#### 使用例

```javascript
const tabs = new Tabs({
  tabsList: '#my-tabs',
  tabsContent: '#content-area',
  defaultValue: 'home',
  onValueChange: (value, previousValue) => {
    console.log(`値が変更されました: ${previousValue} → ${value}`);
  },
  enableKeyboard: true,
  enableHistory: true,
  activeColor: '#10b981',        // アクティブなトリガーの文字色
  activeBgColor: '#ecfdf5',      // アクティブなトリガーの背景色
  activeBorderColor: '#10b981'   // アクティブなトリガーのボーダー色
});
```

### メソッド

#### setValue(value, triggerCallback)

値を設定してコンテンツを表示します。

```javascript
tabs.setValue('tab2');                  // tab2を表示（コールバック実行）
tabs.setValue('tab2', false);           // tab2を表示（コールバック実行しない）
```

#### getValue()

現在アクティブな値を取得します。

```javascript
const currentValue = tabs.getValue();
console.log('現在の値:', currentValue);
```

#### disableTrigger(value)

指定したトリガーを無効化します。

```javascript
tabs.disableTrigger('tab3');  // tab3トリガーを無効化
```

#### enableTrigger(value)

指定したトリガーを有効化します。

```javascript
tabs.enableTrigger('tab3');   // tab3トリガーを有効化
```

#### destroy()

イベントリスナーを削除してクリーンアップします。

```javascript
tabs.destroy();  // タブインスタンスを破棄
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

### onValueChange コールバック

値が変更されたときに呼び出されます。

```javascript
const tabs = new Tabs({
  tabsList: '#my-tabs',
  onValueChange: (value, previousValue) => {
    console.log('新しい値:', value);
    console.log('前の値:', previousValue);

    // カスタム処理
    if (value === 'profile') {
      loadUserProfile();
    }
  }
});
```

## ブラウザ履歴との連携

`enableHistory: true` を設定すると、値の状態がブラウザ履歴に保存されます。

```javascript
const tabs = new Tabs({
  tabsList: '#my-tabs',
  enableHistory: true  // ブラウザ履歴に保存
});
```

**動作:**
- 値を切り替えると URL のハッシュが変更されます（例: `#tab1`）
- ブラウザの戻る/進むボタンで値の履歴を移動できます
- ページをリロードしても最後に表示していた値が復元されます

## カスタムスタイル

### カラーカスタマイズ（オプション）

初期化時にアクティブなタブの色をカスタマイズできます。

```javascript
const tabs = new Tabs({
  tabsList: '#my-tabs',
  defaultValue: 'home',
  activeColor: '#10b981',        // 文字色（緑）
  activeBgColor: '#ecfdf5',      // 背景色（淡い緑）
  activeBorderColor: '#10b981'   // ボーダー色（緑）
});
```

**利用可能なオプション:**
- `activeColor` - アクティブなタブの文字色
- `activeBgColor` - アクティブなタブの背景色
- `activeBorderColor` - アクティブなタブのボーダー色（下線）

### CSSカスタマイズ

デフォルトのスタイルを上書きできます。

```css
/* タブボタンの色を変更 */
.tabs-trigger {
  color: #333;
  font-weight: 600;
}

.tabs-trigger.active {
  color: #10b981;
  border-bottom-color: #10b981;
}

/* タブパネルのスタイル */
.tab-panel {
  padding: 24px;
  background-color: #fff;
}
```

## 別階層配置の例

タブボタンとタブパネルを異なる階層に配置できます。

```html
<!-- ヘッダーにタブボタン -->
<header class="sticky-header">
  <div class="tabs-container" id="nav-tabs">
    <div role="tablist" class="tabs-list">
      <button class="tabs-trigger" data-tab="home" role="tab">ホーム</button>
      <button class="tabs-trigger" data-tab="about" role="tab">概要</button>
    </div>
  </div>
</header>

<!-- メインコンテンツにタブパネル -->
<main id="main-content">
  <div class="tab-panels">
    <div class="tab-panel" data-tab-panel="home">
      <h1>ホームページ</h1>
    </div>
    <div class="tab-panel" data-tab-panel="about">
      <h1>概要ページ</h1>
    </div>
  </div>
</main>

<script>
  const tabs = new Tabs({
    container: '#nav-tabs',
    panelContainer: '#main-content',
    defaultTab: 'home'
  });
</script>
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

## 更新履歴

### v1.1.0 (2026-01-31)
- 別階層配置機能を追加（`panelContainer` オプション）
- レスポンシブ対応コードを削除（シンプル化）
- スタイルバリエーションを削除（基本タブのみ）

### v1.0.0 (2026-01-30)
- 初回リリース
- 基本的なタブ機能
- アクセシビリティ対応
- キーボード操作サポート

## 参考

- [WAI-ARIA Authoring Practices - Tabs](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
- [MDN - ARIA: tab role](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles/tab_role)
