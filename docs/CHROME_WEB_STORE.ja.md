# Chrome Web Store 公開手順

アップロードZIPは次で作成します。

```powershell
./scripts/build-browser.ps1
```

出力ファイル名：

```text
dist/chatgpt-completion-sound-browser-<version>-unpacked.zip
```

申請前に、アップロードするものと同一のZIPをChrome/Braveで確認します。

- 7種類の音
- 自動プレビュー
- 音量とON/OFF
- テスト再生
- 通常の完了検出
- 生成中に別ChatGPT会話へ移動した後も元会話を追跡できること
- 2会話同時生成 → 第3会話へ移動 → ブラウザをバックグラウンドにしても
  2会話それぞれの完了通知が鳴ること
- ほぼ同時完了でも通知音がキュー再生されること
- 固定フォルダー配置スクリプトで更新しても設定が保持されること

拡張をインストール／更新する前から開いていたChatGPTタブは、
完了検出テスト前に一度再読み込みしてください。

Privacy Policyにはリポジトリの `PRIVACY.ja.md` または `PRIVACY.md` を使用し、
掲載文は `docs/store-listing/` 配下を使用します。
