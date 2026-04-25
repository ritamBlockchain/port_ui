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
    // Note: This may fail on LevelDB (CouchDB query), return empty array in that case
    try {
      const result = await evaluateTransaction('GetVerificationLog', credentialId);
      return NextResponse.json({ 
        success: true, 
        data: JSON.parse(result.toString()) 
      });
    } catch (queryError: any) {
      // If query fails (e.g., LevelDB doesn't support rich queries), return empty array
      if (queryError.message?.includes('ExecuteQuery not supported') || 
          queryError.message?.includes('GET_QUERY_RESULT failed')) {
        console.log('Verification log query not supported (LevelDB), returning empty array');
        return NextResponse.json({ 
          success: true, 
          data: [] 
        });
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Fabric GetVerificationLog error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch verification log' 
    }, { status: 500 });
  }
}
