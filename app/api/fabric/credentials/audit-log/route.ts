import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const credentialId = searchParams.get('credentialId');

    if (!credentialId) {
      return NextResponse.json({ success: false, error: 'Credential ID is required' }, { status: 400 });
    }

    console.log(`Fetching audit log for credential ${credentialId}`);
    
    // Contract: GetCredentialAuditLog(ctx, credentialId)
    const result = await evaluateTransaction('GetCredentialAuditLog', credentialId);
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result.toString()) 
    });
  } catch (error: any) {
    console.error('Fabric GetCredentialAuditLog error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch audit log' 
    }, { status: 500 });
  }
}
