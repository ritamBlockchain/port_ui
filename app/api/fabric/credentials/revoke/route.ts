import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { credentialId, reason } = await req.json();

    if (!credentialId || !reason) {
      return NextResponse.json({ success: false, error: 'Credential ID and reason are required' }, { status: 400 });
    }

    console.log(`Revoking credential ${credentialId} on ledger...`);
    
    // contract function: RevokeCredential(ctx, credentialId, reason)
    const result = await submitTransaction('RevokeCredential', credentialId, reason);
    
    return NextResponse.json({ 
      success: true, 
      message: `Credential ${credentialId} has been cryptographically revoked.`,
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric Revocation Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to revoke credential on blockchain'
    }, { status: 500 });
  }
}
