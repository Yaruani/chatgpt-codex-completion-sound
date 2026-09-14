$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $Root "browser-extension"
$Dist = Join-Path $Root "dist"
$ManifestPath = Join-Path $Source "manifest.json"

$Manifest = Get-Content $ManifestPath -Raw | ConvertFrom-Json
$Version = [string]$Manifest.version

if ([string]::IsNullOrWhiteSpace($Version)) {
    throw "Version not found in browser-extension\manifest.json"
}

$Out = Join-Path $Dist "chatgpt-completion-sound-$Version.zip"

New-Item -ItemType Directory -Force -Path $Dist | Out-Null

if (Test-Path $Out) {
    Remove-Item $Out -Force
}

Compress-Archive `
    -Path (Join-Path $Source "*") `
    -DestinationPath $Out `
    -CompressionLevel Optimal

Write-Host "Created $Out"
