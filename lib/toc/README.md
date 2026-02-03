# TOC (Table of Contents) Generator

シンプルな目次生成ライブラリ

## 特徴

- ✅ Pure Vanilla JavaScript（依存関係なし）
- ✅ file://プロトコル対応
- ✅ カスタマイズ可能なスタイル
- ✅ スムーススクロール対応
- ✅ 日本語見出し対応
- ✅ ダークモード対応
- ✅ レスポンシブデザイン

## ファイル構成

```
lib/toc/
├── index.js      # JavaScriptライブラリ
├── styles.css    # デフォルトスタイル
└── README.md     # このファイル
```

## 使い方

### 基本的な使い方

```html
<!DOCTYPE html>
<html>
<head>
  <title>TOC Example</title>
  <!-- CSSを読み込み -->
  <link rel="stylesheet" href="path/to/toc/styles.css" />
</head>
<body>
  <div id="toc"></div>
  <div id="content">
    <h2>見出し1</h2>
    <p>コンテンツ...</p>
    <h3>見出し1-1</h3>
    <p>コンテンツ...</p>
    <h2>見出し2</h2>
    <p>コンテンツ...</p>
  </div>

  <!-- JavaScriptを読み込み -->
  <script src="path/to/toc/index.js"></script>
  <script>
    // インスタンス作成と同時に自動初期化される
    const toc = new TOC();
  </script>
</body>
</html>
```

> **注意:** `init()`は自動的に呼び出されるため、手動で呼び出す必要はありません。

### オプション

```javascript
const toc = new TOC({
  tocSelector: '#toc',              // 目次を表示する要素のセレクター
  contentSelector: '#content',      // コンテンツ要素のセレクター
  headingSelector: 'h2, h3',        // 見出し要素のセレクター
  linkColor: 'var(--foreground)',   // リンクの色
  linkHoverColor: 'var(--accent)',  // リンクホバー時の色
  indentSize: '1rem',               // h3のインデントサイズ
  smoothScroll: true,               // スムーススクロールを有効化
  orderedList: true,                // 番号付きリストを有効化 (デフォルト: true)
  onClick: (heading, event) => {    // カスタムクリックハンドラー
    console.log('Clicked:', heading.textContent);
  }
});
```

## メソッド

### `init()`
目次を初期化して生成します。

**注意:** このメソッドはコンストラクタで自動的に呼び出されるため、通常は手動で呼び出す必要はありません。

```javascript
// 通常は不要（自動的に呼び出される）
toc.init();
```

### `destroy()`
目次を破棄します。

```javascript
toc.destroy();
```

### `refresh()`
目次を再生成します。

```javascript
toc.refresh();
```

## CSSクラス

### デフォルトスタイル

目次には自動的にスタイルが適用されます。CSS変数でカスタマイズ可能：

```css
:root {
  --foreground: #333;           /* テキスト色 */
  --muted: #f5f5f5;             /* 背景色 */
  --border: #e0e0e0;            /* ボーダー色 */
  --accent: #007bff;            /* アクセント色 */
  --accent-muted: rgba(0, 123, 255, 0.1); /* アクセント（薄） */
  --muted-foreground: #666;     /* 薄いテキスト色 */
  --radius: 8px;                /* 角丸 */
}
```

### 追加のCSSクラス

**タイトルを非表示:**
```html
<div id="toc" class="no-title"></div>
```

**コンパクト表示:**
```html
<div id="toc" class="compact"></div>
```

**スティッキー表示（サイドバー用）:**
```html
<div id="toc" class="sticky"></div>
```

## 例

### 番号付きリスト

```javascript
const toc = new TOC({
  orderedList: true, // 番号付きリストを有効化
});
```

**出力例:**
```
1. コードを編集する
    1.1. エディタ
2. 「お日にちがかかる…」の上書き
3. 現在の日時の表示
    3.1. サンプル
    3.2. 日時の形式
```

### 番号なしリスト

```javascript
const toc = new TOC({
  orderedList: false, // 番号なし
});
```

### CSS変数を使った色のカスタマイズ

```javascript
const toc = new TOC({
  linkColor: 'var(--foreground)',
  linkHoverColor: 'var(--accent)',
});
```

### スタイルなしで使用（カスタムCSS）

CSSを読み込まず、独自のスタイルを適用することも可能：

```html
<!-- styles.cssを読み込まない -->
<script src="path/to/toc/index.js"></script>
<script>
  const toc = new TOC();
</script>
```

### カスタムクリックハンドラー

```javascript
const toc = new TOC({
  onClick: (heading, event) => {
    // カスタム処理
    console.log('クリックされた見出し:', heading.textContent);

    // スクロール処理
    heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
});
```

### h4まで含める

```javascript
const toc = new TOC({
  headingSelector: 'h2, h3, h4',
});
```

## ブラウザサポート

- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

## ライセンス

MIT
