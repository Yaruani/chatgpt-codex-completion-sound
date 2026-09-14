# Chrome Web Store 公開手順

アップロードZIPは次で作成します。

```powershell
./scripts/build-browser.ps1
```

申請前に、アップロードするものと同一のZIPをChrome/Braveで確認します。

- 7種類の音
- 自動プレビュー
- 音量とON/OFF
- テスト再生
- 通常の完了検出
- 別チャットへ移動して戻った後の完了検出

拡張をインストール／更新する前から開いていたChatGPTタブは、
完了検出テスト前に一度再読み込みしてください。

Privacy Policyにはリポジトリの `PRIVACY.ja.md` または `PRIVACY.md` を使用し、
掲載文は `docs/store-listing/` 配下を使用します。
