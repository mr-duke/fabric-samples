import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useGatewayStore = defineStore('gateway', () => {
    const gateway = ref();
 
    return { gateway }
  })