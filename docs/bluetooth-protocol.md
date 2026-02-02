# Protocole Bluetooth pour rameur Domyos Woodrover

## Vue d'ensemble

Ce document détaille les informations sur le protocole Bluetooth utilisé par le rameur Domyos Woodrover pour la transmission des données d'entraînement.

## Protocole FTMS (Fitness Machine Service)

Le protocole standard utilisé par les équipements fitness est **FTMS** (Fitness Machine Service), défini par le Bluetooth SIG.

### Service UUID

- **FTMS Service**: `0x1826` ou `00001826-0000-1000-8000-00805f9b34fb`

### Caractéristiques principales

| Caractéristique | UUID | Type | Description |
|-----------------|------|------|-------------|
| Fitness Machine Feature | 0x2ACC | Read | Capacités de l'appareil |
| Indoor Bike Data | 0x2AD2 | Notify | Données vélo d'intérieur |
| **Rowing Data** | **0x2AD1** | **Notify** | **Données rameur** |
| Training Status | 0x2AD3 | Read, Notify | Statut d'entraînement |
| Supported Resistance Level Range | 0x2AD6 | Read | Niveaux de résistance |
| Fitness Machine Control Point | 0x2AD9 | Write, Indicate | Commandes de contrôle |

### Rowing Data Characteristic (0x2AD1)

C'est la caractéristique principale pour le rameur. Elle transmet les données en temps réel.

#### Structure des données

```
Offset | Type    | Nom du champ           | Unité
-------|---------|------------------------|--------
0-1    | uint16  | Flags                  | -
2      | uint8   | Stroke Rate            | strokes/min
3-4    | uint16  | Stroke Count           | count
5      | uint8   | Average Stroke Rate    | strokes/min (optionnel)
6-8    | uint24  | Total Distance         | meters (optionnel)
9-10   | uint16  | Instantaneous Pace     | 1/100 s/500m (optionnel)
11-12  | uint16  | Average Pace           | 1/100 s/500m (optionnel)
13-14  | sint16  | Instantaneous Power    | watts (optionnel)
15-16  | sint16  | Average Power          | watts (optionnel)
17-18  | sint16  | Resistance Level       | (optionnel)
19-20  | uint16  | Total Energy           | kcal (optionnel)
21-22  | uint16  | Energy Per Hour        | kcal/h (optionnel)
23     | uint8   | Energy Per Minute      | kcal/min (optionnel)
24     | uint8   | Heart Rate             | bpm (optionnel)
25     | uint8   | Metabolic Equivalent   | 0.1 MET (optionnel)
26-27  | uint16  | Elapsed Time           | seconds (optionnel)
28-29  | uint16  | Remaining Time         | seconds (optionnel)
```

#### Flags (bits)

Les 2 premiers octets définissent quels champs sont présents:

```
Bit  | Description
-----|------------------------------------
0    | More Data (0 = non, 1 = oui)
1    | Average Stroke Rate present
2    | Total Distance present
3    | Instantaneous Pace present
4    | Average Pace present
5    | Instantaneous Power present
6    | Average Power present
7    | Resistance Level present
8    | Expended Energy present
9    | Heart Rate present
10   | Metabolic Equivalent present
11   | Elapsed Time present
12   | Remaining Time present
13-15| Reserved
```

#### Exemple de parsing

```javascript
const flags = dataView.getUint16(0, true); // Little endian
let offset = 2;

// Stroke Rate (toujours présent)
const strokeRate = dataView.getUint8(offset);
offset += 1;

// Stroke Count (toujours présent)
const strokeCount = dataView.getUint16(offset, true);
offset += 2;

// Total Distance (si bit 2 = 1)
if (flags & 0x04) {
  const distance = dataView.getUint8(offset) +
                   (dataView.getUint8(offset + 1) << 8) +
                   (dataView.getUint8(offset + 2) << 16);
  offset += 3;
}

// Instantaneous Power (si bit 5 = 1)
if (flags & 0x20) {
  const power = dataView.getInt16(offset, true);
  offset += 2;
}
```

## Protocole propriétaire Domyos (alternative)

Si le rameur Woodrover n'utilise pas FTMS, il peut utiliser un protocole propriétaire Domyos/Décathlon.

### Identification du protocole

Pour identifier le protocole propriétaire:

1. **Installer nRF Connect** (Android/iOS)
   - Play Store: https://play.google.com/store/apps/details?id=no.nordicsemi.android.mcp
   
2. **Scanner le rameur**
   - Allumer le rameur
   - Lancer nRF Connect
   - Scanner et sélectionner "Domyos" ou "Woodrover"
   
3. **Explorer les services**
   - Noter tous les UUIDs de services
   - Noter tous les UUIDs de caractéristiques
   - Identifier lesquelles ont des propriétés "Notify" ou "Indicate"
   
4. **S'abonner aux notifications**
   - S'abonner à chaque caractéristique Notify
   - Effectuer une session sur le rameur
   - Observer les données reçues (format hexadécimal)
   
5. **Analyser le format**
   - Identifier les patterns
   - Corréler les valeurs affichées sur le rameur avec les bytes reçus
   - Déterminer l'endianness (little/big endian)

### UUIDs propriétaires courants

Les marques utilisent souvent des UUIDs personnalisés:

```
Service: 0000xxxx-0000-1000-8000-00805f9b34fb
Characteristic: 0000yyyy-0000-1000-8000-00805f9b34fb
```

Ou des UUIDs 128-bits complètement personnalisés:
```
xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Adaptation du code

Une fois le protocole identifié, modifier `src/services/bluetoothService.js`:

```javascript
// Remplacer les UUIDs
const DOMYOS_SERVICE_UUID = 'votre-service-uuid';
const DOMYOS_DATA_CHARACTERISTIC_UUID = 'votre-characteristic-uuid';

// Adapter la fonction parseRowingData()
parseRowingData(dataView) {
  // Exemple pour un protocole propriétaire
  const data = {
    strokeRate: dataView.getUint8(0),      // Byte 0
    totalDistance: dataView.getUint16(1, true), // Bytes 1-2
    instantaneousPower: dataView.getUint16(3, true), // Bytes 3-4
    elapsedTime: dataView.getUint16(5, true), // Bytes 5-6
    // ... adapter selon le format réel
  };
  return data;
}
```

## Tests et validation

### Test avec simulateur

Si vous n'avez pas accès au rameur:

```javascript
// Simuler des données FTMS
function simulateFTMSData() {
  const buffer = new ArrayBuffer(20);
  const view = new DataView(buffer);
  
  // Flags: Total Distance + Power + Time
  view.setUint16(0, 0x0824, true);
  
  // Stroke Rate
  view.setUint8(2, 25);
  
  // Stroke Count
  view.setUint16(3, 150, true);
  
  // Total Distance (3 bytes)
  view.setUint8(5, 0xE8); // 1000m
  view.setUint8(6, 0x03);
  view.setUint8(7, 0x00);
  
  // Instantaneous Power
  view.setInt16(8, 120, true);
  
  // Elapsed Time
  view.setUint16(10, 300, true);
  
  return view;
}
```

### Logs de débogage

Activer les logs détaillés dans `bluetoothService.js`:

```javascript
console.log('Raw data (hex):', 
  Array.from(new Uint8Array(dataView.buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join(' ')
);
```

## Ressources

- [FTMS Specification (PDF)](https://www.bluetooth.com/specifications/specs/fitness-machine-service-1-0/)
- [GATT Specifications](https://www.bluetooth.com/specifications/specs/gatt-specification-supplement/)
- [nRF Connect App](https://www.nordicsemi.com/Products/Development-tools/nrf-connect-for-mobile)
- [Concept2 PM5 Protocol](https://www.concept2.com/service/software/software-development-kit) (référence pour rameurs)

## Contact et contribution

Si vous avez identifié le protocole exact du Woodrover, n'hésitez pas à documenter vos découvertes ici.
