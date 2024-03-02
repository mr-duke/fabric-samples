export default defineNuxtPlugin(async nuxtApp => {
    await getGrpcClient();
    console.log("gRPC Client created")
  })