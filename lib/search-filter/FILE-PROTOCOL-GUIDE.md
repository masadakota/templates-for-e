# file://プロトコルで使う方法

## 問題

ES Modulesは`file://`プロトコルでCORS制限があり、以下のエラーが発生します：

```
Access to script at 'file:///path/to/SearchFilter.js' from origin 'null'
has been blocked by CORS policy
```

## 解決方法

### 方法1: UMD版を使う（推奨）

通常の`<script>`タグで読み込める**UMD版**を使用します。

```html
<!-- UMD版（file://プロトコル対応） -->
<script src="../lib/search-filter/search-filter.min.js"></script>
<script>
  // グローバルスコープでSearchFilterが使える
  new SearchFilter().init();
</script>
```

**ファイル:**
- `lib/search-filter/search-filter.min.js` - file://プロトコル対応版

**メリット:**
- ✅ file://プロトコルで動作
- ✅ 設定不要
- ✅ すべてのブラウザで動作

**デメリット:**
- ❌ グローバルスコープを汚染
- ❌ モジュールではない

---

### 方法2: ES Modules版を使う（Webサーバー必要）

開発用Webサーバーを起動してES Modules版を使用します。

```html
<!-- ES Modules版（Webサーバー必要） -->
<script type="module">
  import SearchFilter from './lib/search-filter/SearchFilter.js';
  new SearchFilter().init();
</script>
```

**簡易Webサーバーの起動:**

```bash
# Python 3
python -m http.server 8000

# Node.js (npxが使える場合)
npx http-server

# VS Code
# Live Server拡張機能を使用
```

ブラウザで http://localhost:8000/logs/ を開く

**メリット:**
- ✅ ES Modulesが使える
- ✅ グローバルスコープを汚染しない
- ✅ モダンな開発スタイル

**デメリット:**
- ❌ Webサーバーが必要
- ❌ file://プロトコルでは動作しない

---

### 方法3: ブラウザのセキュリティを無効化（非推奨）

**Chrome:**
```bash
chrome.exe --allow-file-access-from-files
```

**⚠️ 警告:**
- セキュリティリスクがあります
- 開発用途のみ
- 本番環境では絶対に使用しないでください

---

## 使用ファイルの違い

| ファイル | 形式 | file://対応 | 用途 |
|---------|------|------------|------|
| `search-filter.min.js` | UMD | ✅ | file://プロトコル用 |
| `SearchFilter.js` | ES Module | ❌ | Webサーバー用 |

---

## 推奨: UMD版を使う

**logs/index.html の例:**

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <title>履歴</title>
  <style>
    .hidden { display: none; }
    .clear-btn.visible { opacity: 1; }
  </style>
</head>
<body>
  <input type="text" id="searchInput" placeholder="検索...">
  <button id="clearBtn">×</button>
  <div id="resultCount"></div>

  <div id="itemsContainer">
    <div class="search-item">test</div>
    <div class="search-item">Hello</div>
    <div class="search-item">Test2</div>
  </div>

  <div id="noResults" style="display: none;">
    検索結果なし
  </div>

  <!-- UMD版を使用（file://で動作） -->
  <script src="../lib/search-filter/search-filter.min.js"></script>
  <script>
    new SearchFilter().init();
  </script>
</body>
</html>
```

---

## よくある質問

### Q: なぜES Modulesはfile://で動かないの？

**A:** ブラウザのセキュリティポリシー（CORS）により、`file://`プロトコルでは異なるファイル間のモジュール読み込みがブロックされます。

### Q: UMD版とES Modules版の違いは？

**A:**
- **UMD版**: グローバル変数`SearchFilter`として公開、どこからでもアクセス可能
- **ES Modules版**: `import`でモジュールとして読み込み、スコープが分離

### Q: どちらを使うべき？

**A:**
- **file://で開く場合**: UMD版（`search-filter.min.js`）
- **Webサーバーで開く場合**: ES Modules版（`SearchFilter.js`）

---

## トラブルシューティング

### エラー: "SearchFilter is not defined"

**原因:** UMD版のスクリプトが読み込まれていない

**解決:**
```html
<!-- このスクリプトが読み込まれているか確認 -->
<script src="../lib/search-filter/search-filter.min.js"></script>
```

### エラー: "CORS policy"

**原因:** ES Modules版をfile://で使おうとしている

**解決:**
- UMD版に切り替える、または
- Webサーバーを起動する

---

## まとめ

- **file://プロトコル**: `search-filter.min.js`（UMD版）を使う
- **Webサーバー**: `SearchFilter.js`（ES Modules版）を使う
- **どちらも機能は同じ**: デフォルト設定で`new SearchFilter().init()`で動作
