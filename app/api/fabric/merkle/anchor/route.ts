import { NextRequest, NextResponse } from 'next/server';
import { submitTransaction, evaluateTransaction } from '@/lib/fabric/connection';

export async function POST(req: NextRequest) {
  try {
    // 1. Fetch unanchored leaves from ledger
    const unanchoredResult = await evaluateTransaction('GetUnanchoredLeaves');
    const leaves = JSON.parse(unanchoredResult.toString() || '[]');

    if (leaves.length === 0) {
      return NextResponse.json({ success: false, error: 'No pending leaves to anchor' }, { status: 400 });
    }

    const leafIds = leaves.map((l: any) => l.leafId);
    
    // 2. Generate a mock Merkle Root (Simulating cryptographic rollup)
    const rootId = `ROOT_${Date.now()}`;
    const merkleRoot = '0x' + Math.random().toString(16).substring(2, 10) + '...merkle...root';
    const polygonTxHash = '0x' + Math.random().toString(16).substring(2) + Math.random().toString(16).substring(2);

    console.log(`[Merkle] Anchoring ${leafIds.length} leaves under Root ${rootId}`);

    // 3. Anchor to Ledger
    // Arguments: rootId, merkleRoot, polygonTxHash, leafIdsJSON
    const result = await submitTransaction(
      'AnchorMerkleRoot',
      rootId,
      merkleRoot,
      polygonTxHash,
      JSON.stringify(leafIds)
    );

    return NextResponse.json({
      success: true,
      data: {
        rootId,
        merkleRoot,
        polygonTxHash,
        leafCount: leafIds.length,
        txId: result.toString()
      },
      message: 'Merkle root anchored successfully'
    });
  } catch (error: any) {
    console.error('Merkle Anchor Failed:', error.message);
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to anchor Merkle root'
    }, { status: 500 });
  }
}
