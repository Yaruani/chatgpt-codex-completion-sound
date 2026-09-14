# リリースチェックリスト

## リポジトリ

- [x] GitHub Ownerを `Yaruani` に設定済み
- [x] VS Code Publisher IDを `yaruani` に設定済み
- [ ] リポジトリをPublicに設定
- [ ] Private vulnerability reporting等の非公開セキュリティ報告経路を有効化
- [ ] MIT LicenseのCopyright表記を最終確認

## コード

- [ ] Browser manifest version = `1.2.0`
- [ ] VS Code package version = `1.2.0`
- [ ] `npm test` 成功
- [ ] `npm run check` 成功
- [ ] Browser版にservice worker/content scriptエラーなし
- [ ] Browser版が完了時に1回だけ鳴る
- [ ] VS Code `Test Sound` 成功
- [ ] 実際のCodex完了時に1回だけ鳴る
- [ ] 4種類すべて再生可能
- [ ] 0%、5%、65%、100%をテスト

## プライバシー／セキュリティ

- [ ] 独自ネットワーク通信なし
- [ ] 解析／テレメトリなし
- [ ] 新規ブラウザ権限なし
- [ ] `PRIVACY.ja.md` と実動作が一致
- [ ] 権限説明とmanifestが一致

## ドキュメント

- [ ] 英語README確認
- [ ] 日本語README確認
- [ ] 英語／日本語ストア掲載文確認
- [ ] CHANGELOG更新

## ストア

- [ ] VS Code Publisher ID確定
- [ ] 最新`vsce`でMarketplaceパッケージ作成
- [ ] Chrome Web Store ZIP作成
- [ ] ストアアイコン登録
- [ ] Chromeスクリーンショット登録
- [ ] Chrome small promo tile登録
- [ ] Privacy欄を実動作通りに入力

