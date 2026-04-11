import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    const { 
      assignmentId, submissionId, vesselIMO, berthId, 
      berthName, timeSlot, pilotageInfo, isOverride 
    } = await req.json();

    if (!assignmentId || !submissionId || !berthId) {
      return NextResponse.json({ success: false, error: 'Mandatory berth allocation data missing' }, { status: 400 });
    }

    console.log(`Assigning berth ${berthId} to vessel ${vesselIMO} on ledger...`);
    
    // contract function: AssignBerth(ctx, assignmentId, submissionId, vesselIMO, berthId, berthName, timeSlot, pilotageInfo, isOverride)
    const result = await submitTransaction(
      'AssignBerth', 
      assignmentId, 
      submissionId, 
      vesselIMO, 
      berthId, 
      berthName || '', 
      timeSlot || '', 
      pilotageInfo || '', 
      String(isOverride || false)
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Berth ${berthId} assigned successfully.`,
      txId: result.toString()
    });
  } catch (error: any) {
    console.error('Fabric Berth Assignment Error:', error.message);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to assign berth on blockchain'
    }, { status: 500 });
  }
}
