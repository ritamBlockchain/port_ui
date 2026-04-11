import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      submissionId, vesselIMO, vesselName, callSign, flag, 
      etaTimestamp, cargoManifest, crewList, portCallPurpose 
    } = body;

    const result = await submitTransaction(
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
      data: result.toString(),
      txId: 'Fabric-Tx-Signature' // In a real app we'd get the actual txId from the result or context
    });
  } catch (error: any) {
    console.error('Fabric POST error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to submit to Hyperledger Fabric' 
    }, { status: 500 });
  }
}
