/** 
 * Create a Fabric Gateway instance
 * Use Singleton pattern to ensure only one Gateway per user will be created 
 */ 
import { connect, signers } from '@hyperledger/fabric-gateway';
import type { Contract, Identity, Signer, Gateway } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import { promises as fs } from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
//import { useUserStore } from '~/stores/user';

const mspId = envOrDefault('MSP_ID', 'Org1MSP');
//const userStore = useUserStore();
// Path to crypto materials.
const cryptoPath = envOrDefault('CRYPTO_PATH', path.resolve(__dirname, '..', '..', '..', '..', 'test-network', 'organizations', 'peerOrganizations', 'org1.example.com'));
// Path to user private key directory.
const keyDirectoryPath = envOrDefault('KEY_DIRECTORY_PATH', path.resolve(cryptoPath, 'users', 'Inf-User1@org1.example.com', 'msp', 'keystore'));
// Path to user certificate.
const certPath = envOrDefault('CERT_PATH', path.resolve(cryptoPath, 'users', 'Inf-User1@org1.example.com', 'msp', 'signcerts', 'cert.pem'));

let gatewayInstance: Gateway | null = null;

export async function getGateway(): Promise <Gateway> {
    if (!gatewayInstance) {
        gatewayInstance = await createGateway();
    }
    return gatewayInstance;
}

export function resetGateway() {
    gatewayInstance = null;
}

async function createGateway(): Promise<Gateway> {
    const gateway = connect({
        // The gRPC client connection should be shared by all Gateway connections to this endpoint.
        client: await getGrpcClient(),
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
    return gateway;    
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