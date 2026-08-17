# Build.ps1 — упаковка EdgeExtension/ в zip-артефакт сборки
# Запуск: pwsh ./scripts/Build.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root "EdgeExtension"
$out  = Join-Path $root "dist"
$zip  = Join-Path $out "context-vkru_v_01.zip"

if (-not (Test-Path (Join-Path $src "manifest.json"))) {
    Write-Error "manifest.json не найден в $src"
    exit 1
}

New-Item -ItemType Directory -Force -Path $out | Out-Null
if (Test-Path $zip) { Remove-Item $zip -Force }

Compress-Archive -Path (Join-Path $src "*") -DestinationPath $zip -Force
Write-Host "OK: $zip"