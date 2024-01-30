/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

import * as grpc from '@grpc/grpc-js';
import { connect, Contract, Identity, Signer, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { TextDecoder } from 'util';
import { ProcessedTransaction } from '@hyperledger/fabric-protos/lib/peer';
import { Payload } from '@hyperledger/fabric-protos/lib/common';
import { newTransaction, parsePayload } from './blockParser';
import { Timestamp } from 'google-protobuf/google/protobuf/timestamp_pb';
import { TransactionDetail } from './transactionDetail';


const channelName = envOrDefault('CHANNEL_NAME', 'evoting-channel');
const chaincodeName = envOrDefault('CHAINCODE_NAME', 'evoting-chaincode');
const mspId = envOrDefault('MSP_ID', 'Org1MSP');

// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'Inf-User1@org1.example.com', 'msp', 'keystore'));

// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'Inf-User1@org1.example.com', 'msp', 'signcerts', 'cert.pem'));

// Path to peer tls certificate.
const tlsCertPath = envOrDefault('TLS_CERT_PATH', path.resolve(cryptoPath, 'peers', 'peer0.org1.example.com', 'tls', 'ca.crt'));

// Gateway peer endpoint.
const peerEndpoint = envOrDefault('PEER_ENDPOINT', 'localhost:7051');

// Gateway peer SSL host name override.
const peerHostAlias = envOrDefault('PEER_HOST_ALIAS', 'peer0.org1.example.com');

const utf8Decoder = new TextDecoder();
//const assetId = `asset${Date.now()}`;

async function main(): Promise<void> {

    await displayInputParameters();

    // The gRPC client connection should be shared by all Gateway connections to this endpoint.
    const client = await newGrpcConnection();

    const gateway = connect({
        client,
        identity: await newIdentity(),
        signer: await newSigner(),
        // Default timeouts for different gRPC calls
        evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
        },
        submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
        },
        commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
        },
    });

    try {
        // Get a network instance representing the channel where the smart contract is deployed.
        const network = gateway.getNetwork(channelName);

        // Get the smart contract from the network.
        const contract = network.getContract(chaincodeName);

        // Initialize a set of asset data on the ledger using the chaincode 'InitLedger' function.
      /*  await initLedger(contract);

        // Return all the current options on the ledger.
        await getAllOptions(contract);

        // Create a new asset on the ledger.
        await createOption(contract, 'New York');

        // Get the asset details by assetID.
        await getOptionByKey(contract, 'New   York');

        // Update an asset which does not exist.
        //await updateNonExistentAsset(contract)

        // Cast a vote for a specified option
        await castVote(contract, 'New York');

        // Cast another vote for a specified option
        await castVote(contract, 'New York');

        // Delete an option
        await deleteOption(contract, 'New York');
        
        // Get the history of an option
        await getHistoryForKey(contract, 'New York');

        // Delete all options
        await deleteAllOptions(contract);

        // Check if all options on the world state have been deleted.
        await getAllOptions(contract);
*/
        // Get transaction details from Blockchain for a given Transaction ID 
        await getTransactionById(network.getContract('qscc'), channelName, '5623b79cd0e928f3301c457ff518381c84092d398df36962a29dac6f5061db4f' )

    } finally {
        gateway.close();
        client.close();
    }
}

main().catch(error => {
    console.error('******** FAILED to run the application:', error);
    process.exitCode = 1;
});

async function newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(peerEndpoint, tlsCredentials, {
        'grpc.ssl_target_name_override': peerHostAlias,
    });
}

async function newIdentity(): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}

/**
 * This type of transaction would typically only be run once by an application the first time it was started after its
 * initial deployment. A new version of the chaincode deployed later would likely not need to run an "init" function.
 */
async function initLedger(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: InitLedger, function creates the initial set of voting options on the ledger');

    await contract.submitTransaction('initLedger');

    console.log('*** Transaction committed successfully');
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function createOption(contract: Contract, name: string): Promise<void> {
    console.log('\n--> Submit Transaction: createOption, creates new option with and name argument');

    await contract.submitTransaction('createOption', name);

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getAllOptions(contract: Contract): Promise<void> {
    console.log('\n--> Evaluate Transaction: getAllOptions function returns all the current options on the ledger');

    const resultBytes = await contract.evaluateTransaction('getAllOptions');
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getOptionByKey(contract: Contract, key: string): Promise<void> {
    console.log('\n--> Evaluate Transaction: getOption, function returns option attributes');

    const resultBytes = await contract.evaluateTransaction('getOption', key);

    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function castVote(contract: Contract, key: string): Promise<void> {
    console.log('\n--> Submit Transaction: castVote, function cast a vote for a specified option, increasing its vote count by 1');

    const txIdBytes = await contract.submitTransaction('castVote', key);
    const txId = utf8Decoder.decode(txIdBytes);

    console.log(`*** Transaction committed successfully. TxID: ${txId}`);
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function deleteOption(contract: Contract, key: string): Promise<void> {
    console.log('\n--> Submit Transaction: deleteOption, function deletes a voting options on the ledger');

    await contract.submitTransaction('deleteOption', key);

    console.log('*** Transaction committed successfully');
}

/**
 * Submit a transaction synchronously, blocking until it has been committed to the ledger.
 */
async function deleteAllOptions(contract: Contract): Promise<void> {
    console.log('\n--> Submit Transaction: deleteAllOptions, function deletes all voting options on the ledger');

    await contract.submitTransaction('deleteAllOptions');

    console.log('*** Transaction committed successfully');
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getHistoryForKey(contract: Contract, key: string): Promise<void> {
    console.log('\n--> Evaluate Transaction: getHistoryForKey function returns the completes history for a given key');

    const resultBytes = await contract.evaluateTransaction('getHistoryForKey', key);
    const resultJson = utf8Decoder.decode(resultBytes);
    const result = JSON.parse(resultJson);
    console.log('*** Result:', result);
}

/**
 * Evaluate a transaction to query ledger state.
 */
async function getTransactionById(contract: Contract, channelName: string, txId: string): Promise<TransactionDetail | {}> {
    console.log('\n--> Evaluate Transaction: getTransactionByKey function returns the transaction details for a given key');
    let resultBytes;
    try {
        resultBytes = await contract.evaluateTransaction('GetTransactionByID', channelName, txId);
    } catch (error) {
        console.log('*** No data');
        return {}
    };
    const processedTransaction = ProcessedTransaction.deserializeBinary(resultBytes);
    const validationCode = processedTransaction.getValidationcode();
    if (validationCode === 0) {
        const payloadBytes = processedTransaction.getTransactionenvelope()!.getPayload_asU8();
        const payload = Payload.deserializeBinary(payloadBytes);
        const parsedPayload = parsePayload(payload,validationCode);
        const transaction = newTransaction(parsedPayload);
        const timestamp = transaction.getChannelHeader().getTimestamp()!;
        
        const transactionDetail: TransactionDetail = {
            isValid: transaction.isValid(),
            validationCode: transaction.getValidationCode(),
            timestamp: convertTimestampToCET(timestamp),
            creator: utf8Decoder.decode(transaction.getCreator().credentials),
            txID: transaction.getChannelHeader().getTxId(),
        }
        console.log('*** Result', transactionDetail);
        return transactionDetail;
    } else {
        console.log('*** Transaction not successful');
        return {};
    }
}

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

/**
 * envOrDefault() will return the value of an environment variable, or a default value if the variable is undefined.
 */
function envOrDefault(key: string, defaultValue: string): string {
    return process.env[key] || defaultValue;
}

/**
 * displayInputParameters() will print the global scope parameters used by the main driver routine.
 */
async function displayInputParameters(): Promise<void> {
    console.log(`channelName:       ${channelName}`);
    console.log(`chaincodeName:     ${chaincodeName}`);
    console.log(`mspId:             ${mspId}`);
    console.log(`cryptoPath:        ${cryptoPath}`);
    console.log(`keyDirectoryPath:  ${keyDirectoryPath}`);
    console.log(`certPath:          ${certPath}`);
    console.log(`tlsCertPath:       ${tlsCertPath}`);
    console.log(`peerEndpoint:      ${peerEndpoint}`);
    console.log(`peerHostAlias:     ${peerHostAlias}`);
}