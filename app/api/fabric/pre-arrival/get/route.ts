import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // Restore listing logic
      const result = await evaluateTransaction('QueryAssets', '{"selector":{"docType":"prearrival"}}');
      const rawRecords = JSON.parse(result.toString());
      const data = rawRecords.map((r: string) => JSON.parse(r));
      return NextResponse.json({ success: true, data });
    }

    // Fetch main submission
    const result = await evaluateTransaction('GetPreArrival', id);
    const data = JSON.parse(result.toString());

    // Also fetch private data (cargo manifest + crew list)
    // Stored under "prearrival_priv:" prefix via QueryAssets
    try {
      const privResult = await evaluateTransaction('QueryAssets', `prefix:prearrival_priv:${id}`);
      const privString = privResult.toString();
      if (privString && privString.trim() !== '') {
        const privArray = JSON.parse(privString);
        if (privArray.length > 0) {
          const privData = JSON.parse(privArray[0]);
          data.cargoManifest = privData.cargoManifest || [];
          data.crewList = privData.crewList || [];
        }
      }
    } catch (privErr: any) {
      console.log('Private data fetch (non-critical):', privErr.message);
      // Private data is optional; don't fail the main request
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric GET error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to fetch from Hyperledger Fabric' 
    }, { status: 500 });
  }
}
