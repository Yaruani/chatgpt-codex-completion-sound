# ChatGPT & Codex Completion Sound

[English](README.md)

ChatGPT や Codex に長い処理を実行させている間に別作業を行い、
処理終了時に音で知らせるための軽量な通知拡張です。

このリポジトリには独立した2つの拡張を収録しています。

- **ChatGPT Completion Sound** — Chrome / Brave 用 Manifest V3 拡張
- **Codex Completion Sound** — Windows版 VS Code 内の Codex 用拡張

## 機能

- 7種類の通知音
- ブラウザ版：ポップアップ設定、音量、ON/OFF、テスト再生、自動プレビュー、
  複数チャット同時追跡、別チャット移動後の追跡、バックグラウンドタブ通知
- VS Code版：標準の拡張機能設定画面、音量、main/subagent別の音選択、
  subagent通知ON/OFF、テスト再生、自動プレビュー、複数ウィンドウ共通設定、
  近接完了時の通知音キュー再生
- 英語／日本語UI
- 解析、テレメトリ、広告、アカウント、外部コード読み込みなし
- ユーザーデータを外部送信しない

## ブラウザ版 — GitHubからの推奨導入方法

[最新のGitHub Release](https://github.com/Yaruani/chatgpt-codex-completion-sound/releases/latest)
から次の2ファイルをWindowsのDownloadsへ保存します。

- `install-chatgpt-completion-sound.ps1`
- `chatgpt-completion-sound-browser-*-unpacked.zip`

手動更新でも設定を維持するため、拡張本体は次の固定フォルダーに配置します。

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

PowerShellで次を実行します。

```powershell
$d=(New-Object -ComObject Shell.Application).NameSpace("shell:Downloads").Self.Path; $s=Join-Path $d "install-chatgpt-completion-sound.ps1"; Unblock-File $s; & $s
```

DownloadsをE:など別ドライブへ移動していても、Windowsの既知フォルダーから
実際の場所を取得して追従します。拡張は
`%USERPROFILE%\Extensions\chatgpt-completion-sound` に配置・更新されます。

初回だけ、Chromeなら `chrome://extensions/`、Braveなら
`brave://extensions/` を開き、デベロッパーモードをONにして
**パッケージ化されていない拡張機能を読み込む** から上記固定フォルダーを
指定します。

以後の更新では**拡張を削除しません**。配置スクリプトを再実行してから、
拡張機能ページで既存拡張の **再読み込み** を押し、すでに開いている
ChatGPTタブも一度再読み込みします。同じ固定フォルダーを使い続けることで、
ON/OFF・通知音・音量のブラウザローカル設定を維持できます。

## ブラウザ版 — 使い方

`https://chatgpt.com/` を通常どおり利用します。ブラウザ版は複数の生成中会話を
会話ごとに独立して追跡できます。回答生成中に別のChatGPT会話へ移動しても、
元の会話をサイドバーから追跡します。複数回答が近い時刻に完了した場合も、
通知音を順番に再生するため前の音を途中で切りません。

別のブラウザタブへ移動した場合やブラウザ最小化中も通知できます。
ChatGPTページを閉じる、またはブラウザにページを破棄されると、そのページ側の
追跡は継続しません。

## プライバシー

ブラウザ版はChatGPTのUI状態をローカルで監視し、設定だけをブラウザ内に保存します。
追跡に使う会話パスや完了判定状態は一時的に拡張機能のメモリ上だけに保持します。

VS Code版は `~/.codex/sessions` 配下のCodex rollout JSONLをローカル監視し、
セッションメタデータとターンのライフサイクルイベントからmain/subagentを判定します。
継承履歴・起動前履歴・再読込イベントは通知対象外とし、rollout内容を外部送信したり
本拡張が独自に永続保存したりしません。

詳細は [PRIVACY.ja.md](PRIVACY.ja.md) を参照してください。

## ビルド

### ブラウザ版

```powershell
./scripts/build-browser.ps1
```

出力ファイル名：

```text
dist/chatgpt-completion-sound-browser-<version>-unpacked.zip
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
