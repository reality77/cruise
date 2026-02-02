# Guide d'utilisation de l'application Rameur Domyos

## Vue d'ensemble

Cette application permet de se connecter via Bluetooth à un rameur Domyos Woodrover et d'afficher les données d'entraînement en temps réel.

## Prérequis

### Installation de l'environnement

Suivre le guide d'installation dans `docs/installation.md` pour configurer:
- Node.js v18+
- JDK 17
- Android Studio et Android SDK
- Variables d'environnement (ANDROID_HOME, PATH)

## Développement

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173/`

**Note**: Le Bluetooth ne fonctionne pas dans le navigateur web. Vous devez compiler et déployer sur un appareil Android réel.

### Compiler l'application

```bash
# Build du projet Vue
npm run build

# Synchroniser avec Capacitor
npx cap sync

# Ouvrir dans Android Studio
npx cap open android
```

Dans Android Studio:
1. Connecter votre appareil Android via USB
2. Activer le débogage USB sur l'appareil
3. Cliquer sur "Run" (▶️) pour déployer l'application

### Structure du projet

```
/home/david/projects/poc-ram/
├── docs/                       # Documentation
│   ├── plan.md                 # Plan du projet
│   ├── installation.md         # Guide d'installation
│   └── usage.md               # Ce fichier
├── src/
│   ├── App.vue                 # Composant principal de l'application
│   ├── services/
│   │   └── bluetoothService.js # Service de gestion Bluetooth
│   ├── main.js                 # Point d'entrée
│   └── style.css               # Styles Tailwind
├── android/                    # Projet Android natif (Capacitor)
├── capacitor.config.json       # Configuration Capacitor
├── tailwind.config.js          # Configuration TailwindCSS
└── package.json                # Dépendances npm
```

## Utilisation de l'application

### 1. Préparer le rameur

- Allumer le rameur Domyos Woodrover
- Activer le Bluetooth sur le rameur
- S'assurer que le rameur est en mode de couplage

### 2. Connexion Bluetooth

1. Ouvrir l'application sur votre appareil Android
2. Accepter les permissions Bluetooth et localisation si demandé
3. Appuyer sur "Rechercher le rameur"
4. Attendre que le scan détecte le rameur (jusqu'à 10 secondes)
5. Sélectionner votre rameur dans la liste des appareils trouvés
6. La connexion s'établit automatiquement

### 3. Visualisation des données

Une fois connecté, l'application affiche en temps réel:

**Métriques principales** (grandes cartes):
- **Cadence**: Nombre de coups par minute (SPM)
- **Distance**: Distance totale parcourue en mètres
- **Puissance**: Puissance instantanée en watts
- **Temps**: Temps écoulé depuis le début de la session

**Statistiques supplémentaires**:
- Total de coups effectués
- Calories brûlées
- Puissance moyenne (si disponible)
- Allure par 500m (si disponible)

### 4. Déconnexion

Appuyer sur le bouton "Déconnecter" pour terminer la session et se déconnecter du rameur.

## Protocole Bluetooth

### FTMS (Fitness Machine Service)

L'application utilise le protocole standard FTMS (Fitness Machine Service) pour communiquer avec le rameur:

- **Service UUID**: `00001826-0000-1000-8000-00805f9b34fb`
- **Characteristic UUID**: `00002ad1-0000-1000-8000-00805f9b34fb` (Rowing Data)

### Protocole propriétaire Domyos

Si le rameur Woodrover n'utilise pas FTMS, il faudra:

1. Utiliser une application de scan BLE (nRF Connect) pour identifier:
   - Les UUIDs des services disponibles
   - Les UUIDs des caractéristiques
   - Le format des données transmises

2. Modifier `src/services/bluetoothService.js`:
   - Mettre à jour les constantes UUID
   - Adapter la fonction `parseRowingData()` selon le format propriétaire

## Débogage

### Logs Bluetooth

Les logs de connexion et de données sont affichés dans:
- La console du navigateur (lors du développement web)
- Logcat d'Android Studio (déploiement Android)

```bash
# Afficher les logs Android en temps réel
adb logcat | grep -i bluetooth
```

### Problèmes courants

#### "Bluetooth not initialized"
- Vérifier que les permissions sont accordées
- Redémarrer l'application

#### "Device not found"
- Vérifier que le rameur est allumé
- Réessayer le scan
- Modifier le filtre `namePrefix` dans `bluetoothService.js` si le nom exact du rameur est différent

#### "Connection failed"
- Désactiver/réactiver le Bluetooth sur l'appareil
- Redémarrer le rameur
- Vérifier la distance (rester à moins de 10m)

#### Aucune donnée reçue
- Le rameur utilise peut-être un protocole propriétaire
- Utiliser nRF Connect pour analyser les caractéristiques
- Adapter le parsing dans `parseRowingData()`

## Tests

### Test sans rameur physique

Pour tester l'interface sans rameur:
1. Commenter temporairement les appels Bluetooth
2. Simuler des données avec un intervalle:

```javascript
// Dans App.vue, ajouter:
const simulateData = () => {
  setInterval(() => {
    rowingData.value = {
      strokeRate: Math.floor(Math.random() * 30) + 20,
      strokeCount: rowingData.value.strokeCount + 1,
      totalDistance: rowingData.value.totalDistance + 10,
      instantaneousPower: Math.floor(Math.random() * 100) + 50,
      totalEnergy: rowingData.value.totalEnergy + 1,
      elapsedTime: rowingData.value.elapsedTime + 1,
    };
  }, 1000);
};
```

## Compilation pour production

```bash
# Build optimisé
npm run build

# Sync avec Android
npx cap sync android

# Générer l'APK signé (Android Studio)
# Build > Generate Signed Bundle / APK
```

## Prochaines étapes

- Ajouter la persistance des séances (historique)
- Implémenter des graphiques de performance
- Supporter d'autres modèles de rameurs
- Ajouter des programmes d'entraînement personnalisés
