import type { Contract, Network } from '@hyperledger/fabric-gateway';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');
const chaincodeFunction = 'castVote';
const utf8Decoder = new TextDecoder();

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const gateway = await getGateway(body.user);
    const network: Network = gateway.getNetwork(channelName);
    const contract: Contract = network.getContract(chaincodeName);

    console.log('\n--> Submit Transaction: castVote, function cast a vote for a specified option, increasing its vote count by 1');
    const txIdBytes = await contract.submitTransaction(chaincodeFunction, body.key);
    const txId = utf8Decoder.decode(txIdBytes);
    console.log(`*** Transaction committed successfully. TxID: ${txId}`);
    
    gateway.close();
    return txId;
})