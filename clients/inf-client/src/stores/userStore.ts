import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUserStore = defineStore('user', () => {
    const userName = ref<string>('');
    const alreadyVotedList = ref<string[]>([]);
 
    return { userName, alreadyVotedList }
  })