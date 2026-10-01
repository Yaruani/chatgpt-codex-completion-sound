param(
    [string]$Source = ""
)

$ErrorActionPreference = "Stop"

function Get-DownloadsPath {
    try {
        $shell = New-Object -ComObject Shell.Application
        $folder = $shell.NameSpace("shell:Downloads")

        if ($folder -and $folder.Self -and $folder.Self.Path) {
            $path = [Environment]::ExpandEnvironmentVariables(
                [string]$folder.Self.Path
            )

            if (Test-Path -LiteralPath $path -PathType Container) {
                return $path
            }
        }
    }
    catch {
        # Fall through to registry lookup.
    }

    try {
        $key = "HKCU:\Software\Microsoft\Windows\CurrentVersion\Explorer\User Shell Folders"
        $guid = "{374DE290-123F-4565-9164-39C4925E467B}"
        $value = (Get-ItemProperty -LiteralPath $key -Name $guid -ErrorAction Stop).$guid

        if ($value) {
            $path = [Environment]::ExpandEnvironmentVariables([string]$value)

            if (Test-Path -LiteralPath $path -PathType Container) {
                return $path
            }
        }
    }
    catch {
        # Fall through to conventional path.
    }

    $fallback = Join-Path $HOME "Downloads"
    if (Test-Path -LiteralPath $fallback -PathType Container) {
        return $fallback
    }

    return $null
}

$DownloadsPath = Get-DownloadsPath
$ExtensionRoot = Join-Path $HOME "Extensions"
$Destination = Join-Path $ExtensionRoot "chatgpt-completion-sound"
$Backup = Join-Path $ExtensionRoot "chatgpt-completion-sound.previous"
$Staging = Join-Path $ExtensionRoot ".chatgpt-completion-sound.new"

function Resolve-ExtensionSource {
    param([string]$InputPath)

    if ([string]::IsNullOrWhiteSpace($InputPath)) {
        $searchRoots = @(
            $PSScriptRoot,
            $DownloadsPath
        ) | Where-Object {
            $_ -and (Test-Path -LiteralPath $_ -PathType Container)
        } | Select-Object -Unique

        $candidate = $searchRoots |
            ForEach-Object {
                Get-ChildItem `
                    -LiteralPath $_ `
                    -File `
                    -Filter "chatgpt-completion-sound-browser-*-unpacked.zip" `
                    -ErrorAction SilentlyContinue
            } |
            Sort-Object LastWriteTime -Descending |
            Select-Object -First 1

        if (-not $candidate) {
            $downloadHint = if ($DownloadsPath) {
                $DownloadsPath
            } else {
                "<Downloads folder could not be resolved>"
            }

            throw @"
Source was not specified and no matching ZIP was found.

Resolved Downloads folder:
  $downloadHint

Specify the ZIP explicitly with -Source if needed.
"@
        }

        $InputPath = $candidate.FullName
        Write-Host "Auto-selected source: $InputPath"
    }

    $resolved = (Resolve-Path -LiteralPath $InputPath).Path

    if (Test-Path -LiteralPath $resolved -PathType Leaf) {
        if ([IO.Path]::GetExtension($resolved) -ne ".zip") {
            throw "Source file must be a ZIP archive: $resolved"
        }

        $temp = Join-Path `
            ([IO.Path]::GetTempPath()) `
            ("ccs-install-" + [guid]::NewGuid().ToString("N"))

        New-Item -ItemType Directory -Path $temp -Force | Out-Null

        try {
            Expand-Archive -LiteralPath $resolved -DestinationPath $temp -Force

            $manifestFiles = @(
                Get-ChildItem -Path $temp -Filter "manifest.json" -File -Recurse
            )

            if ($manifestFiles.Count -ne 1) {
                throw "Expected exactly one manifest.json in ZIP, found $($manifestFiles.Count)."
            }

            return [pscustomobject]@{
                Root = $manifestFiles[0].Directory.FullName
                Temp = $temp
            }
        }
        catch {
            Remove-Item -LiteralPath $temp -Recurse -Force -ErrorAction SilentlyContinue
            throw
        }
    }

    if (Test-Path -LiteralPath $resolved -PathType Container) {
        $directManifest = Join-Path $resolved "manifest.json"

        if (Test-Path -LiteralPath $directManifest -PathType Leaf) {
            return [pscustomobject]@{
                Root = $resolved
                Temp = $null
            }
        }

        $manifestFiles = @(
            Get-ChildItem -Path $resolved -Filter "manifest.json" -File -Recurse
        )

        if ($manifestFiles.Count -ne 1) {
            throw "Expected exactly one manifest.json under source directory, found $($manifestFiles.Count)."
        }

        return [pscustomobject]@{
            Root = $manifestFiles[0].Directory.FullName
            Temp = $null
        }
    }

    throw "Source not found: $resolved"
}

$sourceInfo = $null

try {
    if ($DownloadsPath) {
        Write-Host "Resolved Downloads: $DownloadsPath"
    } else {
        Write-Host "Resolved Downloads: <not found>"
    }

    $sourceInfo = Resolve-ExtensionSource -InputPath $Source
    $SourceRoot = $sourceInfo.Root

    $ManifestPath = Join-Path $SourceRoot "manifest.json"
    $Manifest = Get-Content -LiteralPath $ManifestPath -Raw | ConvertFrom-Json

    if ($Manifest.manifest_version -ne 3) {
        throw "Manifest V3 expected, got: $($Manifest.manifest_version)"
    }

    if ([string]::IsNullOrWhiteSpace([string]$Manifest.version)) {
        throw "Extension version is missing from manifest.json"
    }

    $HostPermissions = @($Manifest.host_permissions)
    if ($HostPermissions -notcontains "https://chatgpt.com/*") {
        throw "Unexpected package: https://chatgpt.com/* host permission was not found."
    }

    New-Item -ItemType Directory -Path $ExtensionRoot -Force | Out-Null

    if (Test-Path -LiteralPath $Staging) {
        Remove-Item -LiteralPath $Staging -Recurse -Force
    }

    Copy-Item -LiteralPath $SourceRoot -Destination $Staging -Recurse -Force

    $StagedManifest = Join-Path $Staging "manifest.json"
    if (-not (Test-Path -LiteralPath $StagedManifest -PathType Leaf)) {
        throw "Staging validation failed: manifest.json is missing."
    }

    if (Test-Path -LiteralPath $Destination) {
        if (Test-Path -LiteralPath $Backup) {
            Remove-Item -LiteralPath $Backup -Recurse -Force
        }

        Copy-Item -LiteralPath $Destination -Destination $Backup -Recurse -Force
        Write-Host "Backup created: $Backup"
        Remove-Item -LiteralPath $Destination -Recurse -Force
    }

    Move-Item -LiteralPath $Staging -Destination $Destination

    Write-Host ""
    Write-Host "Installed ChatGPT Completion Sound"
    Write-Host "Version : $($Manifest.version)"
    Write-Host "Path    : $Destination"
    Write-Host ""
    Write-Host "IMPORTANT:"
    Write-Host "  Do NOT remove the extension from Brave/Chrome when updating."
    Write-Host "  Keep using this same folder so browser-local settings are preserved."
    Write-Host ""
    Write-Host "Next:"
    Write-Host "  1. Open brave://extensions/ (or chrome://extensions/)"
    Write-Host "  2. First install only: Load unpacked -> $Destination"
    Write-Host "     Update: click Reload on the existing extension"
    Write-Host "  3. Reload already-open ChatGPT tabs"
}
finally {
    if (
        $sourceInfo -and
        $sourceInfo.Temp -and
        (Test-Path -LiteralPath $sourceInfo.Temp)
    ) {
        Remove-Item -LiteralPath $sourceInfo.Temp -Recurse -Force -ErrorAction SilentlyContinue
    }

    if (Test-Path -LiteralPath $Staging) {
        Remove-Item -LiteralPath $Staging -Recurse -Force -ErrorAction SilentlyContinue
    }
}
