#Requires -Version 7.0

<#
.SYNOPSIS
    Сборка расширения «Context VK.RU» для Edge.
.DESCRIPTION
    Копирует исходные файлы из EdgeExtension/src/ в EdgeExtension/dist/,
    выполняет базовую минификацию (если требуется) и подготавливает
    папку для загрузки в режиме разработчика.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ExtDir  = Join-Path $PSScriptRoot '..\EdgeExtension'
$SrcDir  = Join-Path $ExtDir 'src'
$DistDir = Join-Path $ExtDir 'dist'

Write-Host "=== Сборка расширения «Context VK.RU» ===" -ForegroundColor Cyan

# 1. Очистка dist
if (Test-Path $DistDir) {
    Remove-Item -Recurse -Force $DistDir
    Write-Host "[OK] dist/ очищена" -ForegroundColor Green
}

# 1.1 Создание dist (если не существует)
New-Item -ItemType Directory -Path $DistDir -Force | Out-Null

# 2. Копирование содержимого src → dist (без вложенной папки src)
Copy-Item "$SrcDir\*" $DistDir -Recurse
Write-Host "[OK] содержимое src/ скопировано в dist/" -ForegroundColor Green

# 3. Удаление ненужных файлов (если есть)
$Exclude = @('*.map', '*.log')
Get-ChildItem $DistDir -Recurse -Include $Exclude | Remove-Item -Force -ErrorAction SilentlyContinue

Write-Host "=== Сборка завершена ===" -ForegroundColor Cyan
Write-Host "Результат: $DistDir" -ForegroundColor Yellow