import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
import { MOCK_EBLS } from '@/lib/fabric/mock-data';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // Fetch all eBLs using prefix query for CouchDB compatibility
      const result = await evaluateTransaction('QueryAssets', 'prefix:ebl:');
      const resultString = result.toString();
      const rawData = resultString && resultString.trim() !== '' ? JSON.parse(resultString) : [];
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
    console.error('Fabric EBL connection failed. Returning Mock Data:', error.message);
    return NextResponse.json({ 
      success: true, 
      data: MOCK_EBLS,
      isMock: true
    });
  }
}
