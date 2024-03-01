import { defineStore } from 'pinia'
import { ref } from 'vue'
//import * as grpc from '@grpc/grpc-js'

export const useGrpcStore = defineStore('grpcStore', () => {
    const grpcConnection = ref();
    const isConnectionEstablished = ref<boolean>(false);
    return { grpcConnection, isConnectionEstablished }
})