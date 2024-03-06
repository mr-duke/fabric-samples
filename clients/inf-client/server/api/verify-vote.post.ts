import type { Contract, Network } from '@hyperledger/fabric-gateway';
import { common, peer } from '@hyperledger/fabric-protos';
import { newTransaction, parsePayload } from '../utils/block-parser';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { TransactionDetail } from '../utils/transaction-detail';

const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'qscc');
const chaincodeFunction = 'GetTransactionByID';
const utf8Decoder = new TextDecoder();

let transactionDetail: TransactionDetail; 

export default defineEventHandler(async (event) => {
    const body = await readBody(event);
    const gateway = await getGateway(body.user);
    const network: Network = gateway.getNetwork(channelName);
    const contract: Contract = network.getContract(chaincodeName);
  
    console.log('\n--> Evaluate Transaction: getTransactionByKey function returns the transaction details for a given key');
    let resultBytes;
    try {
        resultBytes = await contract.evaluateTransaction(chaincodeFunction, channelName, body.transactionId);
    } catch (error) {
        console.log('*** No data');
        return null;
    };
    const processedTransaction = peer.ProcessedTransaction.deserializeBinary(resultBytes);
    const validationCode = processedTransaction.getValidationcode();
    if (validationCode === 0) {
        const payloadBytes = processedTransaction.getTransactionenvelope()!.getPayload_asU8();
        const payload = common.Payload.deserializeBinary(payloadBytes);
        const parsedPayload = parsePayload(payload,validationCode);
        const transaction = newTransaction(parsedPayload);
        const timestamp = transaction.getChannelHeader().getTimestamp()!;
        
        transactionDetail = {
            isValid: transaction.isValid(),
            validationCode: transaction.getValidationCode(),
            timestamp: convertTimestampToCET(timestamp),
            org: transaction.getCreator().mspId,
            creator: utf8Decoder.decode(transaction.getCreator().credentials),
            txID: transaction.getChannelHeader().getTxId(),
        }
        console.log('*** Result', transactionDetail);
    } else {
        console.log('*** Transaction not successful');
    }
    
    gateway.close();
    return transactionDetail;
})

/**
 * Coverts Unix Epoch timestamp to CET (Central European Time)
 */
function convertTimestampToCET(timestamp: Timestamp): string {
    // Convert seconds and nanoseconds to milliseconds
    const milliseconds = timestamp.getSeconds() * 1000 + Math.floor(timestamp.getNanos() / 1e6);
    const date = new Date(milliseconds);    
    // Convert to CET (Central European Time)
    const options: Intl.DateTimeFormatOptions = { timeZone: 'Europe/Berlin', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',  weekday: 'long'};
    return date.toLocaleString('de-DE', options);
}