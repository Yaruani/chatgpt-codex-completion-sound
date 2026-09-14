$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $PSScriptRoot
$Source = Join-Path $Root "browser-extension"
$Dist = Join-Path $Root "dist"
$Out = Join-Path $Dist "chatgpt-completion-sound-1.2.0.zip"

New-Item -ItemType Directory -Force -Path $Dist | Out-Null
if (Test-Path $Out) { Remove-Item $Out -Force }

Compress-Archive -Path (Join-Path $Source "*") -DestinationPath $Out -CompressionLevel Optimal
Write-Host "Created $Out"
