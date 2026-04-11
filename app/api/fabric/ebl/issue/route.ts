import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { 
      eblId, voyageNumber, portOfLoading, portOfDischarge, 
      placeOfReceipt, placeOfDelivery, freightPayment, blType,
      shipper, consignee, notifyParty, goodsDetails, submissionId 
    } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ success: false, error: 'Linked Submission ID is required' }, { status: 400 });
    }
    
    console.log(`Issuing eBL for Submission ${submissionId} via Draft lifecycle...`);

    const draftId = `DRAFT-${eblId}`;
    const blNumber = `BL-${eblId}`;
    
    // Format goodsDetails as a GoodsLine array JSON
    const goodsLines = [
      {
        description: goodsDetails,
        quantity: 1,
        weight: 1000,
        marks: 'N/M'
      }
    ];
    const goodsLinesJSON = JSON.stringify(goodsLines);

    // 1. Create Draft
    const snapshotJSON = JSON.stringify({ shipper, consignee, notifyParty, goodsDetails });
    await submitTransaction('CreateDraftEBL', draftId, eblId, blNumber, submissionId, snapshotJSON);
    
    // 2. Commit Draft
    await submitTransaction('CommitDraftEBL', draftId);

    // 3. Issue EBL
    // Arguments: draftId, voyageNumber, portOfLoading, portOfDischarge, placeOfReceipt, 
    // placeOfDelivery, freightPayment, blType, shipperName, shipperAddress, 
    // consigneeName, consigneeAddress, notifyParty, goodsLinesJSON, freightAmount, freightCurrency
    const result = await submitTransaction(
      'IssueEBL',
      draftId,
      voyageNumber || '',
      portOfLoading || '',
      portOfDischarge || '',
      placeOfReceipt || '',
      placeOfDelivery || '',
      freightPayment.toLowerCase(), // prepaid | collect
      blType.toLowerCase(),         // original | seawaybill | telex
      shipper || '',
      'Not Provided',               // shipperAddress
      consignee || '',
      'Not Provided',               // consigneeAddress
      notifyParty || '',
      goodsLinesJSON,
      '0.0',                        // freightAmount (must be string for submitTransaction if contract takes float?)
      'USD'                         // freightCurrency
    );

    return NextResponse.json({ 
      success: true, 
      message: 'e-Bill of Lading issued successfully',
      txId: result.toString()
    });

  } catch (error: any) {
    console.error('Fabric EBL Issue Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
