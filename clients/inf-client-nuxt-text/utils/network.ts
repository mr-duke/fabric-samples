import type { Network } from '@hyperledger/fabric-gateway';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');

// Get a network instance representing the channel where the smart contract is deployed.
export async function getNetwork(): Promise<Network> {
    const gateway = await getGateway();
    const network = gateway.getNetwork(channelName);

    return network;
}