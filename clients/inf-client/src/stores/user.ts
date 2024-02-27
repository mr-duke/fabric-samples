import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const userName = ref('');
    const alreadyVotedList = ref<string[]>([]);
 
    return { userName, alreadyVotedList }
  })