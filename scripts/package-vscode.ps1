$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
Push-Location (Join-Path $Root "vscode-extension")

try {
  npm test
  npm run check
  npx --yes @vscode/vsce@latest package
}
finally {
  Pop-Location
}
