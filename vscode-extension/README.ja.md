# Codex Completion Sound

[English](README.md)

VS Code内のCodexで開始したタスクが完了したときに、
ローカル通知音を鳴らすWindows向け非公式拡張です。

## 機能

- Chime / Bell / Double / Soft の4種類
- 0～100%、5%刻みの音量設定
- テスト再生
- ON/OFF
- 英語／日本語のコマンド・実行時メッセージ
- 解析、テレメトリ、広告、アカウント、拡張自身のネットワーク通信なし

## コマンド

`Ctrl+Shift+P` から以下を実行できます。

- `Codex Completion Sound: テスト再生`
- `Codex Completion Sound: 通知音を選択`
- `Codex Completion Sound: 音量を設定`
- `Codex Completion Sound: ON/OFF切替`
- `Codex Completion Sound: 診断情報`

## 完了検出

ローカルのVS Code UI Extension Hostで動作し、
`~/.codex/sessions` 配下のCodex JSONLセッションを読み取り専用で監視します。

VS Code由来のセッションを識別し、ローカルの `task_complete` イベントを検出します。
拡張起動時に既存ファイルの末尾を開始位置にするため、過去の完了イベントは再生しません。

## プライバシー

Codex内容を外部送信しません。詳細はリポジトリの `PRIVACY.ja.md` を参照してください。

## 対応OS

本リリースの通知音再生は **Windows** 対応です。

## 免責

OpenAI非公式であり、OpenAIによる承認・提携を意味しません。

Version: 1.2.0
