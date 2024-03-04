<template>
    <div>
        <h1>Hello from Admin Setup Component</h1>
    </div>
    <button @click="createDemo" type="button" class="btn btn-primary mt-3">
        <i class="bi bi-card-list me-2"></i> Erzeuge Demo
    </button>
    <button @click="getAllOptions" type="button" class="btn btn-primary mt-3">
        <i class="bi bi-card-list me-2"></i> Zeige alle Optionen
    </button>
    <ul>
      <!-- Iterate over each item in your array -->
      <li v-for="(option, index) in options" :key="index">
        <!-- Display properties of the item -->
        {{ option.name }} ({{ option.key  }}) - {{ option.votes }}
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

const options = ref<Option[]>();

const createDemo = async () => {
    await useFetch('/api/init-ledger',{
      method: 'post',
      body: { 
        user: userStore.userName 
      }
    });
    await getAllOptions();
};

const getAllOptions = async () => {
    const { data } = await useFetch('/api/get-all-options',{
      method: 'post',
      body: { 
        user: userStore.userName 
      }
    });
    options.value = data.value;
}

</script>
  
<style scoped>
</style>