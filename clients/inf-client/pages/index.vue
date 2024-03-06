<template>
    <div>
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
        <button v-if="selectedUser" @click="login" type="button" class="btn btn-primary mt-3">
            <i class="bi bi-box-arrow-in-right me-2"></i> Anmelden
        </button>
    </div>
</template>

<script setup lang="ts">
const selectedUser = ref();
const userStore = useUserStore();
const router = useRouter();

const login = () => {
    userStore.userName = selectedUser.value;
    if (userStore.userName === "Admin") {
        router.push('/admin')
    } else {
        router.push('/user')
    }
}

</script>
  