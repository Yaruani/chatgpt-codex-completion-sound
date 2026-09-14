# Chrome Web Store 公開手順

公式ドキュメント:
https://developer.chrome.com/docs/webstore/

## パッケージ

アップロードZIPを作成:

```powershell
./scripts/build-browser.ps1
```

`dist/` に生成されたZIPをアップロードします。

## ストア掲載文

英語／日本語の掲載文を用意済みです。

- `docs/store-listing/chrome-en.md`
- `docs/store-listing/chrome-ja.md`

権限説明:

- `docs/PERMISSION_JUSTIFICATIONS.ja.md`

Privacy Policy:

- `PRIVACY.ja.md`

## 画像素材

`store-assets/chrome/` に以下を収録します。

- 128x128 ストアアイコン
- 440x280 small promo tile
- 1400x560 marquee promo image
- 1280x800 英語スクリーンショット
- 1280x800 日本語スクリーンショット

Chrome Web Storeでは、掲載情報とPrivacy情報が実際の動作と一致している必要があります。
申請前に最新版の動作と全項目を照合してください。

## Privacyタブ

本拡張は、

- ユーザーデータを収集しない
- 解析を行わない
- 広告を使用しない
- データを販売しない
- ChatGPT内容を外部送信しない
- `storage`、`offscreen`、`chatgpt.com` のホストアクセスを
  文書化した機能のためだけに使用

という設計です。

Dashboardの権限説明には、同梱の権限説明文を利用できます。

## ローカライズ

`_locales/en` と `_locales/ja` を収録しているため、
ストア掲載情報も英語／日本語にローカライズできます。

## 申請前テスト

アップロードするものと同一のZIPをChrome/Braveで展開読み込みし、
4種類の音、音量、ON/OFF、完了検出を確認してください。
