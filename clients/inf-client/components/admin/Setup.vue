<template>
  <h3>Administration</h3>
  <h4> Demo </h4>
  <div class="d-flex">
    <button @click="createDemo" type="button" class="btn btn-primary me-3">
      <i class="bi bi-easel2 me-2"></i> Erzeuge Demo-Abstimmung
    </button>
    <div v-if="isDemoLoading" class="spinner-border text-primary" role="status">
    </div>
  </div>
  <div v-if="demoGenerated" class="d-flex alert alert-success" role="alert">
    {{ demoGenerated }}
  </div>
  <ul class="mt-3">
    <li v-for="(option, index) in demoOptions" :key="index">
      {{ option.name }} ({{ option.key }}) - Stimmen: {{ option.votes }}
    </li>
  </ul>
  <h4> Wahl verwalten </h4>
  <input class="form-control mb-2" type="text" placeholder="Neue Wahloption eingeben" v-model="optionToAdd" />
  <button @click="getAllOptions" type="button" class="btn btn-primary mb-3">
    <i class="bi bi-plus-square me-2"></i> Hinzufügen
  </button>
  <h4> Wahloptionen anzeigen </h4>
  <button @click="getAllOptions" type="button" class="btn btn-primary mb-3">
    <i class="bi bi-card-list me-2"></i> Zeige alle Optionen
  </button>
  <ul>
    <li v-for="(option, index) in existingOptions" :key="index">
      {{ option.name }} ({{ option.key }}) - {{ option.votes }}
    </li>
  </ul>
</template>

<script setup lang="ts">

interface Option {
  name: string;
  key: string
  votes: number;
}

const userStore = useUserStore();

const existingOptions = ref<Option[]>();
const demoOptions = ref<Option[]>();
const optionToAdd = ref<string>();
const isDemoLoading = ref<boolean>(false);
const demoGenerated = ref<string | null>();

const createDemo = async () => {
  isDemoLoading.value = true;
  await useFetch('/api/init-ledger', {
    method: 'post',
    body: {
      user: userStore.userName
    }
  });

  await getDemoOptions();

  isDemoLoading.value = false;
  demoGenerated.value = "Demo-Abstimmung erfolgreich erstellt"
  setTimeout(() => {
    demoGenerated.value = null;
  }, 2000);
}

const getDemoOptions = async () => {
  const { data } = await useFetch('/api/get-all-options', {
    method: 'post',
    body: {
      user: userStore.userName
    }
  });
  demoOptions.value = data.value;
}

const getAllOptions = async () => {
  const { data } = await useFetch('/api/get-all-options', {
    method: 'post',
    body: {
      user: userStore.userName
    }
  });
  existingOptions.value = data.value;
}

</script>

<style scoped></style>