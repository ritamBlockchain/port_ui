import { NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
export async function GET() {
  try {
    // Try the rich query first (CouchDB)
    let result;
    try {
      result = await evaluateTransaction('GetUnanchoredLeaves');
      const data = JSON.parse(result.toString());
      console.log('GetUnanchoredLeaves returned:', data.length, 'leaves');
      return NextResponse.json({ success: true, data });
    } catch (queryError: any) {
      // If rich query fails (LevelDB), fall back to prefix query
      if (queryError.message?.includes('ExecuteQuery not supported') || 
          queryError.message?.includes('GET_QUERY_RESULT failed')) {
        console.log('GetUnanchoredLeaves not supported (LevelDB), using prefix query');
        result = await evaluateTransaction('QueryAssets', 'prefix:merkle:leaf:');
        const resultString = result.toString();
        const rawData = resultString && resultString.trim() !== '' ? JSON.parse(resultString) : [];
        const data = rawData.map((item: string) => JSON.parse(item));
        console.log('Total Merkle leaves found:', data.length);
        
        // Filter for unanchored leaves (those without anchorId or anchorId empty)
        const unanchored = data.filter((leaf: any) => {
          const isUnanchored = !leaf.anchorId || leaf.anchorId === '' || leaf.anchorId === 'none';
          if (!isUnanchored) {
            console.log('Leaf anchored:', leaf.leafId, 'anchorId:', leaf.anchorId);
          }
          return isUnanchored;
        });
        console.log('Unanchored leaves after filtering:', unanchored.length);
        
        return NextResponse.json({ success: true, data: unanchored });
      }
      throw queryError;
    }
  } catch (error: any) {
    console.error('Fabric Merkle connection failed:', error.message);
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: error.message
    });
  }
}
