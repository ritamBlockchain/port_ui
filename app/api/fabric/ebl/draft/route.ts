import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction, evaluateTransaction } from '@/lib/fabric/connection';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      // List all drafts
      const result = await evaluateTransaction('QueryAssets', '{"selector":{"docType":"draftebl"}}');
      const raw = JSON.parse(result.toString());
      const data = raw.map((item: string) => JSON.parse(item));
      return NextResponse.json({ success: true, data });
    }

    const result = await evaluateTransaction('GetDraftEBL', id);
    return NextResponse.json({ success: true, data: JSON.parse(result.toString()) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, draftId } = body;

    let result;
    switch (action) {
      case 'create':
        // CreateDraftEBL(ctx, draftId, eblId, blNumber, submissionId, snapshotJSON)
        result = await submitTransaction(
          'CreateDraftEBL', 
          draftId, 
          body.eblId, 
          `BL-${body.eblId}`, 
          body.submissionId, 
          JSON.stringify(body.snapshot)
        );
        break;

      case 'revise':
        // ReviseDraftEBL(ctx, draftId, snapshotJSON, notes)
        result = await submitTransaction(
          'ReviseDraftEBL', 
          draftId, 
          JSON.stringify(body.snapshot), 
          body.notes || 'UI Revision'
        );
        break;

      case 'commit':
        // CommitDraftEBL(ctx, draftId)
        result = await submitTransaction('CommitDraftEBL', draftId);
        break;

      case 'reject':
        // RejectDraftEBL(ctx, draftId, reason)
        result = await submitTransaction('RejectDraftEBL', draftId, body.reason || 'Rejected by user');
        break;

      default:
        return NextResponse.json({ success: false, error: `Unsupported action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Action '${action}' completed successfully`,
      txId: result ? result.toString() : 'N/A'
    });
  } catch (error: any) {
    console.error('Fabric Draft Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
