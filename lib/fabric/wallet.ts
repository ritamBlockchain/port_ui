// lib/fabric/wallet.ts
import { Wallets, X509Identity } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

export async function buildWallet() {
  const wallet = await Wallets.newInMemoryWallet();

  // Use environment variables or fallback to old hardcoded ones for safety
  const certPath = process.env.ADMIN_CERT_PATH || '/Users/ritambiswas/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem';
  let keyPath = process.env.ADMIN_KEY_PATH || '';
  
  const mspDir = path.dirname(path.dirname(certPath)); // .../msp
  const keystoreDir = path.join(mspDir, 'keystore');

  // If keyPath is not provided or doesn't exist, try to discover it in the keystore dir
  if (!keyPath || !fs.existsSync(keyPath)) {
    if (fs.existsSync(keystoreDir)) {
      const files = fs.readdirSync(keystoreDir).filter(f => !f.startsWith('.'));
      if (files.length > 0) {
        keyPath = path.join(keystoreDir, files[0]);
        console.log(`Auto-discovered keystore file: ${path.basename(keyPath)}`);
      }
    }
  }

  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('FABRIC WALLET ERROR: Certificate or key file not found.');
    console.error(`  CERT: ${certPath} -> ${fs.existsSync(certPath)}`);
    console.error(`  KEY:  ${keyPath} -> ${fs.existsSync(keyPath)}`);
    return wallet;
  }

  const certificate = fs.readFileSync(certPath).toString();
  const privateKey  = fs.readFileSync(keyPath).toString();

  const identity: X509Identity = {
    credentials: { certificate, privateKey },
    mspId: process.env.FABRIC_ORG || 'Org1MSP',
    type: 'X.509',
  };

  await wallet.put('admin', identity);
  console.log('✅ Fabric wallet loaded with admin identity');
  return wallet;
}

export function buildCCPOrg1() {
  const ccpPath = process.env.CONNECTION_PROFILE_PATH || '/Users/ritambiswas/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
  
  if (!fs.existsSync(ccpPath)) {
    console.error(`Connection profile not found at: ${ccpPath}`);
    return {
      name: 'test-network',
      version: '1.0.0',
      client: { organization: 'Org1' },
      organizations: { Org1: { mspid: 'Org1MSP', peers: ['peer0.org1.example.com'] } },
      peers: { 'peer0.org1.example.com': { url: 'grpcs://localhost:7051' } }
    };
  }
  const contents = fs.readFileSync(ccpPath, 'utf8');
  console.log('✅ Connection profile loaded from', ccpPath);
  return JSON.parse(contents);
}

