# ChatGPT Completion Sound

ChatGPTの回答生成が終了したときに、ローカル通知音を再生する
Chrome / Brave向け Manifest V3 拡張です。

## 機能

- Chime / Bell / Double / Soft / 電子レンジ風チン / ブライトベル /
  ゲームクリア風 の7種類
- 拡張専用の音量調整
- ON/OFF
- テスト再生、音の種類・音量変更時の自動プレビュー
- 複数の生成中チャットを会話ごとに独立して追跡
- 回答生成中に別のChatGPT会話へ移動しても元の会話を追跡
- ChatGPTページを開いたままであれば、別ブラウザタブへ移動した場合や
  ブラウザ最小化中も通知可能
- 複数回答が近い時刻に完了した場合は通知音を順番に再生
- 英語／日本語UI
- 解析、テレメトリ、広告、アカウント、リモートコードなし

## 完了判定

ChatGPTのUI状態をローカルで監視します。現在表示している会話では生成中の
停止コントロールを使い、別会話へ移動した後はサイドバー上の該当会話の
処理中状態を追跡します。会話URLごとに独立したTrackerを持ちます。

これはChatGPTの公開拡張APIではなく、現在のUI上で確認できる状態を利用した
判定です。そのため、将来ChatGPT側のUIが変更された場合は拡張側の更新が
必要になることがあります。

## GitHub版の推奨インストール方法

[最新のGitHub Release](https://github.com/Yaruani/chatgpt-codex-completion-sound/releases/latest)
から次の2ファイルをWindowsのDownloadsへ保存します。

- `install-chatgpt-completion-sound.ps1`
- `chatgpt-completion-sound-browser-*-unpacked.zip`

手動更新時にも設定を維持するため、拡張本体は次の固定フォルダーを使います。

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

実行コマンド：

```powershell
$d=(New-Object -ComObject Shell.Application).NameSpace("shell:Downloads").Self.Path; $s=Join-Path $d "install-chatgpt-completion-sound.ps1"; Unblock-File $s; & $s
```

DownloadsをE:など別ドライブへ移動していても、スクリプトはWindowsの
既知フォルダーから実際のDownloads場所を取得します。

初回だけ、Chromeなら `chrome://extensions/`、Braveなら
`brave://extensions/` を開き、デベロッパーモードをONにして
**パッケージ化されていない拡張機能を読み込む** から次を指定します。

```text
%USERPROFILE%\Extensions\chatgpt-completion-sound
```

以後の更新では**拡張を削除しません**。上の配置スクリプトを再実行し、
拡張機能ページで既存の拡張を **再読み込み** します。同じ固定パスを
使い続けることで、unpacked拡張の識別と `chrome.storage.local` の
ON/OFF・通知音・音量設定を維持できます。すでに開いているChatGPTタブは
最後に一度再読み込みしてください。

以前は別フォルダーから拡張を読み込んでいた場合、固定フォルダーへ切り替える
最初の1回だけ再インストール扱いとなり、設定が一度初期化される場合があります。
以後は通常の更新で設定を維持できます。

## 使い方

拡張ポップアップから通知ON/OFF、7種類の音、音量を設定できます。
テストボタンでも確認できます。通常どおりChatGPTへ送信すると、追跡中の
各会話が完了した時点でそれぞれ1回通知音が鳴ります。

ページ側の追跡にはChatGPTページが開いている必要があります。該当ページを閉じる、
またはブラウザによってページが破棄された場合、そのページ側の追跡は継続しません。

## プライバシー

`chatgpt.com` 上だけで動作し、UI状態をローカルで監視します。
`chrome.storage.local` に保存するのはON/OFF・通知音・音量だけです。
会話パスや完了判定状態は一時的に拡張機能のメモリ上だけに保持します。
会話内容を拡張機能が外部送信することはありません。

OpenAI非公式の独立拡張です。

Version: 1.3.2
