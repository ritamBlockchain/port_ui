import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Credential ID missing' }, { status: 400 });
    }

    let cleanId = id;
    if (cleanId.startsWith('did:portchain:')) {
      cleanId = cleanId.replace('did:portchain:', '');
    }

    // Fabric GetCredential function (from portchain.go)
    const result = await evaluateTransaction('GetCredential', cleanId);
    
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
