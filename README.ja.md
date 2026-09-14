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

## ブラウザ版 — GitHubからの導入方法

Chrome Web Storeを使わず、このGitHubリポジトリから直接導入できます。

1. GitHubの **Code > Download ZIP** からリポジトリをダウンロードします。
   Gitを使う場合はcloneでも構いません。
2. ZIPをダウンロードした場合は展開します。
3. Chromeなら `chrome://extensions/`、Braveなら `brave://extensions/` を開きます。
4. **デベロッパーモード** をONにします。
5. **パッケージ化されていない拡張機能を読み込む** を選びます。
6. リポジトリ内の `browser-extension` フォルダーを指定します。
7. すでにChatGPTを開いていた場合は、そのChatGPTタブを一度再読み込みします。

GitHubから手動導入した場合は**自動更新されません**。更新時は最新版を
再ダウンロード、または `git pull` したうえで、ブラウザの拡張機能ページから
この拡張を **再読み込み** し、すでに開いているChatGPTタブも一度再読み込みしてください。

## ブラウザ版 — 使い方

1. `https://chatgpt.com/` を通常どおり開きます。
2. ブラウザの拡張機能アイコンから **ChatGPT Completion Sound** を開きます。
3. 通知音のON/OFFを設定します。
4. 7種類から通知音を選びます。
5. 音量を調整します。通知音または音量を変更すると自動でプレビュー再生されます。
6. **テスト** ボタンで現在の設定音をいつでも確認できます。
7. ChatGPTへプロンプトを送信します。回答生成が終了すると選択した音が鳴ります。

回答生成中に別の既存ChatGPT会話へ移動した場合、その回答の追跡は解除されます。
これは別会話への移動後に誤通知が発生するのを防ぐための仕様です。

## プライバシー

ブラウザ版はChatGPTのUI状態をローカルで監視し、設定だけをブラウザ内に保存します。

VS Code版はローカルのCodex DB `~/.codex/logs_2.sqlite` を読み取り専用で開き、
`turn/started` / `turn/completed` の判定に必要なApp Serverの
ライフサイクルログを監視します。Codexログ内容を外部送信しません。

詳細は [PRIVACY.ja.md](PRIVACY.ja.md) を参照してください。

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

