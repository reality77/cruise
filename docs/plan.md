# Plan: Application Vue pour rameur Domyos Woodrover

## Objectif

Créer une application Android avec Vue 3 + Capacitor pour se connecter en Bluetooth à un rameur Domyos Woodrover et afficher les données en temps réel avec une interface simple et moderne utilisant TailwindCSS.

## Architecture technique

- **Frontend**: Vue 3 + Vite
- **Styling**: TailwindCSS
- **Bridge natif**: Capacitor
- **Bluetooth**: @capacitor-community/bluetooth-le
- **Plateforme cible**: Android

## Étapes de développement

### 1. Installer l'environnement de développement

Outils requis:
- Node.js (v18+)
- JDK 17
- Android Studio
- Android SDK
- Gradle
- Configuration: ANDROID_HOME et ajout des outils SDK au PATH

### 2. Initialiser le projet Capacitor + Vue 3

- Créer l'app Vue 3 avec Vite
- Intégrer TailwindCSS
- Ajouter Capacitor
- Configurer la plateforme Android
- Installer le plugin `@capacitor-community/bluetooth-le`

### 3. Configurer les permissions Android

Modifier `AndroidManifest.xml` pour ajouter:
- BLUETOOTH
- BLUETOOTH_ADMIN
- BLUETOOTH_SCAN
- BLUETOOTH_CONNECT
- ACCESS_FINE_LOCATION (requis Android 12+)

### 4. Implémenter la découverte et connexion Bluetooth

- Scanner les dispositifs BLE filtrant par nom "Domyos" ou "Woodrover"
- Se connecter au rameur
- Découvrir les services FTMS (0x1826) ou services propriétaires

### 5. Décoder et afficher les données en temps réel

- Parser les notifications des caractéristiques Bluetooth
- Données à afficher: cadence, distance, puissance, SPM (strokes per minute), temps
- Créer des composants Vue 3 stylisés avec TailwindCSS affichant les métriques en direct

### 6. Tester sur appareil Android

- Activer le mode développeur
- Installer l'APK via USB
- Tester la connexion avec le rameur Woodrover réel

## Considérations importantes

### Protocole Bluetooth Domyos

Le rameur Domyos Woodrover peut utiliser:
1. **FTMS standard** (Fitness Machine Service - UUID 0x1826): protocole Bluetooth standardisé pour équipements fitness
2. **Protocole propriétaire Domyos**: UUIDs spécifiques à identifier

**Plan de test**:
- Tester d'abord avec FTMS standard
- Si non fonctionnel, utiliser une app de scan BLE (nRF Connect) pour identifier les UUIDs des services/caractéristiques propriétaires du Woodrover

### Structure des données FTMS

Si le rameur utilise FTMS, les caractéristiques typiques incluent:
- **Rowing Data Characteristic** (0x2AD1): données de rame en temps réel
- **Indoor Bike Data** ou équivalent
- Flags de présence des données dans les premiers octets
- Parsing des valeurs selon spécification GATT

## Évolutions futures (Phase 2)

- Persistance des séances d'entraînement
- Historique et statistiques
- Graphiques de performance
- Programmes d'entraînement personnalisés
