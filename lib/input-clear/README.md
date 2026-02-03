# InputClear

テキストボックスに自動的にクリアボタンを追加するライブラリです。

## 特徴

- ✅ **Pure Vanilla JavaScript** - フレームワーク不要
- ✅ **file://プロトコル対応** - ローカルファイルで動作
- ✅ **軽量** - 依存関係なし
- ✅ **カスタマイズ可能** - 豊富なオプション
- ✅ **アクセシビリティ対応** - aria-label, キーボード操作
- ✅ **イベント対応** - カスタムイベント、コールバック

## インストール

### 1. ファイルをダウンロード

```bash
# プロジェクトのlib/input-clearディレクトリに配置
lib/input-clear/
├── index.js
├── example.html
└── README.md
```

### 2. HTMLで読み込み

```html
<script src="lib/input-clear/index.js"></script>
```

## 基本的な使用方法

### HTML

```html
<!-- data-clearable属性を追加 -->
<input type="text" data-clearable placeholder="入力してください">

<!-- またはクラス名で指定 -->
<input type="text" class="clearable" placeholder="入力してください">
```

### JavaScript

```javascript
// data-clearable属性を持つすべてのinputに適用
new InputClear();

// カスタムセレクターで指定
new InputClear({ selector: '.clearable' });
```

## オプション

| オプション | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| `selector` | `string` | `'[data-clearable]'` | 対象のinput要素のセレクター |
| `buttonClass` | `string` | `'input-clear-button'` | クリアボタンのクラス名 |
| `wrapperClass` | `string` | `'input-clear-wrapper'` | ラッパー要素のクラス名 |
| `buttonHTML` | `string` | `'×'` | ボタンの内容（HTML可） |
| `showOnFocus` | `boolean` | `false` | フォーカス時のみ表示 |
| `showOnValue` | `boolean` | `true` | 値がある時のみ表示 |
| `position` | `string` | `'right'` | ボタンの位置 (`'right'` または `'left'`) |
| `onClear` | `Function` | `null` | クリア時のコールバック |
| `animation` | `boolean` | `true` | アニメーション有効化 |

## 使用例

### 1. カスタムアイコン

```javascript
new InputClear({
  selector: '[data-clearable]',
  buttonHTML: '🗑️'
});
```

### 2. フォーカス時のみ表示

```javascript
new InputClear({
  selector: '.clearable',
  showOnFocus: true
});
```

### 3. ボタンを左側に配置

```javascript
new InputClear({
  selector: '.clearable',
  position: 'left'
});
```

### 4. コールバック関数

```javascript
new InputClear({
  selector: '.clearable',
  onClear: (input, oldValue) => {
    console.log(`"${oldValue}" がクリアされました`);
  }
});
```

### 5. カスタムイベント

```javascript
const input = document.getElementById('myInput');

input.addEventListener('inputclear', (e) => {
  console.log('クリアされた値:', e.detail.oldValue);
});
```

### 6. 動的に追加されたinput要素

```javascript
const clearInstance = new InputClear({ selector: '.clearable' });

// 後から追加されたinputにも適用
const newInput = document.createElement('input');
newInput.className = 'clearable';
document.body.appendChild(newInput);

clearInstance.add(newInput);
```

## API

### コンストラクター

```javascript
new InputClear(options)
```

指定されたセレクターに一致するすべてのinput要素にクリアボタンを追加します。

### メソッド

#### `add(input)`

新しいinput要素にクリアボタンを追加します。

```javascript
const clearInstance = new InputClear();

// HTMLElementを渡す
const input = document.getElementById('myInput');
clearInstance.add(input);

// セレクターを渡す
clearInstance.add('.new-inputs');
```

#### `remove(input)`

特定のinput要素のクリアボタンを削除します。

```javascript
const input = document.getElementById('myInput');
clearInstance.remove(input);
```

#### `destroy()`

すべてのクリアボタンを削除し、インスタンスを破棄します。

```javascript
clearInstance.destroy();
```

#### `updateOptions(options)`

設定を更新し、既存のインスタンスを再初期化します。

```javascript
clearInstance.updateOptions({
  buttonHTML: '✕',
  showOnFocus: true
});
```

## サポートされるinputタイプ

以下のinputタイプに対応しています:

- `text`
- `search`
- `tel`
- `url`
- `email`
- `password`

## イベント

### `inputclear`

クリアボタンがクリックされた時に発火するカスタムイベントです。

```javascript
input.addEventListener('inputclear', (event) => {
  console.log('元の値:', event.detail.oldValue);
});
```

**イベント詳細:**
- `event.detail.oldValue` - クリアされる前の値

### 標準イベント

クリアボタンをクリックすると、以下の標準イベントも発火します:

- `input` - input要素の値が変更された
- `change` - input要素の値が変更され、フォーカスが外れた

これにより、他のライブラリやフォームバリデーションとの互換性が保たれます。

## スタイルのカスタマイズ

デフォルトのスタイルは自動的に注入されますが、CSSで上書きできます。

```css
/* ボタンのスタイルを変更 */
.input-clear-button {
  color: #ff0000 !important;
  font-size: 1.5em !important;
}

/* ホバー時のスタイル */
.input-clear-button:hover {
  color: #cc0000 !important;
}

/* ラッパーのスタイル */
.input-clear-wrapper {
  /* カスタムスタイル */
}
```

## ブラウザサポート

モダンブラウザで動作します:

- ✅ Chrome 61+
- ✅ Firefox 60+
- ✅ Safari 10.1+
- ✅ Edge 16+
- ❌ IE11（非対応）

## ライセンス

MIT License

## デモ

[example.html](example.html) を開いて、動作を確認できます。

```bash
# ローカルでデモを開く（file://プロトコルで動作）
open lib/input-clear/example.html
```

または、ブラウザで直接ファイルを開いてください。

## 変更履歴

### v1.0.0 (2025-02-03)

- 初回リリース
- 基本機能の実装
- カスタマイズオプションの追加
- アクセシビリティ対応
- イベントシステムの実装

## トラブルシューティング

### クリアボタンが表示されない

1. `selector` オプションが正しいか確認
2. input要素のtypeがサポートされているか確認
3. ブラウザのDevToolsでエラーがないか確認

### スタイルが適用されない

1. `styleInjected` が true になっているか確認
2. CSSの優先度を `!important` で上書き
3. カスタムCSSを後から読み込む

### 動的に追加したinputに反映されない

`add()` メソッドを使用してください:

```javascript
const clearInstance = new InputClear();
clearInstance.add(newInput);
```

## 貢献

バグ報告や機能リクエストは、GitHubのIssueでお願いします。

## 作者

2025年
