$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot

Write-Host "Validating VS Code extension..."
Push-Location (Join-Path $Root "vscode-extension")
try {
  npm test
  npm run check
}
finally {
  Pop-Location
}

Write-Host "Validating browser manifest JSON..."
$Manifest = Join-Path $Root "browser-extension\manifest.json"
Get-Content -Raw -Encoding UTF8 $Manifest | ConvertFrom-Json | Out-Null

Write-Host "Checking placeholders..."
$Matches = Get-ChildItem $Root -Recurse -File |
  Where-Object { $_.FullName -notmatch '\\.git\\' } |
  Select-String -Pattern @(('YOUR_' + 'GITHUB_OWNER'), ('your-' + 'publisher-id')) -SimpleMatch

if ($Matches) {
  Write-Warning "Release placeholders remain. This is expected until configure-release.ps1 is run."
}

Write-Host "Validation complete."

