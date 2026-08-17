# Clean.ps1 — очистка артефактов сборки (dist/)
# Запуск: pwsh ./scripts/Clean.ps1
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$out  = Join-Path $root "dist"

if (Test-Path $out) {
    Remove-Item $out -Recurse -Force
    Write-Host "OK: dist/ удалён"
} else {
    Write-Host "OK: dist/ отсутствует, чистить нечего"
}