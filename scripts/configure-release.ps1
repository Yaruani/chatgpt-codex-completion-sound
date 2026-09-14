param(
  [Parameter(Mandatory = $true)]
  [ValidatePattern('^[a-zA-Z0-9][a-zA-Z0-9-]*$')]
  [string]$PublisherId,

  [Parameter(Mandatory = $true)]
  [string]$GitHubOwner,

  [string]$RepositoryName = "chatgpt-codex-completion-sound"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$PackagePath = Join-Path $Root "vscode-extension\package.json"

$pkg = Get-Content -Raw -Encoding UTF8 $PackagePath | ConvertFrom-Json
$repoUrl = "https://github.com/$GitHubOwner/$RepositoryName"

$pkg.publisher = $PublisherId
$pkg.repository.url = "$repoUrl.git"
$pkg.homepage = "$repoUrl#readme"
$pkg.bugs.url = "$repoUrl/issues"

$pkg |
  ConvertTo-Json -Depth 20 |
  Set-Content -Encoding UTF8 $PackagePath

Write-Host "Configured:"
Write-Host "  Publisher: $PublisherId"
Write-Host "  Repository: $repoUrl"
Write-Host ""
Write-Host "Review vscode-extension/package.json before publishing."
