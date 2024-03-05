import type { Contract, Network } from '@hyperledger/fabric-gateway';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');
const chaincodeFunction = 'deleteAllOptions';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const gateway = await getGateway(body.user);
    const network: Network = gateway.getNetwork(channelName);
    const contract: Contract = network.getContract(chaincodeName);

    console.log('\n--> Submit Transaction: deleteAllOptions, function deletes all voting options on the ledger');
    await contract.submitTransaction(chaincodeFunction);
    console.log('*** Transaction committed successfully');
    
    gateway.close();
})