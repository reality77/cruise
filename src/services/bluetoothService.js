import { BleClient } from '@capacitor-community/bluetooth-le';

// UUIDs pour le service FTMS (Fitness Machine Service)
const FTMS_SERVICE_UUID = '00001826-0000-1000-8000-00805f9b34fb';
const ROWING_DATA_CHARACTERISTIC_UUID = '00002ad1-0000-1000-8000-00805f9b34fb';

class BluetoothService {
  constructor() {
    this.device = null;
    this.isConnected = false;
    this.onDataCallback = null;
  }

  /**
   * Initialiser le plugin Bluetooth
   */
  async initialize() {
    try {
      await BleClient.initialize();
      console.log('Bluetooth initialized');
      
      // Vérifier si Bluetooth est activé
      const isEnabled = await BleClient.isEnabled();
      if (!isEnabled) {
        console.warn('Bluetooth is not enabled');
        // Sur Android, on peut demander à l'utilisateur d'activer Bluetooth
        try {
          await BleClient.enable();
        } catch (enableError) {
          console.log('User needs to manually enable Bluetooth');
        }
      }
    } catch (error) {
      console.error('Error initializing Bluetooth:', error);
      throw error;
    }
  }

  /**
   * Demander les permissions Bluetooth (gérées automatiquement par le plugin)
   */
  async requestPermissions() {
    try {
      // Les permissions sont gérées automatiquement par le plugin
      // lors de l'initialisation et du premier scan
      console.log('Bluetooth permissions will be requested automatically');
      return true;
    } catch (error) {
      console.error('Error with permissions:', error);
      throw error;
    }
  }

  /**
   * Scanner les dispositifs Bluetooth à proximité
   * @param {Function} onDeviceFound - Callback appelé pour chaque appareil trouvé
   * @param {number} scanDuration - Durée du scan en millisecondes (défaut: 10s)
   */
  async scanDevices(onDeviceFound, scanDuration = 10000) {
    try {
      console.log('Starting BLE scan...');
      
      await BleClient.requestLEScan(
        {
          // Filtrer par nom contenant "Domyos" ou "Woodrover"
          // Note: le filtre peut varier selon le nom exact du rameur
          namePrefix: 'Domyos',
        },
        (result) => {
          console.log('Device found:', result);
          onDeviceFound({
            deviceId: result.device.deviceId,
            name: result.device.name || 'Unknown',
            rssi: result.rssi,
          });
        }
      );

      // Arrêter le scan après la durée spécifiée
      setTimeout(async () => {
        await this.stopScan();
      }, scanDuration);
    } catch (error) {
      console.error('Error scanning devices:', error);
      throw error;
    }
  }

  /**
   * Arrêter le scan
   */
  async stopScan() {
    try {
      await BleClient.stopLEScan();
      console.log('BLE scan stopped');
    } catch (error) {
      console.error('Error stopping scan:', error);
    }
  }

  /**
   * Se connecter à un dispositif
   * @param {string} deviceId - ID du dispositif
   */
  async connect(deviceId) {
    try {
      console.log(`Connecting to device: ${deviceId}`);
      
      await BleClient.connect(deviceId, (disconnectedDeviceId) => {
        console.log(`Device ${disconnectedDeviceId} disconnected`);
        this.isConnected = false;
        this.device = null;
      });

      this.device = deviceId;
      this.isConnected = true;
      console.log('Connected successfully');

      // Découvrir les services disponibles
      const services = await BleClient.getServices(deviceId);
      console.log('Available services:', services);

      return services;
    } catch (error) {
      console.error('Error connecting to device:', error);
      throw error;
    }
  }

  /**
   * Se déconnecter du dispositif
   */
  async disconnect() {
    if (this.device) {
      try {
        await BleClient.disconnect(this.device);
        this.isConnected = false;
        this.device = null;
        console.log('Disconnected');
      } catch (error) {
        console.error('Error disconnecting:', error);
        throw error;
      }
    }
  }

  /**
   * S'abonner aux notifications de données du rameur
   * @param {Function} onData - Callback appelé à chaque réception de données
   */
  async subscribeToRowingData(onData) {
    if (!this.device) {
      throw new Error('Not connected to any device');
    }

    try {
      this.onDataCallback = onData;

      await BleClient.startNotifications(
        this.device,
        FTMS_SERVICE_UUID,
        ROWING_DATA_CHARACTERISTIC_UUID,
        (value) => {
          const data = this.parseRowingData(value);
          if (this.onDataCallback) {
            this.onDataCallback(data);
          }
        }
      );

      console.log('Subscribed to rowing data notifications');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      throw error;
    }
  }

  /**
   * Se désabonner des notifications
   */
  async unsubscribeFromRowingData() {
    if (this.device) {
      try {
        await BleClient.stopNotifications(
          this.device,
          FTMS_SERVICE_UUID,
          ROWING_DATA_CHARACTERISTIC_UUID
        );
        this.onDataCallback = null;
        console.log('Unsubscribed from rowing data notifications');
      } catch (error) {
        console.error('Error unsubscribing:', error);
      }
    }
  }

  /**
   * Parser les données reçues du rameur selon le protocole FTMS
   * @param {DataView} dataView - Données brutes reçues
   * @returns {Object} Données parsées
   */
  parseRowingData(dataView) {
    // Structure des données FTMS Rowing Data (0x2AD1)
    // Voir: https://www.bluetooth.com/specifications/specs/gatt-specification-supplement/
    
    const flags = dataView.getUint16(0, true);
    let offset = 2;

    const data = {
      strokeRate: null,      // Cadence (coups par minute)
      strokeCount: null,     // Nombre total de coups
      averageStrokeRate: null,
      totalDistance: null,   // Distance totale en mètres
      instantaneousPace: null,
      averagePace: null,
      instantaneousPower: null, // Puissance en watts
      averagePower: null,
      resistanceLevel: null,
      totalEnergy: null,     // Énergie en calories
      energyPerHour: null,
      energyPerMinute: null,
      elapsedTime: null,     // Temps écoulé en secondes
      remainingTime: null,
    };

    // Flags définissent quels champs sont présents
    // Bit 0: More data (0 = no, 1 = yes)
    // Bit 1: Average stroke present
    // Bit 2: Total distance present
    // Bit 3: Instantaneous pace present
    // Bit 4: Average pace present
    // Bit 5: Instantaneous power present
    // Bit 6: Average power present
    // Bit 7: Resistance level present
    // Bit 8: Expended energy present
    // Bit 9: Heart rate present
    // Bit 10: Metabolic equivalent present
    // Bit 11: Elapsed time present
    // Bit 12: Remaining time present

    // Stroke Rate (toujours présent) - uint8
    if (offset < dataView.byteLength) {
      data.strokeRate = dataView.getUint8(offset);
      offset += 1;
    }

    // Stroke Count (toujours présent) - uint16
    if (offset + 1 < dataView.byteLength) {
      data.strokeCount = dataView.getUint16(offset, true);
      offset += 2;
    }

    // Average Stroke Rate - uint8
    if ((flags & 0x02) && offset < dataView.byteLength) {
      data.averageStrokeRate = dataView.getUint8(offset);
      offset += 1;
    }

    // Total Distance - uint24 (3 bytes)
    if ((flags & 0x04) && offset + 2 < dataView.byteLength) {
      data.totalDistance = 
        dataView.getUint8(offset) +
        (dataView.getUint8(offset + 1) << 8) +
        (dataView.getUint8(offset + 2) << 16);
      offset += 3;
    }

    // Instantaneous Pace - uint16 (1/100 s/500m)
    if ((flags & 0x08) && offset + 1 < dataView.byteLength) {
      data.instantaneousPace = dataView.getUint16(offset, true) / 100;
      offset += 2;
    }

    // Average Pace - uint16
    if ((flags & 0x10) && offset + 1 < dataView.byteLength) {
      data.averagePace = dataView.getUint16(offset, true) / 100;
      offset += 2;
    }

    // Instantaneous Power - sint16 (watts)
    if ((flags & 0x20) && offset + 1 < dataView.byteLength) {
      data.instantaneousPower = dataView.getInt16(offset, true);
      offset += 2;
    }

    // Average Power - sint16 (watts)
    if ((flags & 0x40) && offset + 1 < dataView.byteLength) {
      data.averagePower = dataView.getInt16(offset, true);
      offset += 2;
    }

    // Resistance Level - sint16
    if ((flags & 0x80) && offset + 1 < dataView.byteLength) {
      data.resistanceLevel = dataView.getInt16(offset, true);
      offset += 2;
    }

    // Expended Energy - uint16 (calories), uint16 (cal/h), uint8 (cal/min)
    if ((flags & 0x100) && offset + 4 < dataView.byteLength) {
      data.totalEnergy = dataView.getUint16(offset, true);
      data.energyPerHour = dataView.getUint16(offset + 2, true);
      data.energyPerMinute = dataView.getUint8(offset + 4);
      offset += 5;
    }

    // Elapsed Time - uint16 (seconds)
    if ((flags & 0x800) && offset + 1 < dataView.byteLength) {
      data.elapsedTime = dataView.getUint16(offset, true);
      offset += 2;
    }

    // Remaining Time - uint16 (seconds)
    if ((flags & 0x1000) && offset + 1 < dataView.byteLength) {
      data.remainingTime = dataView.getUint16(offset, true);
      offset += 2;
    }

    console.log('Parsed rowing data:', data);
    return data;
  }
}

// Export singleton
export default new BluetoothService();
