import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // Fetch all eBLs using the newly added QueryAssets function
      const result = await evaluateTransaction('QueryAssets', '{"selector":{"eblId":{"$gt":null}}}');
      const rawData = JSON.parse(result.toString());
      const data = rawData.map((item: string) => JSON.parse(item));
      return NextResponse.json({ success: true, data });
    }

    const result = await evaluateTransaction('GetEBL', id);
    return NextResponse.json({ success: true, data: JSON.parse(result.toString()) });
  } catch (error: any) {
    console.error('Fabric EBL error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
