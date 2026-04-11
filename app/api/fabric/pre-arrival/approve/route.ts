import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { submissionId, agency, comments, approved } = body;

    const result = await submitTransaction(
      'ApproveSubmission', 
      submissionId, 
      agency, 
      comments, 
      approved ? 'true' : 'false'
    );

    return NextResponse.json({ success: true, data: result.toString() });
  } catch (error: any) {
    console.error('Approval Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
