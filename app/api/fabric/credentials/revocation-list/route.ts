import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    console.log('Fetching revocation list...');
    
    // Contract: GetRevocationList(ctx)
    const result = await evaluateTransaction('GetRevocationList');
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result.toString()) 
    });
  } catch (error: any) {
    console.error('Fabric GetRevocationList error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch revocation list' 
    }, { status: 500 });
  }
}
