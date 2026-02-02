# Guide d'installation de l'environnement de développement Android

## Prérequis système

- **OS**: Linux, macOS, ou Windows
- **RAM**: Minimum 8 GB (16 GB recommandé)
- **Espace disque**: Minimum 20 GB disponibles

## Outils à installer

### 1. Node.js (v18 ou supérieur)

#### Linux (Ubuntu/Debian)
```bash
# Utiliser nvm (recommandé)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
nvm alias default 18

# Vérifier l'installation
node --version
npm --version
```

#### Alternative: Installation directe
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Java Development Kit (JDK 17)

#### Linux (Ubuntu/Debian)
```bash
# Installer OpenJDK 17
sudo apt update
sudo apt install openjdk-17-jdk

# Vérifier l'installation
java -version
javac -version
```

#### Configuration JAVA_HOME
```bash
# Ajouter à ~/.bashrc ou ~/.zshrc
export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
export PATH=$JAVA_HOME/bin:$PATH

# Recharger le shell
source ~/.bashrc
```

### 3. Android Studio

#### Téléchargement et installation

1. Télécharger Android Studio depuis: https://developer.android.com/studio
2. Extraire l'archive:
```bash
tar -xzf android-studio-*.tar.gz
sudo mv android-studio /opt/
```

3. Lancer Android Studio:
```bash
/opt/android-studio/bin/studio.sh
```

4. Suivre l'assistant d'installation:
   - Installer Android SDK
   - Installer Android SDK Platform-Tools
   - Installer Android SDK Build-Tools
   - Installer un émulateur Android (optionnel)

#### Installation via Snap (alternative)
```bash
sudo snap install android-studio --classic
```

### 4. Android SDK

Android SDK est généralement installé avec Android Studio. Composants requis:

- **Android SDK Platform 33** (Android 13) ou supérieur
- **Android SDK Build-Tools 33.0.0** ou supérieur
- **Android SDK Platform-Tools**
- **Android SDK Command-line Tools**

#### Installation via Android Studio SDK Manager

1. Ouvrir Android Studio
2. Aller dans: **Tools > SDK Manager**
3. Onglet **SDK Platforms**: cocher Android 13.0 (API 33) ou supérieur
4. Onglet **SDK Tools**: cocher:
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
   - Android SDK Command-line Tools
   - Android Emulator (optionnel)
5. Cliquer sur **Apply** pour installer

### 5. Configuration des variables d'environnement

Ajouter à `~/.bashrc` ou `~/.zshrc`:

```bash
# Android SDK
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin
export PATH=$PATH:$ANDROID_HOME/build-tools/33.0.0

# Recharger
source ~/.bashrc
```

#### Vérifier la configuration
```bash
echo $ANDROID_HOME
adb --version
```

### 6. Gradle

Gradle est généralement inclus avec Android Studio et les projets Android.

#### Vérification
```bash
# Gradle sera disponible via le wrapper du projet (./gradlew)
# Pas besoin d'installation globale
```

### 7. Outils de développement supplémentaires

#### Git
```bash
sudo apt install git
git --version
```

#### Capacitor CLI (sera installé avec le projet)
```bash
npm install -g @capacitor/cli
```

## Configuration du périphérique Android

### Mode Développeur

1. Sur votre appareil Android, aller dans **Paramètres > À propos du téléphone**
2. Appuyer 7 fois sur **Numéro de build**
3. Retourner dans **Paramètres > Système > Options pour les développeurs**
4. Activer **Débogage USB**

### Connexion USB

```bash
# Connecter l'appareil via USB
# Autoriser le débogage USB sur l'appareil

# Vérifier la détection
adb devices

# Devrait afficher votre appareil
```

## Vérification complète de l'installation

```bash
# Node.js
node --version  # >= v18.0.0
npm --version   # >= 9.0.0

# Java
java -version   # openjdk 17

# Android
echo $ANDROID_HOME  # Doit afficher le chemin
adb --version       # Doit afficher la version
adb devices         # Doit lister les appareils connectés

# Capacitor (après installation du projet)
npx cap --version
```

## Dépannage courant

### adb: command not found
- Vérifier que `$ANDROID_HOME/platform-tools` est dans le PATH
- Redémarrer le terminal après modification de `.bashrc`

### ANDROID_HOME non défini
- Vérifier le chemin d'installation du SDK
- Généralement: `$HOME/Android/Sdk` (Linux)
- Ajouter l'export dans `.bashrc` et recharger

### Appareil non détecté par adb
```bash
# Redémarrer le serveur adb
adb kill-server
adb start-server
adb devices

# Vérifier les règles udev (Linux)
sudo usermod -aG plugdev $USER
```

### Permissions insuffisantes
```bash
# Ajouter l'utilisateur au groupe plugdev (Linux)
sudo usermod -aG plugdev $LOGNAME
sudo udevadm control --reload-rules
```

## Prochaines étapes

Une fois l'environnement installé, vous pouvez:
1. Créer le projet Vue 3 + Capacitor
2. Ajouter la plateforme Android
3. Lancer le build et déployer sur votre appareil
