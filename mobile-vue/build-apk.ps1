# ============================================
# Script de compilation APK pour Ionic/Capacitor
# Sans Android Studio - Utilise uniquement le SDK Android
# ============================================

param(
    [switch]$Release,
    [switch]$SkipBuild
)

# Configuration - MODIFIEZ CES CHEMINS SELON VOTRE INSTALLATION
$ANDROID_SDK_PATH = "C:\Acer (C.)\Android\Sdk"  # Chemin basé sur votre capture d'écran

# Vérifier si le chemin existe, sinon essayer des alternatives
if (-not (Test-Path $ANDROID_SDK_PATH)) {
    $alternativePaths = @(
        "$env:LOCALAPPDATA\Android\Sdk",
        "$env:USERPROFILE\AppData\Local\Android\Sdk",
        "C:\Android\Sdk",
        "D:\Android\Sdk"
    )

    foreach ($path in $alternativePaths) {
        if (Test-Path $path) {
            $ANDROID_SDK_PATH = $path
            break
        }
    }
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Compilation APK - Ionic/Capacitor" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Vérification du SDK Android
if (-not (Test-Path $ANDROID_SDK_PATH)) {
    Write-Host "ERREUR: SDK Android non trouvé!" -ForegroundColor Red
    Write-Host "Veuillez modifier le chemin ANDROID_SDK_PATH dans ce script." -ForegroundColor Yellow
    Write-Host "Chemin actuel: $ANDROID_SDK_PATH" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] SDK Android trouvé: $ANDROID_SDK_PATH" -ForegroundColor Green

# Configuration des variables d'environnement
$env:ANDROID_SDK_ROOT = $ANDROID_SDK_PATH
$env:ANDROID_HOME = $ANDROID_SDK_PATH
$env:PATH = "$ANDROID_SDK_PATH\platform-tools;$ANDROID_SDK_PATH\build-tools\*;$ANDROID_SDK_PATH\cmdline-tools\latest\bin;$env:PATH"

# Se positionner dans le dossier du projet
$projectPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectPath

Write-Host ""
Write-Host "[1/4] Verification des dependances npm..." -ForegroundColor Yellow

# Vérifier si node_modules existe
if (-not (Test-Path "node_modules")) {
    Write-Host "Installation des dependances npm..." -ForegroundColor Cyan
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec de npm install" -ForegroundColor Red
        exit 1
    }
}
Write-Host "[OK] Dependances npm OK" -ForegroundColor Green

# Étape 2: Build du projet web
if (-not $SkipBuild) {
    Write-Host ""
    Write-Host "[2/4] Build du projet Vue/Ionic..." -ForegroundColor Yellow

    # Build du projet
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec du build Vue" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Build Vue termine" -ForegroundColor Green

    # Synchroniser avec Capacitor
    Write-Host ""
    Write-Host "[3/4] Synchronisation Capacitor..." -ForegroundColor Yellow
    npx cap sync android
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec de cap sync" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Synchronisation Capacitor terminee" -ForegroundColor Green
} else {
    Write-Host "[2/4] Build skippe (--SkipBuild)" -ForegroundColor Yellow
    Write-Host "[3/4] Sync skippe (--SkipBuild)" -ForegroundColor Yellow
}

# Étape 4: Build APK avec Gradle
Write-Host ""
Write-Host "[4/4] Compilation APK avec Gradle..." -ForegroundColor Yellow

Set-Location "android"

# Vérifier si gradlew existe
if (-not (Test-Path "gradlew.bat")) {
    Write-Host "ERREUR: gradlew.bat non trouve dans le dossier android" -ForegroundColor Red
    exit 1
}

if ($Release) {
    Write-Host "Mode: RELEASE" -ForegroundColor Magenta
    .\gradlew.bat assembleRelease --no-daemon
    $apkPath = "app\build\outputs\apk\release\app-release-unsigned.apk"
    $outputName = "mikoike-release.apk"
} else {
    Write-Host "Mode: DEBUG" -ForegroundColor Magenta
    .\gradlew.bat assembleDebug --no-daemon
    $apkPath = "app\build\outputs\apk\debug\app-debug.apk"
    $outputName = "mikoike-debug.apk"
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Echec de la compilation Gradle" -ForegroundColor Red
    Set-Location $projectPath
    exit 1
}

# Retour au dossier projet
Set-Location $projectPath

# Vérifier et copier l'APK
$fullApkPath = "android\$apkPath"
if (Test-Path $fullApkPath) {
    # Créer le dossier output s'il n'existe pas
    if (-not (Test-Path "output")) {
        New-Item -ItemType Directory -Path "output" | Out-Null
    }

    # Copier l'APK
    Copy-Item $fullApkPath -Destination "output\$outputName" -Force

    $apkSize = (Get-Item "output\$outputName").Length / 1MB

    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "  COMPILATION REUSSIE!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "APK genere: output\$outputName" -ForegroundColor Cyan
    Write-Host "Taille: $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour installer sur un appareil connecte:" -ForegroundColor Yellow
    Write-Host "  adb install output\$outputName" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "ERREUR: APK non trouve a $fullApkPath" -ForegroundColor Red
    exit 1
}
