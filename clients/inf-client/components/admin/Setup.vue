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
  <div v-if="isDemoGenerated" class="d-flex alert alert-success" role="alert">
    {{ "Demo-Abstimmung wurde erfolgreich erstellt" }}
  </div>
  <ul class="mt-3">
    <li v-for="(option, index) in demoOptions" :key="index">
      {{ option.name }} ({{ option.key }}) - Stimmen: {{ option.votes }}
    </li>
  </ul>
  <h4> Wahl verwalten </h4>
  <input class="form-control mb-2" type="text" placeholder="Neue Wahloption eingeben" v-model="optionToAdd" />
  <div class="d-flex">
    <button @click="createOption" type="button" class="btn btn-primary me-3 mb-3" :disabled="isEmptyOptionInput">
      <i class="bi bi-plus-square me-2"></i> Hinzufügen
    </button>
    <div v-if="isOptionLoading" class="spinner-border text-primary" role="status">
    </div>
  </div>
  <div v-if="isOptionCreated" class="d-flex alert alert-success" role="alert">
    {{ "Wahloption wurde erfolgreich hinzugefügt" }}
  </div>
  <div v-if="isOptionNotCreated" class="d-flex alert alert-danger" role="alert">
    {{ "Wahloption konnte nicht hinzugefügt werden" }}
  </div>
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
const optionToAdd = ref<string | null>();
const isDemoLoading = ref<boolean>(false);
const isDemoGenerated = ref<boolean>(false);
const isOptionLoading = ref<boolean>(false);
const isOptionCreated = ref<boolean>(false);
const isOptionNotCreated = ref<boolean>(false);

const isEmptyOptionInput = computed(() => {
  return !optionToAdd.value
});

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
  isDemoGenerated.value = true
  setTimeout(() => {
    isDemoGenerated.value = false;
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

const createOption = async () => {
  isOptionLoading.value= true;
  const { status } = await useFetch('/api/create-option', {
    method: 'post',
    body: {
      user: userStore.userName,
      data: optionToAdd.value,
    }
  });
  isOptionLoading.value= false;

  if (status.value === "success") {
    isOptionCreated.value = true;
    setTimeout(() => {
      isOptionCreated.value = false;
    }, 3000);
    optionToAdd.value = null
  } else {
    isOptionNotCreated.value = true;
    setTimeout(() => {
      isOptionNotCreated.value = false;
    }, 3000);
    optionToAdd.value = null
  }
}

</script>

<style scoped></style>