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
      const data = rawData.map((item: string) => {
        const obj = JSON.parse(item);
        return {
          eblId: obj.EblId || obj.eblId || obj.ID || obj.id,
          blNumber: obj.BlNumber || obj.blNumber,
          submissionId: obj.SubmissionId || obj.submissionId,
          vesselName: obj.VesselName || obj.vesselName,
          status: obj.Status || obj.status,
          currentHolder: obj.CurrentHolder || obj.currentHolder,
          portOfLoading: obj.PortOfLoading || obj.portOfLoading,
          portOfDischarge: obj.PortOfDischarge || obj.portOfDischarge,
          updatedAt: obj.UpdatedAt || obj.updatedAt,
          transferHistory: obj.TransferHistory || obj.transferHistory || [],
          blType: obj.BlType || obj.blType,
          ...obj
        };
      });
      return NextResponse.json({ success: true, data });
    }

    const result = await evaluateTransaction('GetEBL', id);
    const obj = JSON.parse(result.toString());
    const data = {
      eblId: obj.EblId || obj.eblId || obj.ID || obj.id,
      blNumber: obj.BlNumber || obj.blNumber,
      submissionId: obj.SubmissionId || obj.submissionId,
      vesselName: obj.VesselName || obj.vesselName,
      status: obj.Status || obj.status,
      currentHolder: obj.CurrentHolder || obj.currentHolder,
      portOfLoading: obj.PortOfLoading || obj.portOfLoading,
      portOfDischarge: obj.PortOfDischarge || obj.portOfDischarge,
      updatedAt: obj.UpdatedAt || obj.updatedAt,
      transferHistory: obj.TransferHistory || obj.transferHistory || [],
      blType: obj.BlType || obj.blType,
      ...obj
    };
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Fabric EBL error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
