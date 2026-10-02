# Codex Completion Sound

VS Code内のCodexで、**UI上のターンが実際に完了したとき**にローカル通知音を再生します。

## 機能

- Chime / Bell / Double / Soft / 電子レンジ風チン / ブライトベル / ゲームクリア風 の7種類
- 0～100%、5%刻みの音量設定
- VS Code標準の拡張機能設定画面
- サブエージェント完了通知のON/OFFと専用通知音
- 複数VS Codeウィンドウで共通の設定
- 複数完了が近い場合も通知音を順番に再生
- テスト再生
- ON/OFF
- Windowsでのローカル再生

## 完了判定

v1.2.6では、Codexのローカルrollout JSONLを監視します。

`~/.codex/sessions`

追加されたrolloutデータをリアルタイム監視し、旧形式・現行形式の両方の
ライフサイクル名を認識します。

- `task_started` / `turn_started`
- `task_complete` / `turn_complete`

main / subagent は rollout の `session_meta` から判定します。
subagentでは `subagent_history_start_ordinal` より前の継承済み親履歴を無視するため、
コピーされた過去の完了イベントでは通知しません。

また、拡張起動前の古いイベントを無視し、rolloutファイルが再走査・再書き込みされた
場合も同じthread/turnイベントの再通知を抑止します。

ローカルの単一インスタンスロックにより、監視担当はVS Code全体で1ウィンドウだけです。
その監視担当が共有Codexセッションディレクトリを見るため、複数VS Codeウィンドウで
別々のCodexを同時実行しても、それぞれの完了を通知できます。

Codex内容を外部送信したり、本拡張が独自に永続保存したりしません。

## 設定画面

**拡張機能 → Codex Completion Sound → 歯車 → 拡張機能の設定** から、
VS Code標準の設定画面を開けます。
`Codex Completion Sound: 設定を開く` コマンドからも開けます。

設定画面では以下を変更できます。

- 通知音のON/OFF
- main完了時の通知音
- 音量（0～100%）
- subagent完了通知のON/OFF
- subagent専用通知音
- 音／音量変更時の自動プレビュー

設定はVS Codeウィンドウ間で共通です。

## コマンド

コマンドパレット（`Ctrl+Shift+P`）から以下を利用できます。

- `Codex Completion Sound: Test Sound`
- `Codex Completion Sound: Select Sound`
- `Codex Completion Sound: Set Volume`
- `Codex Completion Sound: Toggle`
- `Codex Completion Sound: Diagnostics`

## 互換性

通知音再生は現在Windows対応です。

完了判定はCodexのローカルrollout JSONL形式に依存します。
Codex側で形式やライフサイクルメタデータが変更された場合は、
検出処理の更新が必要になる可能性があります。

OpenAI非公式であり、OpenAIによる承認・提携を意味しません。

Version: 1.2.6
