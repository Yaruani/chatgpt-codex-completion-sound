# テスト手順

## ブラウザ版

1. `browser-extension/` を展開読み込み
2. `chatgpt.com` を再読み込み
3. Popupから4種類すべてテスト
4. 音量0%、5%、65%、100%をテスト
5. ChatGPTへ短い質問を送信
6. 生成完了後に1回だけ鳴ることを確認
7. 別タブへ移動した状態でも確認
8. 通知OFFで鳴らないことを確認

## VS Code 自動テスト

```powershell
cd vscode-extension
npm test
npm run check
```

## VS Code 手動テスト

1. 生成したVSIXをインストール
2. VS CodeをReload
3. `Codex Completion Sound: Test Sound`
4. 4種類すべて確認
5. 音量0%、5%、65%、100%を確認
6. Codexへ短いタスクを実行
7. 完了時に1回だけ鳴ることを確認
8. DiagnosticsでCodexセッションパスを確認
