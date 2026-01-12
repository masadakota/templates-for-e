# SearchFilter - 汎用リアルタイム検索・フィルタリングライブラリ

リアルタイムでDOM要素をフィルタリングする軽量なVanilla JavaScriptライブラリ。

## 特徴

- ✅ **超シンプル** - たった1行で動作（`new SearchFilter().init()`）
- ✅ **デフォルト設定** - 設定不要で即使える
- ✅ **リアルタイム検索** - 入力と同時にフィルタリング
- ✅ **AND検索対応** - 半角スペース区切りで複数キーワード検索
- ✅ **大文字小文字の区別** - 設定で切り替え可能
- ✅ **デバウンス対応** - 大量データでもパフォーマンス最適化
- ✅ **クリアボタン** - 検索のリセット機能
- ✅ **結果カウント** - 表示中/総アイテム数の表示
- ✅ **検索結果なしメッセージ** - UXの向上
- ✅ **キーボードショートカット** - ESCキーでクリア
- ✅ **空の状態対応** - アイテムが0件の場合の自動処理
- ✅ **コールバック対応** - 検索時の独自処理を追加可能
- ✅ **動的アイテム対応** - `refresh()`で追加アイテムを認識
- ✅ **メモリリーク対策** - `destroy()`で完全クリーンアップ
- ✅ **file://プロトコル対応** - ローカルファイルでも動作

## クイックスタート

たった**1行**で動作します！

```javascript
import SearchFilter from './lib/search-filter/SearchFilter.js';
new SearchFilter().init();  // これだけ！
```

## インストール

ファイルをコピーするだけ：

```
lib/search-filter/
├── SearchFilter.js          # ライブラリ本体
├── README.md                # このファイル
├── simple-example.html      # 最小構成の例
└── example.html             # 詳細な使用例
```

## 最小構成の使い方（推奨）

### 1. HTML構造（デフォルトID/クラスを使用）

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>検索の例</title>
  <style>
    /* 必須: これだけ定義すればOK */
    .hidden { display: none; }
    .clear-btn.visible { opacity: 1; }
  </style>
</head>
<body>
  <!-- デフォルトのID/クラスを使う（kebab-case） -->
  <input type="text" id="search-input" placeholder="検索...">
  <button id="clear-btn">×</button>
  <div id="result-count"></div>

  <div id="items-container">
    <div class="search-item">Apple</div>
    <div class="search-item">Banana</div>
    <div class="search-item">Cherry</div>
  </div>

  <div id="no-results" style="display: none;">
    検索結果なし
  </div>

  <div id="empty-state" style="display: none;">
    アイテムがありません
  </div>

  <script type="module">
    import SearchFilter from './lib/search-filter/SearchFilter.js';
    new SearchFilter().init();  // たった1行！
  </script>
</body>
</html>
```

### 2. デフォルト設定

以下のID/クラス名を使えば、**設定不要**で動作します：

| 要素 | デフォルト値 | 説明 |
|------|-------------|------|
| 検索input | `id="search-input"` | 検索キーワード入力欄 |
| クリアボタン | `id="clear-btn"` | 検索をクリアするボタン |
| 結果カウント | `id="result-count"` | "X / Y 件表示"の表示欄 |
| フィルタリング対象 | `class="search-item"` | 検索対象のアイテム |
| アイテムコンテナ | `id="items-container"` | アイテムを含むコンテナ |
| 検索結果なし | `id="no-results"` | 検索結果がない時のメッセージ |
| 空の状態 | `id="empty-state"` | アイテムが0件の時のメッセージ |
| 検索コンテナ | `class="search-container"` | 検索UI全体のコンテナ |
| 非表示クラス | `.hidden` | 非表示にするCSSクラス |
| 表示クラス | `.visible` | クリアボタン表示用 |

### 3. 必須CSS

```css
/* これだけでOK */
.hidden {
  display: none;
}

.clear-btn.visible {
  opacity: 1;
}
```

## 詳細な使い方

### オプション一覧

```javascript
const filter = new SearchFilter({
  // 必須オプション
  searchInputId: 'searchInput',      // 検索inputのID
  itemSelector: '.item',              // フィルタリング対象のセレクター

  // オプション
  clearButtonId: 'clearBtn',          // クリアボタンのID
  resultCountId: 'resultCount',       // 結果カウント表示のID
  containerSelector: '#container',    // アイテムコンテナのセレクター
  noResultsId: 'noResults',          // 検索結果なしメッセージのID

  // 動作設定
  caseSensitive: false,               // 大文字小文字を区別するか（デフォルト: false）
  hiddenClass: 'hidden',              // 非表示用クラス（デフォルト: 'hidden'）
  visibleClass: 'visible',            // クリアボタン表示用クラス（デフォルト: 'visible'）
  debounceMs: 150,                    // デバウンス時間（ミリ秒、デフォルト: 0）

  // コールバック
  onSearch: (result) => {
    console.log('検索実行:', result);
  },
  onClear: () => {
    console.log('検索クリア');
  }
});

filter.init();
```

### メソッド

#### `init()`
初期化処理を実行します。

```javascript
filter.init();
```

#### `filter(keyword)`
指定したキーワードでフィルタリングを実行します。

```javascript
filter.filter('apple');  // "apple"を含むアイテムだけ表示
```

#### `showAll()`
すべてのアイテムを表示します。

```javascript
filter.showAll();
```

#### `clear()`
検索入力をクリアし、すべてのアイテムを表示します。

```javascript
filter.clear();
```

#### `refresh()`
アイテムリストを再読み込みします（動的にアイテムが追加された場合）。

```javascript
// 新しいアイテムを追加
const newItem = document.createElement('div');
newItem.className = 'item';
newItem.textContent = 'New Item';
container.appendChild(newItem);

// リフレッシュして新アイテムを認識
filter.refresh();
```

#### `getKeyword()`
現在の検索キーワードを取得します。

```javascript
const keyword = filter.getKeyword();
console.log('現在の検索:', keyword);
```

#### `getVisibleItems()`
現在表示中のアイテムを取得します。

```javascript
const visible = filter.getVisibleItems();
console.log('表示中のアイテム数:', visible.length);
```

#### `getHiddenItems()`
現在非表示のアイテムを取得します。

```javascript
const hidden = filter.getHiddenItems();
console.log('非表示のアイテム数:', hidden.length);
```

#### `destroy()`
イベントリスナーを削除し、リソースを解放します。

```javascript
filter.destroy();
```

## 実用例

### 例1: デフォルト設定を使う（推奨）

```javascript
import SearchFilter from '../lib/search-filter/SearchFilter.js';

// たった1行！
new SearchFilter().init();
```

### 例2: 一部だけカスタマイズ

```javascript
// デフォルト設定を使いつつ、アイテムクラスだけ変更
new SearchFilter({
  itemSelector: '.log-entry'  // デフォルトは '.search-item'
}).init();
```

### 例3: デバウンス付き（大量データ）

```javascript
new SearchFilter({
  debounceMs: 300  // 300ms後に検索実行
}).init();
```

### 例4: コールバック付き

```javascript
new SearchFilter({
  onSearch: (result) => {
    console.log(`検索: "${result.keyword}"`);
    console.log(`表示: ${result.visibleCount} / ${result.totalCount}`);

    // Google Analyticsにイベント送信
    gtag('event', 'search', {
      search_term: result.keyword,
      items_found: result.visibleCount
    });
  },
  onClear: () => {
    console.log('検索がクリアされました');
  }
}).init();
```

### 例5: 大文字小文字を区別

```javascript
new SearchFilter({
  caseSensitive: true  // 大文字小文字を区別
}).init();
```

### 例6: 動的アイテムの追加

```javascript
const filter = new SearchFilter().init();

// WebSocketで新しいメッセージを受信
socket.on('new_message', (message) => {
  const item = document.createElement('div');
  item.className = 'search-item';  // デフォルトクラス
  item.textContent = message.text;
  container.appendChild(item);

  // アイテムリストを更新
  filter.refresh();
});
```

### 例7: AND検索（複数キーワード）

```javascript
// 半角スペースで区切ると AND検索になる
// 例: "有償 警告" → 「有償」AND「警告」を含むアイテムのみ表示
new SearchFilter().init();

// プログラムから実行する場合
const filter = new SearchFilter().init();
filter.filter('有償 警告');  // 両方のキーワードを含むアイテムのみ
```

**使用例:**
- 検索: `"apple red"` → "apple"と"red"の両方を含むアイテム
- 検索: `"有償 警告 案内"` → 3つすべてのキーワードを含むアイテム
- 検索: `"メーカー保証"` → "メーカー保証"を含むアイテム

### 例8: メソッドチェーン

```javascript
const filter = new SearchFilter()
  .init()
  .showAll();

// 後でクリア
filter.clear();
```

## CSS例

```css
/* 非表示クラス */
.hidden {
  display: none;
}

/* クリアボタン */
.clear-btn {
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.clear-btn.visible {
  opacity: 1;
  pointer-events: auto;
}

/* 検索input */
.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* アイテムのフェードアウト効果 */
.item {
  transition: opacity 0.3s ease;
}

.item.hidden {
  opacity: 0;
  display: none;
}
```

## パフォーマンス

- **< 100アイテム**: デバウンス不要
- **100-500アイテム**: `debounceMs: 150` を推奨
- **500-1000アイテム**: `debounceMs: 300` を推奨
- **1000+アイテム**: 仮想スクロールの導入を検討

## ブラウザ対応

- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 10.1+
- ✅ Edge 16+
- ❌ IE11（ES Modulesが必要）

## ライセンス

このプロジェクトのライセンスに従います。

## トラブルシューティング

### Q: アイテムが非表示にならない

**A:** `hiddenClass` に指定したCSSクラスで `display: none;` が設定されているか確認してください。

```css
.hidden {
  display: none !important;
}
```

### Q: 動的に追加したアイテムが検索できない

**A:** `refresh()` メソッドを呼び出してください。

```javascript
container.appendChild(newItem);
filter.refresh();
```

### Q: file://プロトコルで動かない

**A:** `type="module"` を使用しているか確認してください。

```html
<script type="module" src="./app.js"></script>
```

### Q: クリアボタンが表示されない

**A:** `visibleClass` に対応するCSSが設定されているか確認してください。

```css
.clear-btn.visible {
  opacity: 1;
}
```

## 貢献

バグ報告や機能リクエストは Issue でお願いします。
