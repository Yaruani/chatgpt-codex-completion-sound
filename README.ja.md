# ChatGPT & Codex Completion Sound

[English](README.md)

ChatGPT や Codex に長い処理を実行させている間に別作業を行い、
処理終了時に音で知らせるための軽量な通知拡張です。

このリポジトリには独立した2つの拡張を収録しています。

- **ChatGPT Completion Sound** — Chrome / Brave 用 Manifest V3 拡張
- **Codex Completion Sound** — Windows版 VS Code 内の Codex 用拡張

## 機能

- 7種類の通知音
- ブラウザ版：ポップアップ設定、音量、ON/OFF、テスト再生、自動プレビュー
- VS Code版：標準の拡張機能設定画面、音量、音選択、ON/OFF、テスト再生、
  自動プレビュー
- 英語／日本語UI
- 解析、テレメトリ、広告、アカウント、外部コード読み込みなし
- ユーザーデータを外部送信しない

## プライバシー

ブラウザ版はChatGPTのUI状態をローカルで監視し、設定だけをブラウザ内に保存します。

VS Code版はローカルのCodex DB `~/.codex/logs_2.sqlite` を読み取り専用で開き、
`turn/started` / `turn/completed` の判定に必要なApp Serverの
ライフサイクルログを監視します。Codexログ内容を外部送信しません。

詳細は [PRIVACY.ja.md](PRIVACY.ja.md) を参照してください。

## ブラウザ拡張の更新時

更新前からChatGPTタブを開いていた場合は、そのタブを一度再読み込みしてください。

## ビルド

### ブラウザ版

```powershell
./scripts/build-browser.ps1
```

### VS Code版

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

## ライセンス

MIT Licenseです。[LICENSE](LICENSE) を参照してください。

## 免責

OpenAI非公式の独立プロジェクトです。[NOTICE.ja.md](NOTICE.ja.md) を参照してください。
