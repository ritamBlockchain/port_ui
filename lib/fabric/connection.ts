// lib/fabric/connection.ts
import { Gateway, GatewayOptions, Network, Contract } from 'fabric-network';
import { buildWallet, buildCCPOrg1 } from './wallet';

let gateway: Gateway | null = null;
let network: Network | null = null;
let contract: Contract | null = null;

export async function getContract(): Promise<Contract> {
  if (contract) return contract;

  try {
    const ccp = buildCCPOrg1();
    const wallet = await buildWallet();

    gateway = new Gateway();
    const gatewayOpts: GatewayOptions = {
      wallet,
      identity: process.env.FABRIC_IDENTITY || 'admin',
      discovery: { enabled: true, asLocalhost: true },
    };

    await gateway.connect(ccp, gatewayOpts);
    network = await gateway.getNetwork(process.env.FABRIC_CHANNEL || 'mychannel');
    contract = network.getContract(process.env.FABRIC_CHAINCODE || 'portchain');
    console.log('✅ Fabric Gateway connected successfully');
    return contract;
  } catch (err) {
    // Reset cached state so next call retries fresh
    gateway = null;
    network = null;
    contract = null;
    throw err;
  }
}

export async function evaluateTransaction(
  funcName: string,
  ...args: string[]
): Promise<Buffer> {
  const c = await getContract();
  console.log(`[Fabric] Evaluating ${funcName} with ${args.length} args:`, args);
  return c.evaluateTransaction(funcName, ...args);
}

export async function submitTransaction(
  funcName: string,
  ...args: string[]
): Promise<Buffer> {
  const c = await getContract();
  console.log(`[Fabric] Submitting ${funcName} with ${args.length} args:`, args);
  return c.submitTransaction(funcName, ...args);
}

/** submitTransactionWithTxId uses createTransaction to capture the real Fabric txId */
export async function submitTransactionWithTxId(
  funcName: string,
  ...args: string[]
): Promise<{ result: Buffer; txId: string }> {
  const c = await getContract();
  console.log(`[Fabric] Submitting ${funcName} with ${args.length} args:`, args);
  const tx = c.createTransaction(funcName);
  const txId = tx.getTransactionId();
  const result = await tx.submit(...args);
  return { result, txId };
}

export async function disconnect(): Promise<void> {
  if (gateway) {
    gateway.disconnect();
    gateway = null;
    network = null;
    contract = null;
  }
}
