# VS Code Marketplace 公開手順

公式ドキュメント:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## 初回設定

1. MarketplaceのPublisherを作成
2. **Publisher ID** を確定
3. リポジトリに設定

```powershell
./scripts/configure-release.ps1 `
  -PublisherId "your-real-publisher-id" `
  -GitHubOwner "your-github-owner" `
  -RepositoryName "chatgpt-codex-completion-sound"
```

4. `vscode-extension/package.json` を確認
5. 公開GitHubリポジトリを作成

Publisher IDは拡張の識別子に含まれるため、永続的なIDとして扱ってください。

## 検証

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

VS Code Marketplaceの拡張アイコンはPNGが必要です。
このリポジトリには `images/icon.png` を収録しています。

## 公開

認証方式はMicrosoftの最新公式手順に従ってください。
MicrosoftはAzure DevOpsのglobal PATを2026年12月1日に廃止すると案内しているため、
長期運用をglobal PAT前提で設計しないでください。

認証後の代表的なコマンド:

```powershell
npx --yes @vscode/vsce@latest publish
```

VSIXを作成してMarketplace管理画面から手動アップロードする方法もあります。

## 準備済み項目

- 表示名／説明
- カテゴリ／キーワード
- Free価格
- PNGアイコン
- README
- CHANGELOG
- LICENSE
- Repository / Issues / Homepageのプレースホルダー
- 英語／日本語のコマンド表示

## 初回公開前

- プレースホルダーをすべて置換
- Marketplace上で名称が使用可能か確認
- GitHubの非公開セキュリティ報告経路を有効化
- Privacy Policyを最終確認
- 新規Windows VS Codeプロファイルで動作確認
