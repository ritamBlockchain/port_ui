import { submitTransaction } from '@/lib/fabric/connection';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { credentialId, certificateHash = '' } = await req.json();

    if (!credentialId) {
      return NextResponse.json({ success: false, error: 'Credential ID is required' }, { status: 400 });
    }

    const currentTime = new Date().toISOString();

    console.log(`[Fabric] Verifying Credential ${credentialId}`);
    
    // Contract: VerifyCredential(ctx, credentialId, certificateHashToCheck, currentTimeISO)
    // Note: VerifyCredential is a state-writing transaction in this contract because it logs the verification
    const result = await submitTransaction(
        'VerifyCredential', 
        credentialId.toString(), 
        certificateHash.toString(), 
        currentTime.toString()
    );

    return NextResponse.json({
      success: true,
      data: JSON.parse(result.toString()),
      message: 'Credential authenticity verified on blockchain'
    });
  } catch (error: any) {
    console.error('Fabric Error (VerifyCredential):', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Verification failed' 
    }, { status: 500 });
  }
}
