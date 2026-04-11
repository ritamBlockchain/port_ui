import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Credential ID missing' }, { status: 400 });
    }

    // Fabric GetCredential function (from portchain.go)
    const result = await evaluateTransaction('GetCredential', id);
    
    return NextResponse.json({ 
      success: true, 
      data: JSON.parse(result.toString()) 
    });
  } catch (error: any) {
    console.error('Fabric GetCredential error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch credential' 
    }, { status: 500 });
  }
}
