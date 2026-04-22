import { NextRequest, NextResponse } from 'next/server';
import { submitTransactionWithTxId } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      submissionId, vesselIMO, vesselName, callSign, flag, 
      etaTimestamp, cargoManifest, crewList, portCallPurpose 
    } = body;

    const { txId } = await submitTransactionWithTxId(
      'SubmitPreArrival',
      submissionId,
      vesselIMO,
      vesselName,
      callSign,
      flag,
      etaTimestamp,
      JSON.stringify(cargoManifest),
      JSON.stringify(crewList),
      portCallPurpose
    );

    return NextResponse.json({ 
      success: true, 
      txId,
      submissionId,
      message: `Pre-arrival ${submissionId} submitted to ledger`
    });
  } catch (error: any) {
    console.error('Fabric POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to submit to Hyperledger Fabric' 
    }, { status: 500 });
  }
}
