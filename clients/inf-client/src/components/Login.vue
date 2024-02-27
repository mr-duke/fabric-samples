<template>
    <div class="container">
        <div class="row mt-3">
            <div class="col form-group">
                <label for="userSelect">Wählen Sie Ihren Benutzer aus:</label>
                <select class="form-select" v-model="selectedUser" id="userSelect">
                    <option value="Admin">INF-Admin</option>
                    <option value="Inf-User1">INF-User 1</option>
                    <option value="Inf-User2">INF-User 2</option>
                    <option value="Inf-User3">INF-User 3</option>
                    <option value="Inf-User4">INF-User 4</option>
                    <option value="Inf-User5">INF-User 5</option>
                </select>
            </div>
            <div class="col">
            </div>
            <div class="col">
            </div>
        </div>
        <button @click="connectToGateway" type="button" class="btn btn-primary mt-3">
            <i class="bi bi-box-arrow-in-right me-2"></i> Anmelden
        </button>
        <div class="mt-3">
            Selected: <strong>{{ userStore.userName }}</strong>
        </div>
    </div>
</template>
  
<script setup lang="ts">
import { ref } from 'vue'
import { useUserStore } from '@/stores/userStore';
import { useGatewayStore } from '@/stores/gatewayStore';
import { establishGatewayConnection } from '@/utils/gatewayConnection';
import { useRouter } from 'vue-router';

const userStore = useUserStore();
const gatewayStore = useGatewayStore();
const router = useRouter();

const selectedUser = ref();

const connectToGateway = async () => {
    userStore.userName = selectedUser.value;
    //gatewayStore.gateway = await establishGatewayConnection();
    router.push('/voting')
}

</script>
  
<style scoped></style>
  