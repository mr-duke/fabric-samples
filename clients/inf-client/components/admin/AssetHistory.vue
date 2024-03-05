<template>
    <h4>Asset-Verlauf</h4>
    <div class="col-7" >
    <input class="col-7 form-control mb-3" type="text" placeholder="Gesuchten Key eingeben" v-model="keyToSearch" />
</div>
    <div class="d-flex">
        <button @click="getHistoryForKey" type="button" class="btn btn-primary me-3 mb-3" :disabled="isEmptyKeyInput">
            <i class="bi bi-plus-square me-2"></i> Verlauf anzeigen
        </button>
        <div v-if="isHistoryLoading" class="spinner-border text-primary" role="status">
        </div>
    </div>
    <div v-if="isHistoryCreated" class="d-flex alert alert-success col-7" role="alert">
        {{ "Verlauf wurde erfolgreich hergestellt" }}
    </div>
    <div v-if="isHistoryNotCreated" class="d-flex alert alert-danger col-7" role="alert">
        {{ "Verlauf konnte nicht hergestellt werden" }}
    </div>
    <div class="col-7 card mb-3" v-for="(record, index) in historyRecords" :key="index">
        <div class="card-header">
            <strong>{{ record.timestamp }}</strong>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item"> Name: <strong>{{ record.name }}</strong> </li>
            <li class="list-group-item"> Key: {{ record.key }}</li>
            <li class="list-group-item">Stimmen: {{ record.votes }}</li>
            <li class="list-group-item ">Transaktions-ID: {{ record.txId }}</li>
        </ul>
    </div>
</template>

<script setup lang="ts">

interface HistoryRecord {
    name: string;
    key: string;
    votes: any;
    timestamp: string;
    txId: string;
}

const userStore = useUserStore();
const keyToSearch = ref<string | null>();
const isHistoryLoading = ref<boolean>(false);
const isHistoryCreated = ref<boolean>(false);
const isHistoryNotCreated = ref<boolean>(false);
const historyRecords = ref<HistoryRecord[]>();

const isEmptyKeyInput = computed(() => {
    return !keyToSearch.value
});

const getHistoryForKey = async () => {
    isHistoryLoading.value = true;
    const { data, status } = await useFetch('/api/get-asset-history', {
        method: 'post',
        body: {
            user: userStore.userName,
            key: keyToSearch.value,
        }
    });
    isHistoryLoading.value = false;

    if (data.value.length !== 0 ) {
        isHistoryCreated.value = true;
        setTimeout(() => {
            isHistoryCreated.value = false;
        }, 2500);
        historyRecords.value = data.value;
        keyToSearch.value = null
    } else {
        isHistoryNotCreated.value = true;
        setTimeout(() => {
            isHistoryNotCreated.value = false;
        }, 2500);
        keyToSearch.value = null
    }
}
</script>

<style scoped></style>