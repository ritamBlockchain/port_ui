import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET() {
  try {
    // Calling the actual GetUnanchoredLeaves function from the Go contract
    const result = await evaluateTransaction('GetUnanchoredLeaves');
    const data = JSON.parse(result.toString());

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric Merkle error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch Merkle leaves' 
    }, { status: 500 });
  }
}
