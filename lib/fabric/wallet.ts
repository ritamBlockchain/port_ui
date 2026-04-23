// lib/fabric/wallet.ts
import { Wallets, X509Identity } from 'fabric-network';
import * as fs from 'fs';
import * as path from 'path';

export async function buildWallet() {
  const wallet = await Wallets.newInMemoryWallet();

  // Hardcoded paths to fabric-samples
  const certPath = '/Users/ritambiswas/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/signcerts/Admin@org1.example.com-cert.pem';
  const keystoreDir = '/Users/ritambiswas/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp/keystore';
  let keyPath = path.join(keystoreDir, '9641b4306e80407be6a4bd8737d64396f519492a21ce3343db539e551929ead8_sk');

  // Auto-discover key file if the exact path doesn't exist
  if (!fs.existsSync(keyPath) && fs.existsSync(keystoreDir)) {
    const files = fs.readdirSync(keystoreDir).filter(f => f.endsWith('_sk'));
    if (files.length > 0) {
      keyPath = path.join(keystoreDir, files[0]);
      console.log(`Auto-discovered keystore file: ${files[0]}`);
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
    mspId: 'Org1MSP',
    type: 'X.509',
  };

  await wallet.put('admin', identity);
  console.log('✅ Fabric wallet loaded with admin identity');
  return wallet;
}

export function buildCCPOrg1() {
  // Hardcoded path to fabric-samples
  const ccpPath = '/Users/ritambiswas/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
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
  console.log('✅ Connection profile loaded');
  return JSON.parse(contents);
}
