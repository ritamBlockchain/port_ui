import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const credentialId = searchParams.get('credentialId');

    if (!credentialId) {
      return NextResponse.json({ success: false, error: 'Credential ID is required' }, { status: 400 });
    }

    console.log(`Fetching verification log for credential ${credentialId}`);
    
    // Contract: GetVerificationLog(ctx, credentialId)
    const result = await evaluateTransaction('GetVerificationLog', credentialId);
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result.toString()) 
    });
  } catch (error: any) {
    console.error('Fabric GetVerificationLog error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch verification log' 
    }, { status: 500 });
  }
}
