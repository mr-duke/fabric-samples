<template>
    <div class="container">
        <div class="row">
            <h2>Voting-Page</h2>
        </div>
        <div class="mt-3">
            Selected: <strong>{{ userStore.userName }}</strong>
        </div>
        <button @click="castVote" type="button" class="btn btn-primary mt-3" :disabled="notAllowedToVote">
            <i class="bi bi-envelope-paper me-2"></i> Abstimmen
        </button>
        <button @click="router.back()" type="button" class="btn btn-primary mt-3">
            <i class="bi bi-box-arrow-left me-2"></i> Zurück
        </button>
        <div v-if="alreadyVotedMessage" class="text-danger">
            {{ alreadyVotedMessage }}
        </div>
        <h3>Bereits abgestimmt:</h3>
        <ul>
            <li v-for="(item, index) in userStore.alreadyVotedList" :key="index">
                {{ item }}
            </li>
        </ul>
    </div>
</template>
  
<script setup lang="ts">

const userStore = useUserStore(); 
const router = useRouter();

const alreadyVotedMessage = ref("");
const notAllowedToVote = computed(() => {
    if (userStore.alreadyVotedList.includes(userStore.userName)) {
        alreadyVotedMessage.value = "Sie haben bereits abgestimmt"
        return true
    // Admins should not be allowed to vote in the first place    
    } else if (userStore.userName === "Admin") {
        return true
    } else {
        alreadyVotedMessage.value = ""
        return false
    }
});
const castVote = () => {
    userStore.alreadyVotedList.push(userStore.userName);
}

</script>
  
<style scoped></style>
  