<template>
    <h4 class="mt-3"> Verifikation </h4>

    <div class="col-7">
        <input class="col-7 form-control mb-3" type="text" placeholder="Transaktions-ID eingeben"
            v-model="txIdToSearch" />
    </div>
    <div class="d-flex">
        <button @click="verifyVote" type="button" class="btn btn-primary me-3 mb-3" :disabled="isEmptyTransactionInput">
            <i class="bi bi-file-earmark-check me-2"></i> Stimme verifizieren
        </button>
        <div v-if="isVerificationLoading" class="spinner-border text-primary" role="status">
        </div>
    </div>
    <div v-if="isVerificationSuccess" class="card col-7">
        <i class="card-img-top text-center text-success display-4 bi bi-check-circle"></i>
        <div class="card-body">
            <h5 class="card-title text-success text-center fw-bold">Verifikation erfolgreich</h5>
            <p class="card-text text-center">{{ verificationMessage }}</p>
        </div>
        <ul class="list-group list-group-flush">
            <li class="list-group-item"> <strong>Zeit:</strong> {{ voteVerification?.timestamp }}</li>
            <li class="list-group-item"> <strong>Transaktions-ID:</strong> {{ voteVerification?.txID }}</li>
        </ul>
    </div>
    <div v-if="isVerificationNotSuccess" class="card col-7">
        <i class="card-img-top text-center text-danger display-4 bi bi-x-circle"></i>
        <div class="card-body">
            <h5 class="card-title text-danger text-center fw-bold">Verifikation fehlgeschlagen</h5>
            <p class="card-text text-center">{{ verificationMessage }}</p>
        </div>
    </div>

</template>

<script setup lang="ts">

interface VoteVerification {
    isValid: boolean;
    timestamp: string;
    txID: string;
}

const userStore = useUserStore();

const txIdToSearch = ref<string | null>();
const isVerificationLoading = ref<boolean>(false);
const isVerificationSuccess = ref<boolean>(false);
const isVerificationNotSuccess = ref<boolean>(false);
const verificationMessage = ref<string>();
const voteVerification = ref<VoteVerification>();

const isEmptyTransactionInput = computed(() => {
    return !txIdToSearch.value;
})

const verifyVote = async () => {
    // Reset old response messages first 
    isVerificationSuccess.value = false;
    isVerificationNotSuccess.value = false;

    isVerificationLoading.value = true;
    const { data } = await useFetch('/api/verify-vote', {
        method: 'post',
        body: {
            user: userStore.userName,
            transactionId: txIdToSearch.value,
        }
    });
    isVerificationLoading.value = false;

    if (data.value != null) {
        if (data.value.isValid) {
            isVerificationSuccess.value = true;
            verificationMessage.value = "Ihre Stimme ist gültig auf der Blockchain gespeichert";
            voteVerification.value = data.value;
        } else {
            isVerificationNotSuccess.value = true;
            verificationMessage.value = "Ihre Stimmabgabe war nicht erfolgreich";
        }
    } else {
        isVerificationNotSuccess.value = true;
        verificationMessage.value = "Die Transaktions-ID ist ungültig";
    }
    txIdToSearch.value = null;
}

</script>

<style scoped></style>