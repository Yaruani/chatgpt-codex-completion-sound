# VS Code Marketplace 掲載文 — 日本語

## 表示名

Codex Completion Sound

## 短い説明

VS Code内のCodexターン完了時に選択可能なローカル通知音を再生します。非公式拡張です。

## Marketplace説明

Codexの処理中に画面を見続ける必要をなくすための完了通知拡張です。

Codex Completion Sound は、ローカルの `~/.codex/logs_2.sqlite` を
読み取り専用で監視し、App Serverの `turn/completed` ライフサイクルイベントで
通知音を再生します。

機能:

- Chime / Bell / Double / Soft / 電子レンジ風チン / ブライトベル /
  ゲームクリア風 の7種類
- 0～100%、5%刻みの音量設定
- VS Code標準の拡張機能設定画面からON/OFF・音・音量を設定
- 音／音量変更時の自動プレビュー
- Command Paletteからテスト再生や設定コマンドを実行可能
- 英語／日本語UI
- 解析、テレメトリ、広告、アカウント、独自ネットワーク通信なし
- Codex App Serverログをローカル・読み取り専用で監視
- 複数VS Codeウィンドウによる重複通知をローカルロックで防止

本リリースの通知音再生はWindows対応です。

OpenAI非公式の独立拡張であり、OpenAIによる承認・提携を意味しません。
