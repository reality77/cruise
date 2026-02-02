# Notes de développement

## Changements effectués

### 2 février 2026

#### Configuration initiale
- ✅ Création du projet Vue 3 avec Vite
- ✅ Installation et configuration de TailwindCSS v4 avec `@tailwindcss/postcss`
- ✅ Installation de Capacitor et ajout de la plateforme Android
- ✅ Installation du plugin `@capacitor-community/bluetooth-le`

#### Configuration Android
- ✅ Ajout des permissions Bluetooth dans `AndroidManifest.xml`:
  - BLUETOOTH, BLUETOOTH_ADMIN (pour Android ≤ 30)
  - BLUETOOTH_SCAN, BLUETOOTH_CONNECT (pour Android ≥ 31)
  - ACCESS_FINE_LOCATION (pour Android ≤ 30)
- ✅ Enregistrement du plugin BluetoothLE dans `MainActivity.java`
- ✅ Déclaration de la fonctionnalité `bluetooth_le` comme requise

#### Implémentation
- ✅ Service Bluetooth (`src/services/bluetoothService.js`):
  - Initialisation et demande de permissions
  - Scan des dispositifs avec filtre par nom
  - Connexion/déconnexion
  - Souscription aux notifications FTMS
  - Parsing des données selon le protocole FTMS Rowing Data (0x2AD1)
  
- ✅ Interface utilisateur (`src/App.vue`):
  - Composant principal avec Composition API
  - Gestion du scan et de la connexion
  - Affichage des métriques en temps réel
  - Design moderne avec TailwindCSS (dégradé bleu, glassmorphism)
  - Responsive et accessible

#### Documentation
- ✅ `docs/plan.md` - Plan du projet et architecture
- ✅ `docs/installation.md` - Guide d'installation complet
- ✅ `docs/usage.md` - Guide d'utilisation et débogage
- ✅ `docs/bluetooth-protocol.md` - Spécifications du protocole FTMS
- ✅ `README.md` - Vue d'ensemble du projet

#### Build et déploiement
- ✅ Build Vite réussi (1.10s)
- ✅ Synchronisation Capacitor réussie
- ⏳ Prêt pour le déploiement sur appareil Android

## Points à tester

### Test 1: Connexion Bluetooth
- [ ] Lancer l'app sur un appareil Android réel
- [ ] Vérifier que les permissions sont demandées
- [ ] Scanner les dispositifs Bluetooth
- [ ] Vérifier si le rameur Woodrover apparaît

### Test 2: Protocole FTMS
- [ ] Se connecter au rameur
- [ ] Vérifier si le service UUID `0x1826` est présent
- [ ] S'abonner aux notifications de la caractéristique `0x2AD1`
- [ ] Observer si des données sont reçues

### Test 3: Protocole propriétaire (si FTMS ne fonctionne pas)
- [ ] Installer nRF Connect
- [ ] Scanner et se connecter au rameur
- [ ] Noter tous les services et caractéristiques disponibles
- [ ] Identifier lesquelles envoient des notifications
- [ ] Analyser le format des données reçues
- [ ] Adapter `bluetoothService.js` en conséquence

## Problèmes connus

### Nom du rameur inconnu
Le filtre de scan utilise `namePrefix: 'Domyos'`. Si le rameur a un nom différent:
- Option 1: Modifier le filtre dans `bluetoothService.js` ligne 48
- Option 2: Retirer le filtre pour voir tous les appareils
- Option 3: Utiliser nRF Connect pour identifier le nom exact

### Version TailwindCSS
- Utilise TailwindCSS v4 avec le nouveau plugin `@tailwindcss/postcss`
- Configuration différente de v3 (plus besoin de `tailwind.config.js` complexe)

## Prochaines étapes

### Phase 1: Validation du protocole
1. Déployer sur appareil Android
2. Tester la connexion avec le rameur réel
3. Valider le format des données reçues
4. Ajuster le parsing si nécessaire

### Phase 2: Améliorations UI/UX (optionnel)
- [ ] Ajouter des graphiques en temps réel (Chart.js ou ApexCharts)
- [ ] Animations des métriques
- [ ] Mode paysage optimisé
- [ ] Thème sombre/clair

### Phase 3: Persistance (optionnel)
- [ ] Installer `@capacitor/preferences` ou SQLite
- [ ] Enregistrer l'historique des séances
- [ ] Écran de statistiques
- [ ] Export CSV/JSON des données

### Phase 4: Fonctionnalités avancées (optionnel)
- [ ] Programmes d'entraînement
- [ ] Objectifs et défis
- [ ] Intégration avec applications fitness (Strava, etc.)
- [ ] Partage sur réseaux sociaux

## Ressources utiles

### Outils de débogage
- **nRF Connect**: Analyser les services Bluetooth
- **Android Studio Logcat**: Voir les logs de l'application
- **Chrome DevTools**: Déboguer l'interface (en mode web)

### Commandes fréquentes
```bash
# Build et sync
npm run build && npx cap sync

# Ouvrir dans Android Studio
npx cap open android

# Logs Android en temps réel
adb logcat | grep -i bluetooth

# Vérifier les appareils connectés
adb devices

# Installer l'APK manuellement
adb install -r android/app/build/outputs/apk/debug/app-debug.apk
```

### Documentation externe
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Bluetooth LE Plugin](https://github.com/capacitor-community/bluetooth-le)
- [FTMS Specification](https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/)
- [TailwindCSS v4 Docs](https://tailwindcss.com/docs)

## Notes de maintenance

### Dépendances principales
```json
{
  "@capacitor/android": "latest",
  "@capacitor/core": "latest",
  "@capacitor-community/bluetooth-le": "^8.0.2",
  "vue": "^3.x",
  "vite": "^7.x",
  "@tailwindcss/postcss": "latest"
}
```

### Versions Android supportées
- Minimum SDK: 22 (Android 5.1)
- Target SDK: 33+ (Android 13+)
- Bluetooth LE requis

### Compatibilité
- ✅ Android 5.1+
- ❌ iOS (pas encore implémenté)
- ❌ Web (Bluetooth LE limité dans les navigateurs)
