# Rameur Domyos - Application Vue + Capacitor

Application Android pour se connecter en Bluetooth à un rameur Domyos Woodrover et afficher les données d'entraînement en temps réel.

## 🎯 Fonctionnalités

- ✅ Connexion Bluetooth au rameur Domyos Woodrover
- ✅ Affichage des métriques en temps réel:
  - Cadence (coups par minute)
  - Distance parcourue
  - Puissance instantanée
  - Temps écoulé
  - Calories brûlées
  - Statistiques supplémentaires
- ✅ Interface moderne avec TailwindCSS
- ✅ Support du protocole FTMS (Fitness Machine Service)

## 🚀 Démarrage rapide

### Prérequis

Voir le guide détaillé: [`docs/installation.md`](docs/installation.md)

- Node.js v18+
- JDK 17
- Android Studio
- Android SDK
- Un appareil Android avec Bluetooth

### Installation

```bash
# Cloner le projet
cd /home/david/projects/poc-ram

# Installer les dépendances
npm install

# Lancer le serveur de développement (web)
npm run dev

# Build pour Android
npm run build
npx cap sync
npx cap open android
```

## 📱 Déploiement Android

1. Connecter votre appareil Android via USB
2. Activer le mode développeur et le débogage USB
3. Dans Android Studio, cliquer sur "Run" (▶️)
4. L'APK sera installé sur votre appareil

## 📚 Documentation

- [Plan du projet](docs/plan.md) - Vue d'ensemble et architecture
- [Guide d'installation](docs/installation.md) - Configuration de l'environnement
- [Guide d'utilisation](docs/usage.md) - Utilisation et débogage

## 🛠 Stack technique

- **Frontend**: Vue 3 (Composition API)
- **Build**: Vite
- **Styling**: TailwindCSS
- **Bridge natif**: Capacitor
- **Bluetooth**: @capacitor-community/bluetooth-le
- **Plateforme**: Android

## 📁 Structure du projet

```
poc-ram/
├── docs/                    # Documentation
├── src/
│   ├── App.vue             # Composant principal
│   ├── services/
│   │   └── bluetoothService.js  # Service Bluetooth
│   └── style.css           # Styles Tailwind
├── android/                # Projet Android natif
└── capacitor.config.json   # Configuration Capacitor
```

## 🔧 Développement

### Commandes utiles

```bash
# Développement web (Bluetooth ne fonctionnera pas)
npm run dev

# Build
npm run build

# Synchroniser avec Android
npx cap sync

# Ouvrir Android Studio
npx cap open android

# Voir les logs Android
adb logcat | grep -i bluetooth
```

### Protocole Bluetooth

Le rameur doit supporter le protocole **FTMS** (Fitness Machine Service):
- Service UUID: `00001826-0000-1000-8000-00805f9b34fb`
- Characteristic: `00002ad1-0000-1000-8000-00805f9b34fb`

Si le rameur utilise un protocole propriétaire, utiliser **nRF Connect** pour identifier les UUIDs et adapter le code.

## 🐛 Problèmes courants

### Rameur non détecté
- Vérifier que le rameur est allumé et en mode Bluetooth
- Ajuster le filtre de nom dans `bluetoothService.js` (ligne 48)
- Augmenter la durée du scan

### Aucune donnée reçue
- Le rameur utilise peut-être un protocole propriétaire
- Analyser avec nRF Connect
- Adapter la fonction `parseRowingData()` dans `bluetoothService.js`

### Permissions refusées
- Accorder les permissions Bluetooth et localisation dans les paramètres Android
- Redémarrer l'application

## 📝 Licence

MIT

## 👨‍💻 Auteur

David - 2026

