import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId');

    if (!entityId) {
      return NextResponse.json({ success: false, error: 'Entity ID is required' }, { status: 400 });
    }

    console.log(`Fetching credentials for entity ${entityId}`);
    
    // Contract: GetCredentialsByEntity(ctx, entityId)
    const result = await evaluateTransaction('GetCredentialsByEntity', entityId);
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result.toString()) 
    });
  } catch (error: any) {
    console.error('Fabric GetCredentialsByEntity error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch credentials by entity' 
    }, { status: 500 });
  }
}
