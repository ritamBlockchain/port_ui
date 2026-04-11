import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    const pingResult = await evaluateTransaction('Ping');
    const pingMsg = pingResult.toString();

    return NextResponse.json({
      success: true,
      data: {
        ping: pingMsg,
        gateway: 'Connected',
        channel: process.env.FABRIC_CHANNEL || 'mychannel',
        chaincode: process.env.FABRIC_CHAINCODE || 'portchain',
        org: process.env.FABRIC_ORG || 'Org1MSP',
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      data: {
        ping: 'Unreachable',
        gateway: 'Disconnected',
        channel: process.env.FABRIC_CHANNEL || 'mychannel',
        chaincode: process.env.FABRIC_CHAINCODE || 'portchain',
        org: process.env.FABRIC_ORG || 'Org1MSP',
      },
      error: error.message
    });
  }
}
