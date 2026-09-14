# コントリビューション

Pull Requestを歓迎します。

## 原則

- 小さく、監査しやすい実装を維持する
- 解析、広告、追跡、リモートコードを追加しない
- 権限は最小限にする
- ChatGPT/Codex内容をログ保存・外部送信しない
- ユーザー向け変更では英語・日本語ドキュメントを両方更新する

## 開発

### VS Code

```powershell
cd vscode-extension
npm test
node --check src/extension.js
```

### ブラウザ

Chromium系ブラウザで `browser-extension/` を「パッケージ化されていない拡張」として読み込みます。

## Pull Request

以下を含めてください。

- 変更内容の簡潔な説明
- 手動テスト手順
- プライバシー／権限への影響
- 英語・日本語のユーザー向けドキュメント更新
