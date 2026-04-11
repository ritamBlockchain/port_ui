import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      invoiceId,
      bankRefNumber = `BANK_${Date.now()}`,
      paymentGateway = 'BankConnect',
      amountPaid = 0
    } = body;

    if (!invoiceId) {
      return NextResponse.json({ success: false, error: 'invoiceId is required' }, { status: 400 });
    }

    console.log(`[API] Confirming Payment for Invoice ${invoiceId}`);

    // Contract: ConfirmPayment(ctx, invoiceId, bankRefNumber, paymentGateway, amountPaid float64)
    const result = await submitTransaction(
      'ConfirmPayment',
      invoiceId.toString(),
      bankRefNumber.toString(),
      paymentGateway.toString(),
      amountPaid.toString()
    );

    return NextResponse.json({
      success: true,
      txId: result.toString(),
      message: 'Payment confirmed successfully'
    });
  } catch (error: any) {
    console.error('Confirm Payment Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to confirm payment'
    }, { status: 500 });
  }
}
