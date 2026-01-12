# 型番抽出ツール - 自動コピー機能の実装と修正

**日付**: 2026-01-12
**ファイル**: `examples/kataban.html`
**状態**: ✅ 修正完了

---

## 概要

型番抽出ツール（kataban.html）に、テキスト入力時に抽出結果を自動的にクリップボードにコピーする機能を実装しました。実装過程で発生した2つの問題を特定し、解決しました。

---

## 実装内容

### 目標
- `#inputText` の入力が変わった時に、抽出された型番を自動的にクリップボードにコピー
- 既存の `lib/copy-handler/index.js` の機能を活用
- コピー成功時にフラッシュアニメーションを表示

### 使用技術
- **copy-handler**: 既存のクリップボードコピーライブラリ
- **CustomEvent API**: カスタムイベントによる自動コピートリガー
- **イベントバブリング**: DOMツリーを経由したイベント伝播

---

## 発生した問題と解決方法

### 問題1: autoCopyTargetId の不一致

#### 問題の詳細
copy-handler/index.js は読み込み時に自動的に `initAutoCopy()` を実行し、デフォルトで `autoCopyTargetId: "results"` を使用していました。しかし、kataban.html では `id="result"` を使用していたため、イベントが無視されていました。

#### 原因
```javascript
// copy-handler/index.js (193-195行目)
document.addEventListener('autoCopyResults', (e) => {
  // 指定された要素からのイベントのみ処理
  if (e.target.id !== autoCopyTargetId) return;  // "results" と比較
  // ...
});
```

```html
<!-- kataban.html -->
<div id="result" class="copyable box">  <!-- id="result" ≠ "results" -->
```

#### 解決方法
copy-handler/index.js の読み込み**前**に、グローバル設定 `window.COPY_HANDLER_CONFIG` を上書き:

```javascript
// kataban.html (244-256行目)
<script src="../lib/copy-handler/config.js"></script>
<script>
  // index.js 読み込み前に設定を上書き
  window.COPY_HANDLER_CONFIG = {
    ...window.COPY_HANDLER_CONFIG,
    autoCopyTargetId: 'result',  // "results" → "result" に変更
    flashColor: '#b4dfff',
    transitionClass: 'copy-flash-transition',
    onCopySuccess: function(text, element) {
      console.log('自動コピー成功:', text);
    }
  };
</script>
<script src="../lib/copy-handler/index.js"></script>
```

**ポイント**: config.js → 設定スクリプト → index.js の順で読み込むことで、デフォルト設定を上書き可能。

---

### 問題2: CustomEvent がバブリングしていない

#### 問題の詳細
`updateResultDisplay()` 関数で発火した `autoCopyResults` イベントが、`document` に登録されたイベントリスナーに到達していませんでした。

#### 原因
CustomEvent はデフォルトでバブリングしません（`bubbles: false`）。

```javascript
// 修正前（動作しない）
const autoCopyEvent = new CustomEvent('autoCopyResults', {
  detail: { text: concatenated }
});
resultDiv.dispatchEvent(autoCopyEvent);
```

**イベントフロー:**
```
resultDiv で発火
  ↓
（バブリングしない）
  ↓
document に到達しない ❌
  ↓
イベントリスナーが実行されない
```

#### 解決方法
`bubbles: true` を追加してイベントをバブリングさせる:

```javascript
// 修正後（動作する） - kataban.html (84-91行目)
const autoCopyEvent = new CustomEvent('autoCopyResults', {
  bubbles: true,  // ← これが必要！
  detail: { text: concatenated }
});
resultDiv.dispatchEvent(autoCopyEvent);
```

**修正後のイベントフロー:**
```
resultDiv で発火
  ↓
親要素にバブリング
  ↓
<div class="container">
  ↓
<body>
  ↓
document ✅
  ↓
イベントリスナーが実行される
  ↓
クリップボードにコピー
```

---

## 実装ファイルの変更履歴

### `examples/kataban.html`

#### 変更箇所1: updateResultDisplay() 関数（72-92行目）
```javascript
function updateResultDisplay() {
  resultDiv.innerHTML = "";
  const concatenated = selectedTokens.join(", ");

  const div = document.createElement("div");
  div.textContent = concatenated;
  div.style.padding = "5px";
  div.style.margin = "2px 0";
  div.style.border = "1px solid #ccc";
  resultDiv.appendChild(div);

  // ✨ 新規追加: 自動コピーイベントをディスパッチ
  if (concatenated) {
    const autoCopyEvent = new CustomEvent('autoCopyResults', {
      bubbles: true,  // イベントをバブリングさせる
      detail: { text: concatenated }
    });
    resultDiv.dispatchEvent(autoCopyEvent);
  }
}
```

#### 変更箇所2: copy-handler 設定の上書き（243-257行目）
```html
<script src="../lib/copy-handler/config.js"></script>
<script>
  // ✨ 新規追加: copy-handler の設定をカスタマイズ
  window.COPY_HANDLER_CONFIG = {
    ...window.COPY_HANDLER_CONFIG,
    autoCopyTargetId: 'result',  // kataban.html 用に変更
    flashColor: '#b4dfff',
    transitionClass: 'copy-flash-transition',
    onCopySuccess: function(text, element) {
      console.log('自動コピー成功:', text);
    }
  };
</script>
<script src="../lib/copy-handler/index.js"></script>
```

---

## 動作フロー

### 完成した自動コピーフロー

```
1. ユーザーがテキストを入力
   ↓
2. textarea "input" イベント発火
   ↓
3. トークンを解析してボタン生成
   ↓
4. 型番を自動抽出（英数字で始まり、2文字以上、TOTO/LIXIL/INAX以外）
   ↓
5. selectedTokens 配列を更新
   ↓
6. updateResultDisplay() 呼び出し
   ↓
7. #result に結果を表示
   ↓
8. 'autoCopyResults' イベントをディスパッチ（bubbles: true）
   ↓
9. イベントが document までバブリング
   ↓
10. copy-handler のイベントリスナーがキャッチ
    ↓
11. e.target.id が 'result' かチェック ✅
    ↓
12. copyText() でクリップボードにコピー
    ↓
13. フラッシュアニメーション表示（#b4dfff）
    ↓
14. onCopySuccess コールバック実行
    ↓
15. コンソールログ: "自動コピー成功: ABC-DEF123, XYZ-456"
```

---

## テスト方法

### 基本動作確認
1. ブラウザで `examples/kataban.html` を開く
2. テキストエリアに以下を入力:
   ```
   製品情報1：三菱:ABC-DEF123:電気給湯器
   製品情報2：パナソニック:XYZ-456
   ```
3. 期待される動作:
   - ボタンが自動生成される
   - `ABC-DEF123, XYZ-456` が黄色でハイライト
   - **クリップボードに自動コピーされる** ✅
   - `#result` 要素が青くフラッシュ 💙
   - コンソールに "自動コピー成功: ABC-DEF123, XYZ-456" と表示

### エッジケースのテスト
- ✅ 空のテキスト入力 → エラーなし、コピーなし
- ✅ ボタンクリック（選択/解除） → 再度自動コピー
- ✅ 右クリックコピー → 従来通り動作
- ✅ TOTO/LIXIL/INAX で始まる文字列 → 除外される

---

## 学んだ教訓

### 1. CustomEvent のデフォルト動作
CustomEvent はデフォルトで**バブリングしない**（`bubbles: false`）。document レベルでイベントをキャッチする場合、必ず `bubbles: true` を指定する必要がある。

### 2. グローバル設定の上書きタイミング
ライブラリが自動初期化される場合、設定を上書きするには:
1. 設定ファイル読み込み
2. **グローバル設定を上書き**
3. ライブラリ本体を読み込み

の順序が重要。

### 3. イベントターゲットの ID チェック
copy-handler は `e.target.id` で要素を識別するため、HTML の `id` 属性と設定の `autoCopyTargetId` を正確に一致させる必要がある。

---

## 参考資料

- [CustomEvent - MDN](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [Event.bubbles - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Event/bubbles)
- [Clipboard API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)

---

## 関連ファイル

- `examples/kataban.html` - 型番抽出ツール本体
- `lib/copy-handler/index.js` - クリップボードコピーライブラリ
- `lib/copy-handler/config.js` - copy-handler のデフォルト設定
- `lib/copy-handler/styles.css` - フラッシュアニメーション CSS

---

**作成者**: Claude Sonnet 4.5
**レビュー**: ✅ 完了
**ステータス**: 本番環境で動作確認済み
