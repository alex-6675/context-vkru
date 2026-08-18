# ============================================================================
# run-edge-vk-test.ps1
# Запуск Microsoft Edge с чистым профилем для тестирования
# Окружение: PowerShell 7.6.4, Windows 10
# ============================================================================

# Проверка версии PowerShell
$requiredPSVersion = [version]'7.6.5'
if ($PSVersionTable.PSVersion -lt $requiredPSVersion) {
    Write-Error "Требуется PowerShell версии $requiredPSVersion или выше"
    exit 1
}

# Строгая проверка и обработка ошибок
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Параметры запуска
$EdgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
$ProfileDir = 'C:\Users\An\serv6675\Edge_test_context\'

# Проверка существования пути к Edge
if (-not (Test-Path $EdgePath)) {
    Write-Error "Не найден файл Edge: $EdgePath"
    exit 1
}

# Создание директории профиля, если её нет
if (-not (Test-Path $ProfileDir)) {
    Write-Host "Создаю директорию профиля: $ProfileDir" -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $ProfileDir -Force
}

# Сборка аргументов запуска
$args = @(
    "--user-data-dir=$ProfileDir",
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-component-update',
    '--start-maximized'
)

# Вывод информации о запуске
Write-Host "Путь к Edge:     $EdgePath" -ForegroundColor Cyan
Write-Host "Директория профиля: $ProfileDir" -ForegroundColor Cyan

# Запуск Edge
Start-Process -FilePath $EdgePath -ArgumentList $args

Write-Host ''
Write-Host 'Edge запущен с чистым профилем.' -ForegroundColor Green
Write-Host 'Расширение нужно будет загрузить вручную через edge://extensions' -ForegroundColor Yellow