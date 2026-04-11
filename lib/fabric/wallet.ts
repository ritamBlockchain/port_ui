// lib/fabric/wallet.ts
import { Wallets, X509Identity } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

export async function buildWallet() {
  const wallet = await Wallets.newInMemoryWallet();

  const certPath = process.env.ADMIN_CERT_PATH!;
  let keyPath  = process.env.ADMIN_KEY_PATH!;

  // Auto-discover key file if the exact path doesn't exist
  // Fabric CA generates keystore files with random hash names
  if (keyPath && !fs.existsSync(keyPath)) {
    const keystoreDir = path.dirname(keyPath);
    if (fs.existsSync(keystoreDir)) {
      const files = fs.readdirSync(keystoreDir).filter(f => f.endsWith('_sk'));
      if (files.length > 0) {
        keyPath = path.join(keystoreDir, files[0]);
        console.log(`Auto-discovered keystore file: ${files[0]}`);
      }
    }
  }

  if (!certPath || !keyPath || !fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('FABRIC WALLET ERROR: Certificate or key file not found.');
    console.error(`  CERT: ${certPath} -> ${certPath ? fs.existsSync(certPath) : 'NOT SET'}`);
    console.error(`  KEY:  ${keyPath} -> ${keyPath ? fs.existsSync(keyPath) : 'NOT SET'}`);
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
  const ccpPath = process.env.CONNECTION_PROFILE_PATH!;
  if (!ccpPath || !fs.existsSync(ccpPath)) {
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
  console.log('✅ Connection profile loaded');
  return JSON.parse(contents);
}
