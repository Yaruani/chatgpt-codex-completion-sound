# アーキテクチャ

## ブラウザ版

1. `content.js` がChatGPT UI状態をローカル監視
2. 現在表示中の会話で生成停止コントロールが見えると、その会話のTrackerを開始／更新
3. 会話パスごとに独立したTrackerを持ち、複数の生成中回答を同時監視
4. 生成中に別会話へ移動してもTrackerを破棄せず、サイドバー上の該当会話の処理中状態を追跡
5. 一度確認したサイドバーの処理中表示が消えた後、900ms継続して不在なら完了と判定
   （青い完了点は補助シグナルのみ）
6. `background.js` が同一会話の短時間重複通知を抑制し、通知音をキューで順番に処理
7. `offscreen.js` が同梱WAVを再生し、実際の再生終了後に次の通知音へ進む

拡張自身のネットワーク通信は不要です。

ブラウザ版はChatGPTの公開拡張APIではなく、観測可能なUI状態に依存します。
大きなUI変更時には検出条件の更新が必要です。

## VS Code版

1. ローカルUI Extension Hostで動作
2. 1つのVS Codeウィンドウだけが小さな一時ロックを取得し、完了監視担当になる
3. 監視担当が `~/.codex/sessions`（または設定済み `CODEX_HOME` 配下）の
   Codex rollout JSONLを監視
4. 起動時に既存rolloutを現在末尾でseedし、通常起動時に過去完了を再生しない
5. `fs.watch` で低遅延検出し、周期的な再走査をfallbackとして併用
6. `task_started` / `turn_started` を開始、
   `task_complete` / `turn_complete` を完了として正規化
7. rolloutの `session_meta` からthreadとmain/subagentを判定し、
   `subagent_history_start_ordinal` より前のsubagent継承履歴を無視
8. 監視開始前の古いイベントを抑止し、rollout縮小・再書込・再走査でも
   thread/turn/event単位で再通知を防止
9. main完了と、設定で有効にしたsubagent完了をそれぞれ選択済み通知音へ振り分け
   （設定はVS Codeウィンドウ間で共通）
10. 近い時刻に複数完了した場合は再生キューで順番に処理し、音の重なりによる取りこぼしを防止
11. PCM16 WAVを指定音量にローカル変換してVS Code global storageへキャッシュ
12. Windows `winmm.dll / PlaySound` で再生

VS Code版はCodexのローカルrollout JSONL形式とライフサイクルメタデータに依存します。
Codex側の形式が変わった場合は検出処理の更新が必要になる可能性があります。
