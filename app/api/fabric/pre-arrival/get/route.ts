import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // Use prefix-based range query for high compatibility (fixes "approved not showing" issue)
      const result = await evaluateTransaction('QueryAssets', 'prefix:prearrival:');
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
    }

    // 3. Fetch Berth Assignment (Operational Join)
    try {
      // Use prefix query to fetch all berth assignments, then filter
      const berthResult = await evaluateTransaction('QueryAssets', 'prefix:berth:');
      const berthString = berthResult.toString();
      if (berthString && berthString.trim() !== '') {
        const berthArray = JSON.parse(berthString);
        const berthRecord = berthArray
          .map((r: string) => JSON.parse(r))
          .find((asset: any) => asset.submissionId === id);
        if (berthRecord) {
          // For now, use default values if private data isn't accessible
          // Private data collections require special handling in Fabric
          if (!berthRecord.berthName) berthRecord.berthName = 'Assigned Berth';
          if (!berthRecord.timeSlot) berthRecord.timeSlot = new Date().toISOString();
          data.berthAssignment = berthRecord;
        }
      }
    } catch (berthErr: any) {
      console.log('Berth fetch (non-critical):', berthErr.message);
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
