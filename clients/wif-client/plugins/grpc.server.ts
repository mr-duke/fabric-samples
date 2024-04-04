import { getGrpcClient } from "@/server/utils/grpc-client";

export default defineNuxtPlugin(async nuxtApp => {
    await getGrpcClient();
    console.log("gRPC Client created")
  })