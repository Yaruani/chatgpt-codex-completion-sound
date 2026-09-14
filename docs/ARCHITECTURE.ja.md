# アーキテクチャ

## ブラウザ版

1. `content.js` がChatGPT UI状態を監視
2. 表示中の停止コントロールを「処理中」と判定
3. 停止コントロールが一定時間消えたら完了イベントを送信
4. `background.js` が必要時にoffscreen audio documentを作成
5. `offscreen.js` が同梱WAVを再生

拡張自身のネットワーク通信は不要です。

## VS Code版

1. ローカルUI Extension Hostで動作
2. 既存Codex rollout JSONLは起動時にEOF位置へ初期化
3. `~/.codex/sessions` への新規追記を解析
4. `session_meta` からVS Code由来セッションか判定
5. `event_msg.task_complete` で通知
6. PCM16 WAVを指定音量にローカル変換してVS Code global storageへキャッシュ
7. Windows `winmm.dll / PlaySound` で再生

## 依存する仕様

ブラウザ版はChatGPT UIの観測可能な状態に依存します。
大きなUI変更時には検出条件の更新が必要です。

VS Code版はCodexのローカルセッション／イベント形式に依存します。
メタデータ名やイベント名が変更された場合は更新が必要です。
