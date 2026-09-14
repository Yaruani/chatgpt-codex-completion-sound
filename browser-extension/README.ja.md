# ChatGPT Completion Sound

[English](README.md)

ChatGPTが生成を終えて入力待ちへ戻ったときに、ローカル通知音を鳴らす
Chrome / Brave用 Manifest V3 拡張です。

## 機能

- 4種類の同梱通知音
- 音量調整
- ON/OFF
- テスト再生
- 英語／日本語UI
- 解析、テレメトリ、広告、アカウント、拡張自身の外部通信なし

## 権限

- `storage`: 拡張設定だけをローカル保存
- `offscreen`: 同梱WAVを再生
- `https://chatgpt.com/*`: 完了判定のためChatGPT UI状態をローカル監視

詳細はリポジトリのプライバシーポリシーを参照してください。

## 開発用インストール

1. `chrome://extensions/` または `brave://extensions/` を開く
2. デベロッパーモードをON
3. 「パッケージ化されていない拡張機能を読み込む」
4. この `browser-extension` フォルダを指定
5. 既に開いているChatGPTタブを再読み込み

## バージョン

1.2.0
