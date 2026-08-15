#Requires -Version 7.0

<#
.SYNOPSIS
    Очистка артефактов сборки расширения «Context VK.RU».
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ExtDir  = Join-Path $PSScriptRoot '..\EdgeExtension'
$DistDir = Join-Path $ExtDir 'dist'

Write-Host "=== Очистка артефактов сборки ===" -ForegroundColor Cyan

if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
    Write-Host "[OK] dist/ удалена" -ForegroundColor Green
} else {
    Write-Host "[INFO] dist/ не найдена — ничего удалять" -ForegroundColor Yellow
}

Write-Host "=== Очистка завершена ===" -ForegroundColor Cyan