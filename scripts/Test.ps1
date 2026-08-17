# Test.ps1 — статическая проверка состава сборки v_01
# (фактический PASS/FAIL — только вручную в Edge, см. reports/v_01/TEST.md, §5.6)
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot
$required = @(
    "EdgeExtension\manifest.json",
    "EdgeExtension\src\background.js",
    "EdgeExtension\src\content.js",
    "reports\v_01\BUILD.md",
    "reports\v_01\TEST.md",
    "reports\v_01\RESULT.md"
)

$failed = 0
foreach ($f in $required) {
    $p = Join-Path $root $f
    if (Test-Path $p) {
        Write-Host "  [PASS] $f"
    } else {
        Write-Host "  [FAIL] $f — отсутствует"
        $failed++
    }
}

if ($failed -gt 0) { Write-Error "Отсутствует файлов: $failed"; exit 1 }
Write-Host "OK: состав v_01 полный. Далее — ручная проверка в Edge."