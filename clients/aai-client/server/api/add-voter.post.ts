import type { Contract, Gateway, Network } from '@hyperledger/fabric-gateway';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');
const chaincodeFunction = 'addToVoters';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const gateway: Gateway = await getGateway(body.user);
    const network: Network = gateway.getNetwork(channelName);
    const contract: Contract = network.getContract(chaincodeName);

    console.log('\n--> Submit Transaction addToVoters; add voter to list of voters who already cast their votes');
    await contract.submitTransaction(chaincodeFunction, body.user);
    console.log('*** Transaction committed successfully.');
    
    gateway.close();
})