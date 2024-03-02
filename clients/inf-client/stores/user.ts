import { defineStore } from 'pinia';

export const useUserStore = defineStore('userStore', () => {
    const userName = ref<string>('');
    const alreadyVotedList = ref<string[]>([]);
 
    return { userName, alreadyVotedList }
})