<template>
    <div>
        <AdminSetup />
        <AdminAssetHistory />
    </div>
    <button @click="router.back()" type="button" class="btn btn-primary mt-3">
        <i class="bi bi-box-arrow-left me-2"></i> Zurück
    </button>
</template>

<script setup lang="ts">
const router = useRouter();

</script>

<style scoped></style>