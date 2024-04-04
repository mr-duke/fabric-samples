<template>
    <div>
        <div class="row">
            <div>
                <img src="/Logo-INF-E-Voting.png" class="rounded float-start mt-3" alt="Logo INF E-Voting">
            </div>
            <div class="col-4 form-group mt-3">
                <label for="userSelect">Wählen Sie Ihren Benutzer aus:</label>
                <select class="form-select" v-model="selectedUser" id="userSelect">
                    <option value="Admin">WIF-Admin</option>
                    <option value="Wif-User1">WIF-User 1</option>
                    <option value="Wif-User2">WIF-User 2</option>
                    <option value="Wif-User3">WIF-User 3</option>
                    <option value="Wif-User4">WIF-User 4</option>
                    <option value="Wif-User5">WIF-User 5</option>
                </select>
            </div>
        </div>
        <button v-if="selectedUser" @click="login" type="button" class="btn btn-primary mt-3">
            <i class="bi bi-box-arrow-in-right me-2"></i> Anmelden
        </button>
    </div>
</template>

<script setup lang="ts">
const selectedUser = ref<string>("");
const router = useRouter();

onMounted(async () => {
    localStorage.removeItem('userName');
});

const login = () => {
    localStorage.setItem('userName', selectedUser.value);
    if (selectedUser.value === "Admin") {
        router.push('/admin')
    } else {
        router.push('/user')
    }
}

</script>
  