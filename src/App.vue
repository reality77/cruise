<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-600 p-4">
    <div class="max-w-4xl mx-auto">
      <!-- Header -->
      <div class="text-center mb-8 pt-6">
        <h1 class="text-4xl font-bold text-white mb-2">Rameur Domyos</h1>
        <p class="text-blue-100">Woodrover Connected</p>
      </div>

      <!-- Connection Status -->
      <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-semibold text-white">Connexion Bluetooth</h2>
          <div 
            :class="[
              'w-3 h-3 rounded-full',
              isConnected ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
            ]"
          ></div>
        </div>

        <div v-if="!isConnected" class="space-y-3">
          <button
            @click="startScan"
            :disabled="isScanning"
            class="w-full bg-white text-blue-700 font-semibold py-3 px-6 rounded-xl hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ isScanning ? 'Recherche en cours...' : 'Rechercher le rameur' }}
          </button>

          <!-- Device List -->
          <div v-if="devices.length > 0" class="mt-4 space-y-2">
            <p class="text-sm text-blue-100 mb-2">Appareils trouvés:</p>
            <button
              v-for="device in devices"
              :key="device.deviceId"
              @click="connectToDevice(device.deviceId)"
              class="w-full bg-white/20 text-white py-3 px-4 rounded-lg hover:bg-white/30 transition-colors text-left"
            >
              <div class="font-medium">{{ device.name }}</div>
              <div class="text-xs text-blue-100">Signal: {{ device.rssi }} dBm</div>
            </button>
          </div>
        </div>

        <div v-else class="space-y-3">
          <div class="text-white">
            <p class="text-sm text-blue-100">Connecté à:</p>
            <p class="font-medium">{{ connectedDeviceName }}</p>
          </div>
          <button
            @click="disconnect"
            class="w-full bg-red-500 text-white font-semibold py-3 px-6 rounded-xl hover:bg-red-600 transition-colors"
          >
            Déconnecter
          </button>
        </div>

        <!-- Error Message -->
        <div v-if="errorMessage" class="mt-4 bg-red-500/20 border border-red-400 text-white px-4 py-3 rounded-lg">
          <p class="text-sm">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Rowing Metrics -->
      <div v-if="isConnected" class="grid grid-cols-2 gap-4 mb-6">
        <!-- Stroke Rate -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div class="text-blue-100 text-sm mb-1">Cadence</div>
          <div class="text-white text-4xl font-bold">{{ rowingData.strokeRate || 0 }}</div>
          <div class="text-blue-200 text-sm mt-1">coups/min</div>
        </div>

        <!-- Distance -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div class="text-blue-100 text-sm mb-1">Distance</div>
          <div class="text-white text-4xl font-bold">{{ formatDistance(rowingData.totalDistance) }}</div>
          <div class="text-blue-200 text-sm mt-1">mètres</div>
        </div>

        <!-- Power -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div class="text-blue-100 text-sm mb-1">Puissance</div>
          <div class="text-white text-4xl font-bold">{{ rowingData.instantaneousPower || 0 }}</div>
          <div class="text-blue-200 text-sm mt-1">watts</div>
        </div>

        <!-- Time -->
        <div class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div class="text-blue-100 text-sm mb-1">Temps</div>
          <div class="text-white text-4xl font-bold">{{ formatTime(rowingData.elapsedTime) }}</div>
          <div class="text-blue-200 text-sm mt-1">minutes</div>
        </div>
      </div>

      <!-- Additional Metrics -->
      <div v-if="isConnected" class="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
        <h3 class="text-lg font-semibold text-white mb-4">Statistiques supplémentaires</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <div class="text-blue-100 text-sm">Total coups</div>
            <div class="text-white text-2xl font-semibold">{{ rowingData.strokeCount || 0 }}</div>
          </div>
          <div>
            <div class="text-blue-100 text-sm">Calories</div>
            <div class="text-white text-2xl font-semibold">{{ rowingData.totalEnergy || 0 }}</div>
          </div>
          <div v-if="rowingData.averagePower">
            <div class="text-blue-100 text-sm">Puissance moyenne</div>
            <div class="text-white text-2xl font-semibold">{{ rowingData.averagePower }} W</div>
          </div>
          <div v-if="rowingData.instantaneousPace">
            <div class="text-blue-100 text-sm">Allure (/500m)</div>
            <div class="text-white text-2xl font-semibold">{{ formatPace(rowingData.instantaneousPace) }}</div>
          </div>
        </div>
      </div>

      <!-- Placeholder when not connected -->
      <div v-if="!isConnected" class="bg-white/10 backdrop-blur-lg rounded-2xl p-12 shadow-xl text-center">
        <svg class="w-20 h-20 mx-auto mb-4 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"></path>
        </svg>
        <p class="text-white text-lg">Connectez-vous à votre rameur pour voir les données en temps réel</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import bluetoothService from './services/bluetoothService';

const isConnected = ref(false);
const isScanning = ref(false);
const devices = ref([]);
const connectedDeviceName = ref('');
const errorMessage = ref('');

const rowingData = ref({
  strokeRate: 0,
  strokeCount: 0,
  totalDistance: 0,
  instantaneousPower: 0,
  averagePower: null,
  totalEnergy: 0,
  elapsedTime: 0,
  instantaneousPace: null,
});

onMounted(async () => {
  try {
    await bluetoothService.initialize();
    await bluetoothService.requestPermissions();
  } catch (error) {
    errorMessage.value = 'Erreur lors de l\'initialisation Bluetooth: ' + error.message;
  }
});

onUnmounted(async () => {
  if (isConnected.value) {
    await disconnect();
  }
});

const startScan = async () => {
  try {
    errorMessage.value = '';
    devices.value = [];
    isScanning.value = true;

    const foundDevices = new Map();

    await bluetoothService.scanDevices((device) => {
      // Éviter les doublons
      if (!foundDevices.has(device.deviceId)) {
        foundDevices.set(device.deviceId, device);
        devices.value = Array.from(foundDevices.values());
      }
    }, 10000);

    isScanning.value = false;

    if (devices.value.length === 0) {
      errorMessage.value = 'Aucun rameur Domyos trouvé. Assurez-vous qu\'il est allumé et à proximité.';
    }
  } catch (error) {
    isScanning.value = false;
    errorMessage.value = 'Erreur lors du scan: ' + error.message;
  }
};

const connectToDevice = async (deviceId) => {
  try {
    errorMessage.value = '';
    const device = devices.value.find(d => d.deviceId === deviceId);
    connectedDeviceName.value = device?.name || 'Rameur Domyos';

    await bluetoothService.connect(deviceId);
    isConnected.value = true;

    // S'abonner aux données
    await bluetoothService.subscribeToRowingData((data) => {
      rowingData.value = { ...rowingData.value, ...data };
    });
  } catch (error) {
    errorMessage.value = 'Erreur de connexion: ' + error.message;
    isConnected.value = false;
  }
};

const disconnect = async () => {
  try {
    await bluetoothService.unsubscribeFromRowingData();
    await bluetoothService.disconnect();
    isConnected.value = false;
    connectedDeviceName.value = '';
    devices.value = [];
    rowingData.value = {
      strokeRate: 0,
      strokeCount: 0,
      totalDistance: 0,
      instantaneousPower: 0,
      averagePower: null,
      totalEnergy: 0,
      elapsedTime: 0,
      instantaneousPace: null,
    };
  } catch (error) {
    errorMessage.value = 'Erreur lors de la déconnexion: ' + error.message;
  }
};

const formatDistance = (meters) => {
  if (!meters) return '0';
  return Math.round(meters).toLocaleString();
};

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatPace = (secondsPer500m) => {
  if (!secondsPer500m) return '--';
  const mins = Math.floor(secondsPer500m / 60);
  const secs = Math.floor(secondsPer500m % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
</style>

