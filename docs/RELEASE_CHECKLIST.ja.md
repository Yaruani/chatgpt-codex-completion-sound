# リリースチェックリスト

## リポジトリ

- [x] GitHub Ownerを `Yaruani` に設定済み
- [x] VS Code Publisher IDを `yaruani` に設定済み
- [x] リポジトリをPublicに設定済み
- [x] Private vulnerability reportingを有効化済み
- [x] MIT LicenseのCopyright表記を確認済み

## バージョン／コード

- [ ] Browser manifestのversionが対象ブラウザ版リリースと一致
- [ ] VS Code packageのversionが対象VS Code版リリースと一致
- [ ] `npm test` 成功
- [ ] `npm run check` 成功
- [ ] リリースcommitのGitHub CI成功
- [ ] Browser版にservice worker/content scriptエラーなし
- [ ] Browser版の通常完了通知が1回だけ鳴る
- [ ] Browser版の複数チャット／別チャット移動／バックグラウンド試験成功
- [ ] Browser版更新後もON/OFF・通知音・音量設定を保持
- [ ] VS Code `Test Sound` 成功
- [ ] 実際のCodex `turn/completed` で1回だけ鳴る
- [ ] 7種類すべて再生可能
- [ ] 0%、5%、65%、100%をテスト

## プライバシー／セキュリティ

- [ ] 拡張自身のネットワーク通信を追加していない
- [ ] 解析／テレメトリを追加していない
- [ ] ブラウザ権限は最小限
- [ ] ホスト権限は `https://chatgpt.com/*` のみ
- [ ] `PRIVACY.ja.md` と実動作が一致
- [ ] 権限説明とmanifest／実装が一致
- [ ] 本番ファイルにdebug診断コード／debug版文字列が残っていない
- [ ] 個人パス、認証情報、token、プライベートIP、誤った端末／diff出力が
      commitされていない

## ドキュメント

- [ ] ルートREADME英語／日本語を確認
- [ ] ブラウザ版README英語／日本語を確認
- [ ] Architecture／Testingが現行実装と一致
- [ ] 英語／日本語ストア掲載文を確認
- [ ] コンポーネント別／ルートCHANGELOG更新

## GitHub Release

- [ ] Browser配布ZIPを
      `chatgpt-completion-sound-browser-<version>-unpacked.zip` で作成
- [ ] `install-chatgpt-completion-sound.ps1` をRelease assetに含める
- [ ] 対象VS Code版のVSIXを作成
- [ ] tag作成前に配布予定のBrowser ZIPそのものを実機テスト
- [ ] リリースcommit確認後にtagを作成・push
- [ ] GitHub Release workflow成功

## ストア

- [ ] VS Code Marketplace掲載内容が現行実装と一致
- [ ] Chrome Web Store掲載内容が現行実装と一致
- [ ] スクリーンショットが最終Popup UIと一致
- [ ] Privacy欄を実動作通りに入力
