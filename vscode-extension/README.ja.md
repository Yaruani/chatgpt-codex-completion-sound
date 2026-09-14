# Codex Completion Sound

VS Code内のCodexで、**UI上のターンが実際に完了したとき**にローカル通知音を再生します。

## 機能

- Chime / Bell / Double / Soft / 電子レンジ風チン / ブライトベル / ゲームクリア風 の7種類
- 0～100%、5%刻みの音量設定
- テスト再生
- ON/OFF
- Windowsでのローカル再生

## 完了判定

v1.2.4では、rollout JSONLの `task_complete` をUI完了とはみなしません。

代わりにCodexのローカルDB `~/.codex/logs_2.sqlite` を**読み取り専用**で監視し、
App Serverの正式なライフサイクルイベント

`app-server event: turn/completed`

だけを完了通知として扱います。

起動時点の最大ログIDを開始位置にするため、過去イベントは再生しません。
また、ローカルの単一インスタンスロックにより、複数のVS Codeウィンドウから
同じ完了音が重複再生されることを防止します。

Codexの内容を外部送信・保存しません。

## 設定画面

**拡張機能 → Codex Completion Sound → 歯車 → 拡張機能の設定** から、
VS Code標準の設定画面を開けます。
`Codex Completion Sound: 設定を開く` コマンドからも開けます。

設定画面では以下を変更できます。

- 通知音のON/OFF
- 通知音の種類
- 音量（0～100%）
- 音の種類・音量を変更したときの自動プレビュー

## コマンド

コマンドパレット（`Ctrl+Shift+P`）から以下を利用できます。

- `Codex Completion Sound: Test Sound`
- `Codex Completion Sound: Select Sound`
- `Codex Completion Sound: Set Volume`
- `Codex Completion Sound: Toggle`
- `Codex Completion Sound: Diagnostics`

## 互換性

この版はVS CodeのExtension Hostが `node:sqlite` を提供している必要があります
（Node.js 22.5以降）。通知音再生は現在Windows対応です。

OpenAI非公式であり、OpenAIによる承認・提携を意味しません。

Version: 1.2.5
