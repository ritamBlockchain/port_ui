'use client';

import { useState, useEffect } from 'react';
import { FaBell, FaPlay, FaCheck, FaClock, FaAnchor } from 'react-icons/fa';

interface ServiceRequest {
  requestId: string;
  submissionId: string;
  vesselIMO: string;
  serviceType: string;
  requestedAt: string;
  notes: string;
  status: string;
}

interface ServiceLog {
  logId: string;
  requestId: string;
  submissionId: string;
  vesselIMO: string;
  serviceType: string;
  status: string;
  startedAt: string;
  providerName: string;
  providerId: string;
  quantityUnit: string;
}

export default function ServiceRequestManagement() {
  const [pendingRequests, setPendingRequests] = useState<ServiceRequest[]>([]);
  const [activeLogs, setActiveLogs] = useState<ServiceLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingService, setStartingService] = useState<string | null>(null);
  const [completingService, setCompletingService] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<{ [key: string]: string }>({});
  const [remarks, setRemarks] = useState<{ [key: string]: string }>({});

  // Fetch pending requests and active logs
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reqRes, logRes] = await Promise.all([
        fetch('/api/fabric/service-requests/all'),
        fetch('/api/fabric/services/all'),
      ]);
      
      const reqJson = await reqRes.json();
      const logJson = await logRes.json();
      
      setPendingRequests(reqJson.success ? reqJson.data?.filter((r: any) => r.status === 'open') || [] : []);
      setActiveLogs(logJson.success ? logJson.data?.filter((l: any) => l.status === 'started') || [] : []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStartService = async (request: ServiceRequest) => {
    setStartingService(request.requestId);
    try {
      const logId = `LOG-${request.requestId}-${Date.now()}`;
      const assignmentId = request.submissionId; // Using submissionId as assignmentId for now
      
      const response = await fetch('/api/fabric/services/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId,
          requestId: request.requestId,
          submissionId: request.submissionId,
          assignmentId,
          serviceType: request.serviceType,
          providerName: 'ServiceProvider',
          quantityUnit: 'hours',
        }),
      });

      if (!response.ok) throw new Error('Failed to start service');
      
      await fetchData();
    } catch (error) {
      console.error('Start service error:', error);
      alert('Failed to start service');
    } finally {
      setStartingService(null);
    }
  };

  const handleCompleteService = async (log: ServiceLog) => {
    setCompletingService(log.logId);
    try {
      const qty = quantity[log.logId];
      if (!qty || isNaN(parseFloat(qty)) || parseFloat(qty) <= 0) {
        alert('Please enter a valid quantity');
        setCompletingService(null);
        return;
      }

      const response = await fetch('/api/fabric/services/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logId: log.logId,
          quantity: parseFloat(qty),
          remarks: remarks[log.logId] || '',
        }),
      });

      if (!response.ok) throw new Error('Failed to complete service');
      
      await fetchData();
      setQuantity({ ...quantity, [log.logId]: '' });
      setRemarks({ ...remarks, [log.logId]: '' });
    } catch (error) {
      console.error('Complete service error:', error);
      alert('Failed to complete service');
    } finally {
      setCompletingService(null);
    }
  };

  if (loading) {
    return (
      <div className="port-card p-8 text-center">
        <FaClock className="text-4xl text-portmid animate-spin mx-auto mb-4" />
        <p className="text-color-text-muted">Loading service requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Service Requests */}
      <div className="port-card bg-white">
        <div className="p-4 bg-indigo-600 text-white flex items-center gap-2">
          <FaBell className="text-xl" />
          <h3 className="font-display text-lg">Pending Service Requests</h3>
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
            {pendingRequests.length}
          </span>
        </div>
        <div className="divide-y divide-portmid/10">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-color-text-muted">
              No pending service requests
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div key={req.requestId} className="p-4 flex items-center justify-between hover:bg-portbase/20">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FaAnchor />
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase">{req.serviceType}</p>
                    <p className="text-[10px] text-color-text-muted font-mono">{req.vesselIMO}</p>
                    {req.notes && (
                      <p className="text-[10px] text-color-text-secondary mt-1 italic">{req.notes}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleStartService(req)}
                  disabled={startingService === req.requestId}
                  className="port-btn-primary flex items-center gap-2 px-4 py-2 text-sm"
                >
                  {startingService === req.requestId ? (
                    <FaClock className="animate-spin" />
                  ) : (
                    <FaPlay />
                  )}
                  Start Service
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Active Service Logs (Started but not completed) */}
      <div className="port-card bg-white">
        <div className="p-4 bg-amber-500 text-white flex items-center gap-2">
          <FaClock className="text-xl" />
          <h3 className="font-display text-lg">Active Services (In Progress)</h3>
          <span className="ml-auto bg-white/20 px-3 py-1 rounded-full text-sm">
            {activeLogs.length}
          </span>
        </div>
        <div className="divide-y divide-portmid/10">
          {activeLogs.length === 0 ? (
            <div className="p-8 text-center text-color-text-muted">
              No active services in progress
            </div>
          ) : (
            activeLogs.map((log) => (
              <div key={log.logId} className="p-4 hover:bg-portbase/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                      <FaClock />
                    </div>
                    <div>
                      <p className="font-bold text-sm uppercase">{log.serviceType}</p>
                      <p className="text-[10px] text-color-text-muted font-mono">{log.vesselIMO}</p>
                      <p className="text-[10px] text-color-text-secondary">
                        Started: {new Date(log.startedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <span className="bg-amber-100 text-amber-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase">
                    In Progress
                  </span>
                </div>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-color-text-muted uppercase mb-1">
                      Quantity ({log.quantityUnit})
                    </label>
                    <input
                      type="number"
                      value={quantity[log.logId] || ''}
                      onChange={(e) => setQuantity({ ...quantity, [log.logId]: e.target.value })}
                      placeholder="Enter quantity"
                      className="w-full p-2 border border-portmid rounded-lg text-sm"
                      disabled={completingService === log.logId}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-color-text-muted uppercase mb-1">
                      Remarks (Optional)
                    </label>
                    <input
                      type="text"
                      value={remarks[log.logId] || ''}
                      onChange={(e) => setRemarks({ ...remarks, [log.logId]: e.target.value })}
                      placeholder="Add remarks..."
                      className="w-full p-2 border border-portmid rounded-lg text-sm"
                      disabled={completingService === log.logId}
                    />
                  </div>
                  <button
                    onClick={() => handleCompleteService(log)}
                    disabled={completingService === log.logId}
                    className="port-btn-primary bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2 px-4 py-2 text-sm h-[38px]"
                  >
                    {completingService === log.logId ? (
                      <FaClock className="animate-spin" />
                    ) : (
                      <FaCheck />
                    )}
                    Complete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
