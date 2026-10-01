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
2. `~/.codex/logs_2.sqlite` を読み取り専用で開く
3. 起動時点の最大ログIDを開始位置にし、過去の完了イベントを再生しない
4. `logs` テーブルへ新しく追加された行をローカルで監視
5. `codex_app_server::outgoing_message` のレコードだけを判定対象にする
6. `app-server event: turn/started` でUIターン開始、
   `app-server event: turn/completed` で完了通知
7. 小さなローカルロックにより複数VS Codeウィンドウからの重複監視・重複再生を防止
8. PCM16 WAVを指定音量にローカル変換してVS Code global storageへキャッシュ
9. Windows `winmm.dll / PlaySound` で再生

VS Code版はCodexのローカルApp Serverログ形式に依存します。
DBスキーマ、target名、ライフサイクルイベント名が変わった場合は更新が必要です。
