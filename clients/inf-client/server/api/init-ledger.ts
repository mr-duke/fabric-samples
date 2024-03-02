import type { Contract, Network } from '@hyperledger/fabric-gateway';

const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');

export default defineEventHandler(async (event) => {
    const network: Network = await getNetwork();
    const contract: Contract = network.getContract(chaincodeName);
  
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of voting options on the ledger');
    await contract.submitTransaction('initLedger');
    console.log('*** Transaction committed successfully');
    
    return "Init erfolgreich"
})