# ネーミング規約

## 基本方針

HTML/CSS の標準規約に従い、**kebab-case** に統一しています。

## ID/クラス名の規則

### ✅ kebab-case（推奨）

```html
<!-- ID -->
<input id="search-input">
<button id="clear-btn">
<div id="result-count">
<div id="items-container">
<div id="no-results">
<div id="empty-state">

<!-- クラス -->
<div class="search-item">
<div class="search-container">
<div class="clear-btn">
```

### ❌ camelCase（非推奨）

```html
<!-- 使わない -->
<input id="searchInput">
<button id="clearBtn">
<div id="resultCount">
```

## 理由

1. **HTML/CSS の標準** - HTML属性やCSS セレクターは kebab-case が一般的
2. **可読性** - ハイフンで区切ることで読みやすい
3. **一貫性** - プロジェクト全体で統一された規約
4. **アクセシビリティ** - `aria-label` などの標準属性と統一

## デフォルトID/クラス名一覧

| 用途 | ID/クラス | 種類 |
|------|----------|------|
| 検索input | `search-input` | ID |
| クリアボタン | `clear-btn` | ID |
| 結果カウント | `result-count` | ID |
| アイテムコンテナ | `items-container` | ID |
| 検索結果なし | `no-results` | ID |
| 空の状態 | `empty-state` | ID |
| 検索対象アイテム | `search-item` | class |
| 検索コンテナ | `search-container` | class |
| 非表示 | `hidden` | class |
| 表示（クリアボタン用） | `visible` | class |

## JavaScript プロパティ名

JavaScriptのプロパティ名は **camelCase** を使用します：

```javascript
const options = {
  searchInputId: 'search-input',     // プロパティ名: camelCase
  clearButtonId: 'clear-btn',         // 値（ID名）: kebab-case
  itemSelector: '.search-item',       // 値（クラス名）: kebab-case
  // ...
};
```

これにより、JavaScriptの慣習とHTML/CSSの慣習を両立します。

## 例: 完全な使用例

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <style>
    .hidden { display: none; }
    .clear-btn.visible { opacity: 1; }
  </style>
</head>
<body>
  <!-- kebab-case で統一 -->
  <input type="text" id="search-input" placeholder="検索...">
  <button id="clear-btn" class="clear-btn">×</button>
  <div id="result-count"></div>

  <div id="items-container">
    <div class="search-item">Item 1</div>
    <div class="search-item">Item 2</div>
  </div>

  <div id="no-results" style="display: none;">
    検索結果なし
  </div>

  <script src="./search-filter.js"></script>
  <script>
    // JavaScript プロパティは camelCase
    new SearchFilter({
      searchInputId: 'search-input',  // HTML ID は kebab-case
      itemSelector: '.search-item'    // HTML クラスは kebab-case
    }).init();
  </script>
</body>
</html>
```

## 移行ガイド

既存の camelCase から kebab-case への移行：

| 旧（camelCase） | 新（kebab-case） |
|----------------|-----------------|
| `searchInput` | `search-input` |
| `clearBtn` | `clear-btn` |
| `resultCount` | `result-count` |
| `itemsContainer` | `items-container` |
| `noResults` | `no-results` |
| `emptyState` | `empty-state` |

## まとめ

- **HTML/CSS**: kebab-case（`search-input`, `clear-btn`）
- **JavaScript プロパティ**: camelCase（`searchInputId`, `clearButtonId`）
- **一貫性を保つ**: プロジェクト全体でこの規約に従う
