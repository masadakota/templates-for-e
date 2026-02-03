# SearchFilter クイックスタートガイド

## 🚀 3ステップで使える検索フィルター

### Step 1: HTML構造を作る

デフォルトのID/クラスを使えば設定不要！

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>検索の例</title>
  <style>
    /* 必須CSS（これだけ！） */
    .hidden { display: none; }
    .clear-btn.visible { opacity: 1; }
  </style>
</head>
<body>
  <!-- 検索UI -->
  <input type="text" id="searchInput" placeholder="検索...">
  <button id="clearBtn">×</button>
  <div id="resultCount"></div>

  <!-- アイテム -->
  <div id="itemsContainer">
    <div class="search-item">Item 1</div>
    <div class="search-item">Item 2</div>
    <div class="search-item">Item 3</div>
  </div>

  <!-- メッセージ -->
  <div id="noResults" style="display: none;">
    検索結果が見つかりません
  </div>

  <script type="module" src="./app.js"></script>
</body>
</html>
```

### Step 2: JavaScriptを1行書く

```javascript
// app.js
import SearchFilter from './lib/search-filter/SearchFilter.js';
new SearchFilter();
```

### Step 3: 完成！

これだけで以下の機能が動作します：
- ✅ リアルタイム検索
- ✅ クリアボタン（×）
- ✅ 結果カウント表示
- ✅ 検索結果なしメッセージ
- ✅ ESCキーでクリア

---

## 📋 デフォルト設定

| 要素 | ID/クラス | 必須 |
|------|----------|------|
| 検索input | `id="searchInput"` | ✅ 必須 |
| フィルタリング対象 | `class="search-item"` | ✅ 必須 |
| クリアボタン | `id="clearBtn"` | オプション |
| 結果カウント | `id="resultCount"` | オプション |
| アイテムコンテナ | `id="itemsContainer"` | オプション |
| 検索結果なし | `id="noResults"` | オプション |
| 空の状態 | `id="emptyState"` | オプション |

**必須CSS:**
```css
.hidden { display: none; }
.clear-btn.visible { opacity: 1; }
```

---

## 🎨 カスタマイズが必要な場合

### 一部だけ変更する

```javascript
new SearchFilter({
  itemSelector: '.custom-item'  // これだけカスタマイズ
});
```

### 大量データの場合

```javascript
new SearchFilter({
  debounceMs: 300  // 300ms後に検索実行
});
```

### イベントを取得する

```javascript
new SearchFilter({
  onSearch: (result) => {
    console.log(`検索: "${result.keyword}"`);
    console.log(`表示: ${result.visibleCount} / ${result.totalCount}`);
  }
});
```

---

## 🔧 よくある質問

### Q: クラス名を変えたい

```javascript
new SearchFilter({
  itemSelector: '.my-item'  // カスタムクラス
});
```

### Q: 大文字小文字を区別したい

```javascript
new SearchFilter({
  caseSensitive: true
});
```

### Q: 動的にアイテムを追加した

```javascript
const filter = new SearchFilter();

// 新しいアイテムを追加
container.innerHTML += '<div class="search-item">New Item</div>';

// リフレッシュ
filter.refresh();
```

### Q: data-*属性で設定したい

```html
<input
  type="text"
  id="searchInput"
  data-search-item=".custom-item"
  data-search-container="#myContainer"
>
```

```javascript
// 自動検出される（autoDetect: trueがデフォルト）
new SearchFilter();
```

---

## 📚 詳細ドキュメント

- [README.md](./README.md) - 完全なAPIリファレンス
- [simple-example.html](./simple-example.html) - 最小構成の例
- [example.html](./example.html) - 詳細な使用例

---

## 💡 ヒント

### ログページの例

```javascript
// logs/index.html
new SearchFilter();  // デフォルト設定でOK
```

HTML:
```html
<div class="search-item">2025-01-06 10:30 - ユーザーログイン</div>
<div class="search-item">2025-01-06 10:45 - データ更新</div>
<div class="search-item">2025-01-06 11:00 - ログアウト</div>
```

### 商品リストの例

```javascript
new SearchFilter({
  itemSelector: '.product'  // 商品カードのクラス
});
```

### ユーザー検索の例

```javascript
new SearchFilter({
  debounceMs: 200,  // 大量ユーザーに対応
  onSearch: (result) => {
    // 分析用にログ送信
    analytics.track('user_search', {
      keyword: result.keyword,
      results: result.visibleCount
    });
  }
});
```

---

## 🎯 まとめ

1. **デフォルト設定を使う** → たった1行で動作
2. **必要な部分だけカスタマイズ** → オプションで上書き
3. **シンプルに保つ** → 複雑な設定は避ける

**最小構成:**
```javascript
import SearchFilter from './lib/search-filter/SearchFilter.js';
new SearchFilter();
```

これで完璧に動きます！
