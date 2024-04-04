<template>
    <div class="card col-7 mt-3">
        <div class="card-header fw-bold">
            Exkursion
        </div>
        <div class="card-body">
            <p class="card-text">Bitte stimmen Sie über das Ziel der nächsten Exkursion ab. <br/> Sie haben <strong>1 Stimme</strong>.</p>
        </div>
    </div>
    <div>
        <UserVoting />
        <UserVoteVerification />
    </div>
    <button @click="router.back()" type="button" class="btn btn-primary mt-3">
        <i class="bi bi-box-arrow-left me-2"></i> Zurück
    </button>

</template>

<script setup lang="ts">
const router = useRouter();

</script>

<style scoped></style>