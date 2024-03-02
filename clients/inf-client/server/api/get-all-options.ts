import type { Contract, Network } from '@hyperledger/fabric-gateway';

const utf8Decoder = new TextDecoder();
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');

export default defineEventHandler(async (event) => {
    const network: Network = await getNetwork();
    const contract: Contract = network.getContract(chaincodeName);
  
    console.log('\n--> Evaluate Transaction: getAllOptions function returns all the current options on the ledger');

    const resultBytes = await contract.evaluateTransaction('getAllOptions');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
    
    return result
})