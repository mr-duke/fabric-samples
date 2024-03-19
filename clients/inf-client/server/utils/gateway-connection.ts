/** 
 * Create a Fabric Gateway instance
 * Use Singleton pattern to ensure only one Gateway per user will be created 
 */ 
import { connect, signers } from '@hyperledger/fabric-gateway';
import type { Identity, Signer, Gateway } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';

export async function getGateway(user: string): Promise <Gateway> {

    const mspId = envOrDefault('MSP_ID', 'Org1MSP');
    // Path to crypto materials.
    const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve('test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));

    // Path to user private key directory.
    const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', `${user}@org1.example.com`, 'msp', 'keystore'));
    // Path to user certificate.
    const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', `${user}@org1.example.com`, 'msp', 'signcerts', 'cert.pem'));
    
    console.log("keyDirectoryPath:" + keyDirectoryPath);
    console.log("certPath:" + certPath);

    const gateway = connect({
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        client: await getGrpcClient(),
        identity: await newIdentity(certPath, mspId),
        signer: await newSigner(keyDirectoryPath),
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
    return gateway;  
}

async function newIdentity(certPath: string, mspId: string): Promise<Identity> {
    const credentials = await fs.readFile(certPath);
    return { mspId, credentials };
}

async function newSigner(keyDirectoryPath: string): Promise<Signer> {
    const files = await fs.readdir(keyDirectoryPath);
    const keyPath = path.resolve(keyDirectoryPath, files[0]);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
}