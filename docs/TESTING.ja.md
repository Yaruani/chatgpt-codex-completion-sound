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

1. 生成したVSIXをインストールし、開いているVS CodeウィンドウをすべてReload
2. 監視ロックを取得するウィンドウが1つだけで、他ウィンドウはpassiveになることを確認
3. Reload後10秒以上何もせず待ち、過去rolloutの完了音が勝手に鳴らないことを確認
4. `Codex Completion Sound: Test Sound`
5. 7種類すべての通知音を確認
6. 音量0%、5%、65%、100%を確認
7. 複数VS Codeウィンドウを開いた状態で音／音量を変更し、
   自動プレビューが1回だけ鳴ることを確認
8. subagent通知OFFで通常Codexタスクを実行し、main完了音が1回だけ鳴ることを確認
9. Outputで `role=main`、thread/turn ID、rollout完了の低い `lagMs` を確認
10. subagent通知ON＋別のsubagent音にして、3つのsubagentを起動し、
    全部待ってからmainが完了するタスクを実行。subagent音3回 + main音1回を確認
11. subagent通知をOFFへ戻す
12. 2つのVS Codeウィンドウで別々のCodexタスクをほぼ同時に実行し、
    それぞれのmain完了で1回ずつ鳴ることを確認
13. 複数完了が近い場合も通知音が重ならず順番に再生されることを確認
14. `Codex Completion Sound: Diagnostics` でbackendが `rollout-jsonl`、
    `sessionsRoot` が `~/.codex/sessions`（または `CODEX_HOME` 配下）であることを確認
