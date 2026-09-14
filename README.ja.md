# ChatGPT & Codex Completion Sound

[English](README.md)

ChatGPT や Codex に長い処理を実行させている間に別作業を行い、
**処理終了時に音で知らせる**ための軽量な通知拡張です。

このリポジトリには独立した2つの拡張を収録しています。

- **ChatGPT Completion Sound** — Chrome / Brave 用 Manifest V3 拡張
- **Codex Completion Sound** — Windows版 VS Code 内の Codex 用拡張

## 機能

- 処理終了時に短い通知音を再生
- Chime / Bell / Double / Soft の4種類
- ブラウザ版：音量スライダー、ON/OFF、テスト再生
- VS Code版：0～100%（5%刻み）の音量、音選択、テスト再生、ON/OFF
- UI・ドキュメントは英語／日本語
- 解析、テレメトリ、広告、アカウント、外部コード読み込みなし
- ユーザーデータを外部送信しない

## プライバシー

ブラウザ版は、ChatGPTが「生成中」から「入力待ち」へ戻ったことを
判定するために、`chatgpt.com` のDOMをローカルで監視します。
保存するのは拡張の設定だけです。

VS Code版は `~/.codex/sessions` 配下のCodexセッションJSONLを
**読み取り専用**で監視します。VS Code由来のCodexタスク完了を判定するために
セッション／イベントのメタデータを確認しますが、
セッション内容を保存・送信・アップロードしません。

詳細は [PRIVACY.ja.md](PRIVACY.ja.md) を参照してください。

## ディレクトリ構成

```text
browser-extension/     Chrome / Brave Manifest V3 拡張
vscode-extension/      VS Code Codex 拡張
docs/                  公開手順、設計、ストア掲載文、チェックリスト
store-assets/          ストア用アイコン、プロモ画像、スクリーンショット
scripts/               設定・パッケージ作成スクリプト
.github/               CI、Issue/PRテンプレート
```

## ビルド

### ブラウザ版

```powershell
./scripts/build-browser.ps1
```

### VS Code版

```powershell
cd vscode-extension
npm test
npx --yes @vscode/vsce@latest package
```

Marketplace公開前に、永続的に使用するPublisher IDとGitHubリポジトリを設定します。

```powershell
./scripts/configure-release.ps1 `
  -PublisherId "YOUR_PERMANENT_PUBLISHER_ID" `
  -GitHubOwner "YOUR_GITHUB_USER_OR_ORG" `
  -RepositoryName "chatgpt-codex-completion-sound"
```

**VS Code MarketplaceのPublisher IDは後から気軽に変更する前提では
選ばないでください。**

## 公開手順

- [VS Code Marketplace](docs/VS_CODE_MARKETPLACE.ja.md)
- [Chrome Web Store](docs/CHROME_WEB_STORE.ja.md)
- [リリースチェックリスト](docs/RELEASE_CHECKLIST.ja.md)

## ライセンス

MIT Licenseです。[LICENSE](LICENSE) を参照してください。

## 免責

OpenAI非公式の独立プロジェクトです。[NOTICE.ja.md](NOTICE.ja.md) を参照してください。
