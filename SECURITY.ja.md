# セキュリティポリシー

## サポート対象

最新リリースのみを積極的なサポート対象とします。

## 脆弱性の報告

公開Issueには、ChatGPTの非公開会話、Codexセッション内容、ソースコード、
認証情報、トークン、その他の秘密情報を貼らないでください。

セキュリティ脆弱性は、GitHubリポジトリの **Private vulnerability reporting**
を利用して非公開で報告してください。

1. リポジトリの **Security** タブを開く
2. **Report a vulnerability** を選択
3. リポジトリ管理者へ非公開で報告を送信する

機密性のない不具合は公開Issueを利用してください。

## セキュリティ設計

- リモートコード実行・外部スクリプト読み込みなし
- 解析・テレメトリなし
- ブラウザのホスト権限は `chatgpt.com` のみに限定
- VS Code版はローカルのCodex `~/.codex/logs_2.sqlite` を読み取り専用で開く
- VS Code版は `turn/started` / `turn/completed` の判定に必要な
  Codex App Serverのローカルライフサイクルログのみを利用
- 通知音は拡張に同梱
- 拡張自身からのネットワーク通信なし
