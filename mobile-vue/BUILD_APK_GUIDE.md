# 📱 Guide de Compilation APK - Sans Android Studio

Ce guide explique comment compiler votre application Ionic/Capacitor en APK en utilisant uniquement le SDK Android (sans Android Studio).

## 📋 Prérequis

### 1. SDK Android installé avec les composants suivants:
- **Android SDK Platform** (API 36 ou supérieur)
- **Android SDK Build-Tools** (34.0.0 ou supérieur)
- **Android SDK Platform-Tools**

D'après votre capture d'écran, votre SDK est dans: `C:\Acer (C.)\Android\Sdk`

### 2. Java JDK (version 17 recommandée)
```powershell
# Vérifier Java
java -version
```

Si Java n'est pas installé:
- Téléchargez [Eclipse Temurin JDK 17](https://adoptium.net/temurin/releases/)
- Ou installez avec winget: `winget install EclipseAdoptium.Temurin.17.JDK`

### 3. Node.js et npm
```powershell
node -version
npm -version
```

---

## 🚀 Compilation Rapide (Script Automatique)

### Mode Debug (pour tester):
```powershell
cd D:\S5\Mr Rojo\mikoike-cloud\mobile-vue
.\build-apk.ps1
```

### Mode Release (pour production):
```powershell
.\build-apk.ps1 -Release
```

### Sauter le build web (si déjà fait):
```powershell
.\build-apk.ps1 -SkipBuild
```

L'APK sera généré dans le dossier `output/`

---

## 🔧 Compilation Manuelle (Étape par Étape)

### Étape 1: Configurer les variables d'environnement

```powershell
# Définir ANDROID_SDK_ROOT (adaptez le chemin à votre installation)
$env:ANDROID_SDK_ROOT = "C:\Acer (C.)\Android\Sdk"
$env:ANDROID_HOME = $env:ANDROID_SDK_ROOT
```

### Étape 2: Build du projet Vue/Ionic

```powershell
cd D:\S5\Mr Rojo\mikoike-cloud\mobile-vue

# Installer les dépendances (si pas déjà fait)
npm install

# Build du projet web
npm run build
```

### Étape 3: Synchroniser avec Capacitor

```powershell
npx cap sync android
```

### Étape 4: Compiler l'APK avec Gradle

```powershell
cd android

# APK Debug (pour tester)
.\gradlew.bat assembleDebug --no-daemon

# OU APK Release (pour production)
.\gradlew.bat assembleRelease --no-daemon
```

### Étape 5: Récupérer l'APK

- **Debug**: `android\app\build\outputs\apk\debug\app-debug.apk`
- **Release**: `android\app\build\outputs\apk\release\app-release-unsigned.apk`

---

## 📲 Installation sur Appareil

### Via USB (mode développeur activé):
```powershell
adb install output\mikoike-debug.apk
```

### Réinstaller (si déjà installée):
```powershell
adb install -r output\mikoike-debug.apk
```

---

## 🔐 Signer l'APK Release (Production)

Pour publier sur le Play Store, vous devez signer l'APK:

### 1. Créer un keystore (une seule fois):
```powershell
keytool -genkey -v -keystore mikoike-release-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias mikoike
```

### 2. Signer l'APK:
```powershell
# Aligner l'APK
zipalign -v 4 app-release-unsigned.apk app-release-aligned.apk

# Signer
apksigner sign --ks mikoike-release-key.jks --out mikoike-signed.apk app-release-aligned.apk
```

---

## ⚠️ Résolution des Problèmes

### Erreur: "SDK location not found"
Créez un fichier `android/local.properties`:
```properties
sdk.dir=C:\\Acer (C.)\\Android\\Sdk
```

### Erreur: "JAVA_HOME not set"
```powershell
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot"
```

### Erreur: "License not accepted"
```powershell
# Depuis le dossier cmdline-tools du SDK
sdkmanager --licenses
# Acceptez toutes les licences avec 'y'
```

### Nettoyer le build (en cas de problème):
```powershell
cd android
.\gradlew.bat clean
```

---

## 📁 Structure des Fichiers Générés

```
mobile-vue/
├── output/
│   ├── mikoike-debug.apk      # APK Debug
│   └── mikoike-release.apk    # APK Release
├── android/
│   └── app/build/outputs/apk/
│       ├── debug/
│       │   └── app-debug.apk
│       └── release/
│           └── app-release-unsigned.apk
```
