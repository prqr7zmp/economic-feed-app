# Economic Feed App

このリポジトリは Vite + React ベースのフィードダッシュボードです。以下は GitHub Pages へデプロイするための手順です。

## 前提

- Node.js と npm がインストールされていること
- リポジトリ名は `economic-feed-app`（GitHub Pages のパスに合わせて `vite.config.js` の `base` を設定する必要があります）

---

## 自動デプロイ（推奨）: `gh-pages` パッケージを使用

1. 依存を追加する（開発環境）:

```bash
npm install --save-dev gh-pages
```

2. `package.json` の `scripts` に以下を追加または更新します:

```json
"scripts": {
	"dev": "vite",
	"build": "vite build",
	"predeploy": "npm run build",
	"deploy": "gh-pages -d dist",
	"preview": "vite preview"
}
```

3. `vite.config.js` の `base` をリポジトリ名に合わせて設定します（例: `https://<user>.github.io/economic-feed-app/` を使う場合）:

```js
export default defineConfig({
	plugins: [react()],
	base: '/economic-feed-app/',
})
```

4. デプロイ実行:

```bash
npm run deploy
```

このコマンドは `dist` を生成して自動的に `gh-pages` ブランチへ公開します。GitHub のリポジトリ設定で Pages の公開先が `gh-pages`/`/(root)` になっていることを確認してください。

---

## 手動デプロイ（`gh-pages` を使わない場合）

1. ビルド:

```bash
npm run build
```

2. 生成された `dist` フォルダの中身（`index.html` と `assets` 等）を、公開用ブランチ（例: `gh-pages`）のルートにコピーします。

3. コピーした変更を commit & push します。

4. GitHub の **Settings → Pages** で公開ブランチとルート(`/ (root)`) を設定します。

---

## ルート(`/`)で公開したい場合（個人/組織サイトやカスタムドメイン）

- `base` を `/` に戻し、ビルドしてデプロイしてください。リポジトリ名ベースの公開（`/<repo>/`）とルート公開はアセットの読み込みパスが変わるため、`vite.config.js` の `base` を目的に合わせて切り替える必要があります。

例:

```js
export default defineConfig({
	plugins: [react()],
	base: '/',
})
```

---

## トラブルシューティング

- ページが白紙（何も表示されない）になる場合、多くはアセット（JS/CSS）が 404 になっていることが原因です。ブラウザのデベロッパーツールでネットワークタブを確認し、リクエストパスが `https://<user>.github.io/economic-feed-app/assets/...` のように正しいか確認してください。
- `base` を誤って `/` のままにすると、リポジトリベース公開時にアセットがルートから読み込まれ404になります。

---

必要なら、この README を元に `package.json` の更新や `gh-pages` による初回デプロイまで代行します。どうしますか？

