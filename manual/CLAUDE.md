# ログ管理アプリ - プロジェクトドキュメント

## プロジェクト概要

このアプリは、コールセンターの対応履歴を記録・管理するためのログ管理Webアプリケーションです。
検索機能、フィルタリング、クリップボードコピー機能を備えています。

**重要な特徴:**
- ✅ file://プロトコルで動作（Webサーバー不要）
- ✅ Pure Vanilla JavaScript（フレームワーク不要）
- ✅ ローカルファイルとして直接ブラウザで開ける
- ✅ 外部ライブラリは通常の`<script>`タグで読み込み（ES Modules不使用）

## ⚠️ 重要：file://プロトコルの制約

### ES Modulesは使用不可

**❌ 動作しない書き方:**
```html
<!-- CORS エラーが発生 -->
<script type="module" src="../lib/something.js"></script>
```

**エラーメッセージ:**
```
Access to script at 'file:///...' from origin 'null' has been blocked by CORS policy
```

**✅ 正しい書き方:**
```html
<!-- 通常の script タグを使用 -->
<script src="../lib/something.js"></script>
```

### JavaScriptファイルの実装方法

**IIFE（即時実行関数）パターンを使用:**
```javascript
(function () {
  "use strict";

  class MyClass {
    // ...実装
  }

  // グローバルに公開
  window.MyClass = MyClass;

  // 自動初期化
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      window.__myInstance = new MyClass();
      window.__myInstance.init();
    });
  } else {
    window.__myInstance = new MyClass();
    window.__myInstance.init();
  }
})();
```

**ポイント:**
- ✅ `type="module"`を使わない
- ✅ `import/export`を使わない
- ✅ IIFEでスコープを分離
- ✅ 必要なものだけ`window`に公開

## 現在のファイル構成

```
logs/
├── index.html              # メインHTMLファイル
├── CLAUDE.md              # このドキュメント
└── (将来的にJSファイルを追加予定)
```

### 使用ライブラリ

**外部ライブラリ（通常のscriptタグで読み込み）:**
- `../vendor/bootstrap/bootstrap.bundle.min.js` - UIフレームワーク
- `../lib/search-filter/search-filter.js` - 検索・フィルタリング機能
- `../lib/copy-handler/` - クリップボードコピー機能
- `../lib/checkbox-text-toggler/` - チェックボックス連動テキスト更新

## 主要機能

### 1. チェックボックス連動テキスト更新

[lib/checkbox-text-toggler/index.js](../lib/checkbox-text-toggler/index.js) を使用。

**HTML例:**
```html
<label>
  <input
    type="checkbox"
    id="taishogai-status-checkbox"
    data-target-class="taishogai-status"
    data-true-value="済"
    data-false-value="未"
  />
  済
</label>

<div class="copyable">
  ・保証対象外部位案内<span class="taishogai-status">未</span><br />
  ・年末年始トーク案内<span class="taishogai-status">未</span>
</div>
```

**動作:**
- チェックボックスをON → `.taishogai-status`の全要素が「済」に変更
- チェックボックスをOFF → `.taishogai-status`の全要素が「未」に変更

**プログラムからの操作:**
```javascript
// チェックボックスの状態を変更
window.__checkboxTextToggler.setCheckboxState('taishogai-status-checkbox', true);

// 直接テキストを更新
window.__checkboxTextToggler.updateTargets('taishogai-status', '完了');
```

### 2. 検索・フィルタリング機能

[lib/search-filter/](../lib/search-filter/) を使用。

**初期化:**
```javascript
new SearchFilter();
```

### 3. クリップボードコピー機能

[lib/copy-handler/](../lib/copy-handler/) を使用。

**HTML例:**
```html
<div class="copyable">
  ・保証対象外部位案内<span class="taishogai-status">未</span>
</div>
```

**動作:**
- `.copyable`要素を右クリック → クリップボードにコピー

## 新しいライブラリを追加する際の注意事項

### ✅ DO（推奨する方法）

1. **IIFEパターンを使用:**
```javascript
(function () {
  "use strict";

  class MyLibrary {
    // 実装
  }

  window.MyLibrary = MyLibrary;
})();
```

2. **通常のscriptタグで読み込み:**
```html
<script src="../lib/my-library/index.js"></script>
```

3. **相対パスを正確に指定:**
```html
<!-- logs/index.html から読み込む場合 -->
<script src="../lib/my-library/index.js"></script>
```

### ❌ DON'T（避けるべき方法）

1. **ES Modulesを使用しない:**
```javascript
// ❌ file://では動作しない
export class MyLibrary { }
import { MyLibrary } from './my-library.js';
```

2. **動的importを使用しない:**
```javascript
// ❌ file://では制限がある
const module = await import('./my-library.js');
```

3. **CDNから直接読み込まない（オフライン動作のため）:**
```html
<!-- ❌ オフラインで動作しない -->
<script src="https://cdn.example.com/library.js"></script>
```

## 開発環境

### 必要なもの

- モダンブラウザ（Chrome, Firefox, Edge, Safari）
- テキストエディタ（VS Code推奨）

### 開発の流れ

1. ファイルを編集
2. ブラウザで `logs/index.html` を開く（またはリロード）
3. DevToolsのConsoleでデバッグ
4. 必要に応じて修正

### デバッグ方法

**Consoleでの確認:**
```javascript
// チェックボックストグラーの状態確認
window.__checkboxTextToggler

// 検索フィルターの状態確認
window.__searchFilter
```

**ブラウザのDevTools:**
- Elements: DOM構造の確認
- Console: エラーメッセージ、ログ出力
- Network: ファイル読み込みの確認（file://では制限あり）
- Sources: JavaScriptのデバッグ

## トラブルシューティング

### Q: scriptが読み込まれない

**A: パスを確認:**
```html
<!-- logs/index.html からの相対パス -->
<script src="../lib/my-library/index.js"></script>

<!-- 絶対パスは避ける（環境依存） -->
<script src="/lib/my-library/index.js"></script> <!-- ❌ -->
```

### Q: CORSエラーが発生する

**A: ES Modulesを使っていないか確認:**
```html
<!-- ❌ file://では動作しない -->
<script type="module" src="..."></script>

<!-- ✅ 正しい -->
<script src="..."></script>
```

### Q: ライブラリが動作しない

**A: 読み込み順序を確認:**
```html
<!-- 依存関係がある場合は順番が重要 -->
<script src="../lib/base-library.js"></script>
<script src="../lib/dependent-library.js"></script>
```

**A: DOMContentLoadedを待っているか確認:**
```javascript
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // 初期化処理
  });
} else {
  // すでに読み込み済み
  // 初期化処理
}
```

## ベストプラクティス

### 1. グローバル変数の管理

**名前空間を使用:**
```javascript
// ✅ プレフィックスで衝突を避ける
window.__checkboxTextToggler
window.__searchFilter

// ❌ 短い名前は衝突のリスク
window.toggler
window.filter
```

### 2. イベントリスナーのクリーンアップ

```javascript
class MyComponent {
  constructor() {
    this.cleanupFns = [];
  }

  mount() {
    const handler = () => { /* ... */ };
    element.addEventListener('click', handler);

    // クリーンアップ関数を保存
    this.cleanupFns.push(() => {
      element.removeEventListener('click', handler);
    });
  }

  unmount() {
    this.cleanupFns.forEach(fn => fn());
    this.cleanupFns = [];
  }
}
```

### 3. data属性を活用

```html
<!-- ✅ 設定をHTMLに記述 -->
<input
  type="checkbox"
  data-target-class="status-text"
  data-true-value="済"
  data-false-value="未"
/>

<!-- ❌ JavaScriptにハードコード -->
<input type="checkbox" id="my-checkbox" />
<script>
  // 設定がJSに分散
  const config = { trueValue: '済', falseValue: '未' };
</script>
```

### 4. 自動初期化の実装

```javascript
(function () {
  class MyLibrary {
    // ...
  }

  // 自動初期化（オプショナル）
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      if (!window.__myLibrary) {
        window.__myLibrary = new MyLibrary();
        window.__myLibrary.init();
      }
    });
  } else {
    if (!window.__myLibrary) {
      window.__myLibrary = new MyLibrary();
      window.__myLibrary.init();
    }
  }
})();
```

## 参考リソース

### file://プロトコルの制約

- **MDN - Same-origin policy**: https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy
- **file:// の制限**: ローカルファイルからの `fetch()`, `XMLHttpRequest`, ES Modules の import には制限がある

### JavaScript パターン

- **IIFE**: https://developer.mozilla.org/en-US/docs/Glossary/IIFE
- **Module Pattern**: JavaScript デザインパターン

## 更新履歴

- 2026-01-06: ログ管理アプリ用ドキュメント作成
- 2026-01-06: checkbox-text-toggler ライブラリ追加
