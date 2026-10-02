# VS Code Marketplace 公開手順

公式ドキュメント:
https://code.visualstudio.com/api/working-with-extensions/publishing-extension

## 現在の識別情報

- Publisher ID: `yaruani`
- Extension ID: `yaruani.codex-done-sound`
- Repository: `Yaruani/chatgpt-codex-completion-sound`
- 現在の拡張バージョン: `1.2.6`

Publisher IDは拡張の識別子に含まれるため、永続的なIDとして扱います。

## 検証

```powershell
cd vscode-extension
npm test
npm run check
npx --yes @vscode/vsce@latest package
```

VS Code Marketplaceの拡張アイコンはPNGが必要です。
このリポジトリには `images/icon.png` を収録しています。

## 現在の完了判定

v1.2.6では、`~/.codex/sessions`（または設定済み `CODEX_HOME` 配下）の
Codex rollout JSONLを監視します。

rolloutのセッションメタデータからmain / subagentを判定します。
subagent完了通知は既定OFFで、有効にした場合は専用通知音を選択できます。

1つのVS Codeウィンドウだけが共有監視を担当し、設定はVS Code全体で共通です。
近い時刻に複数完了した場合は通知音をキューで順番に再生します。

## アップデート公開

公開前に以下を確認します。

1. `vscode-extension/package.json` と `vscode-extension/CHANGELOG.md` を更新
2. 上記の検証／packageコマンドを実行
3. 生成したVSIXをWindowsへインストールして実機テスト
4. VS Code標準の拡張機能設定画面、7種類の音、自動プレビュー、
   main完了通知、任意のsubagent通知、複数ウィンドウ動作を確認
5. 動作変更があればPrivacy／Security文書を確認
6. 最終VSIXに意図したファイルだけが入り、旧監視実装が含まれていないことを確認

### Marketplace管理画面からの手動公開

現在採用している公開手順はMarketplace Publisher管理画面からの手動アップロードです。

1. Publisher管理画面を開く
2. Publisher `yaruani` を選択
3. 生成した `codex-done-sound-<version>.vsix` をアップロード
4. Marketplace側の検証完了を待つ
5. Extension管理画面で新バージョンがPublicになったことを確認

この方法では、ローカルの `vsce` 用Personal Access Tokenは不要です。

### CLI公開

Microsoftの現行手順に従って認証している場合はCLI公開も利用できます。

```powershell
npx --yes @vscode/vsce@latest publish --packagePath .\codex-done-sound-<version>.vsix
```

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
