# VS Code Marketplace 公開手順

公式ドキュメント:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## 現在の識別情報

- Publisher ID: `yaruani`
- Extension ID: `yaruani.codex-done-sound`
- Repository: `Yaruani/chatgpt-codex-completion-sound`

Publisher IDは拡張の識別子に含まれるため、永続的なIDとして扱います。

## 検証

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

現在の `vscode-extension/package.json` のversionは `1.2.5` です。

VS Code Marketplaceの拡張アイコンはPNGが必要です。
このリポジトリには `images/icon.png` を収録しています。

## アップデート公開

公開前に以下を確認します。

1. `vscode-extension/package.json` と `vscode-extension/CHANGELOG.md` を更新
2. 上記の検証／packageコマンドを実行
3. 生成したVSIXを新規Windows VS Codeプロファイルでテスト
4. VS Code標準の拡張機能設定画面、7種類の音、自動プレビュー、
   実際のCodex `turn/completed` 通知を確認
5. 動作変更があればPrivacy／Security文書を確認

認証方式はMicrosoftの最新公式手順に従ってください。

認証後の代表的なコマンド:

```powershell
npx --yes @vscode/vsce@latest publish
```

生成したVSIXをMarketplace管理画面から手動アップロードする方法も利用できます。

## リポジトリ内のMarketplace用情報

- 表示名／説明
- カテゴリ／キーワード
- Free価格
- PNGアイコン
- README
- CHANGELOG
- LICENSE
- Repository / Issues / Homepage
- 英語／日本語のコマンド・設定メタデータ
