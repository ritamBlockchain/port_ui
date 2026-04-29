import { NextRequest, NextResponse } from 'next/server';
import { evaluateTransaction } from '@/lib/fabric/connection';
import { MOCK_SERVICES } from '@/lib/fabric/mock-data';

export async function GET() {
  try {
    // Fetch both service logs and service requests
    console.log('Fetching live service data (logs & requests)...');
    
    const logsResult = await evaluateTransaction('QueryAssets', 'prefix:svclog:');
    const requestsResult = await evaluateTransaction('QueryAssets', 'prefix:svcreq:');

    const logsString = logsResult.toString();
    const reqsString = requestsResult.toString();

    let allData: any[] = [];

    if (logsString && logsString.trim() !== '' && logsString !== '[]') {
      const logs = JSON.parse(logsString).map((item: string) => {
        const obj = JSON.parse(item);
        return {
          ...obj,
          type: 'log',
          durationMins: obj.quantity || obj.Quantity || 0,
        };
      });
      allData = [...allData, ...logs];
    }

    if (reqsString && reqsString.trim() !== '' && reqsString !== '[]') {
      const reqs = JSON.parse(reqsString).map((item: string) => {
        const obj = JSON.parse(item);
        
        // Check if this request has already been converted to a log
        const hasLog = allData.some(log => log.type === 'log' && log.requestId === obj.requestId);

        if (obj.status === 'open' && !hasLog) {
            return {
                ...obj,
                type: 'request',
                logId: obj.requestId, // Map requestId to logId for UI consistency
                providerName: 'PENDING',
                durationMins: 0,
            };
        }
        return null;
      }).filter(Boolean);
      allData = [...allData, ...reqs];
    }

    // Sort by timestamp (most recent first)
    allData.sort((a, b) => {
        const timeA = new Date(a.loggedAt || a.requestedAt).getTime();
        const timeB = new Date(b.loggedAt || b.requestedAt).getTime();
        return timeB - timeA;
    });

    return NextResponse.json({ success: true, data: allData });
  } catch (error: any) {
    console.error('Fabric Service Data Fetch Failed. Returning Mock Data:', error.message);
    return NextResponse.json({ 
      success: true, 
      data: MOCK_SERVICES,
      isMock: true
    });
  }
}

