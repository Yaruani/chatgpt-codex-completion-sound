# テスト手順

## ブラウザ版

1. `scripts/install-chatgpt-completion-sound.ps1` を使い、実際に配布するZIPで
   インストール／更新
2. 既存のunpacked拡張を再読み込みし、すでに開いている `chatgpt.com` タブも再読み込み
3. 更新後もON/OFF・通知音・音量設定が保持されていることを確認
4. 7種類すべての通知音をテスト
5. 音量0%、5%、65%、100%をテスト
6. 通常のChatGPT回答完了時に1回だけ鳴ることを確認
7. 会話Aで生成開始後に会話Bへ移動し、A完了時にも通知されることを確認
8. 会話A/Bを同時生成 → 第3の会話へ移動 → ブラウザをバックグラウンドにし、
   A/Bそれぞれの完了で合計2回だけ鳴ることを確認
9. ほぼ同時に完了しても通知音がキュー再生され、前の音が途中で切れないことを確認
10. 通知OFFで鳴らないことを確認
11. ChatGPTページを閉じる／ブラウザに破棄された状態を
    バックグラウンド追跡対応として記載していないことを確認

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
4. 7種類すべて確認
5. 音量0%、5%、65%、100%を確認
6. VS Code標準の拡張機能設定画面で音／音量を変更し、自動プレビューを確認
7. Codex UIタスクを実行し、`turn/completed` で1回だけ鳴ることを確認
8. `Codex Completion Sound: Diagnostics` でbackendが `node:sqlite`、
   DBが `~/.codex/logs_2.sqlite`（または `CODEX_HOME` 配下）であることを確認
