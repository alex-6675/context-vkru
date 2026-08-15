#Requires -Version 7.0

<#
.SYNOPSIS
    Запуск тестов расширения «Context VK.RU».
.DESCRIPTION
    Выполняет модульные тесты (если настроены) и проверяет
    целостность структуры EdgeExtension/src/ под наш набор файлов.
#>

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$ExtDir = Join-Path $PSScriptRoot '..\EdgeExtension'
$SrcDir = Join-Path $ExtDir 'src'

Write-Host "=== Тестирование расширения ===" -ForegroundColor Cyan

# 1. Проверка наличия ключевых файлов
$RequiredFiles = @(
    'manifest.json',
    'background.js',
    'content.js',
    'popup.html',
    'popup.js',
    'dialog.html',
    'styles.css',
    'adapters\vkru.js',
    'core\storage.js',
    'core\messaging.js',
    'ui\dialog.js',
    'ui\layer.js'
)

$AllOk = $true
foreach ($File in $RequiredFiles) {
    $Path = Join-Path $SrcDir $File
    if (Test-Path $Path) {
        Write-Host "[OK] $File" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] $File — отсутствует!" -ForegroundColor Red
        $AllOk = $false
    }
}

# 2. Проверка локализации (ru, en)
$Locales = @('ru', 'en')
foreach ($Locale in $Locales) {
    $MessagesPath = Join-Path $SrcDir "_locales\$Locale\messages.json"
    if (Test-Path $MessagesPath) {
        Write-Host "[OK] _locales/$Locale/messages.json" -ForegroundColor Green
    } else {
        Write-Host "[FAIL] _locales/$Locale/messages.json — отсутствует!" -ForegroundColor Red
        $AllOk = $false
    }
}

# 3. Проверка иконок (необязательно, но желательно)
$IconDir = Join-Path $SrcDir 'icons'
if (Test-Path $IconDir) {
    $Icons = Get-ChildItem $IconDir -Filter '*.png'
    if ($Icons.Count -gt 0) {
        Write-Host "[OK] Иконок найдено: $($Icons.Count)" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Папка icons/ пуста" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARN] Папка icons/ отсутствует" -ForegroundColor Yellow
}

# 4. Итог
if ($AllOk) {
    Write-Host "=== Все проверки пройдены ===" -ForegroundColor Cyan
    exit 0
} else {
    Write-Host "=== Обнаружены проблемы ===" -ForegroundColor Red
    exit 1
}