'use client';

import { useAuth } from '@/lib/api/auth';
import { useServices } from '@/hooks/useServices';
import { usePreArrivalList } from '@/hooks/usePreArrival';
import { FaAnchor, FaShip, FaCogs, FaTools, FaCheckCircle, FaExclamationTriangle, FaPlus, FaSync, FaPlay, FaCheck, FaTimes } from 'react-icons/fa';
import { useState } from 'react';

export default function PortServicesPage() {
  const { role } = useAuth();
  const { logs, isLoading, refetch, startService, isStarting, completeService, isCompleting, dispute, cancelService } = useServices();
  const { data: submissions } = usePreArrivalList();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    submissionId: '',
    serviceType: 'pilotage',
    notes: ''
  });

  const serviceIcons: any = {
    pilotage: FaAnchor,
    tug: FaShip,
    mooring: FaAnchor,
    stevedoring: FaCogs,
    waste_disposal: FaTools,
    bunkering: FaTools,
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    startService({
      submissionId: formData.submissionId,
      serviceType: formData.serviceType,
      providerName: role.toUpperCase(),
      providerId: role
    }, {
      onSuccess: () => {
        setShowForm(false);
        setFormData({ submissionId: '', serviceType: 'pilotage', notes: '' });
      }
    });
  };

  const handleComplete = (logId: string) => {
    const durationMins = prompt('Enter service duration in minutes:', '60');
    if (!durationMins) return;
    
    completeService({
      logId,
      durationMins: parseInt(durationMins),
      remarks: 'Service completed as requested'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-display text-color-text-primary">Port Service Logs</h1>
          <p className="text-color-text-secondary">Monitor and manage operational services provided to vessels</p>
        </div>
        <div className="flex gap-2">
            <button onClick={() => refetch()} className="p-2 border border-portmid rounded-lg text-portaccent hover:bg-portbase">
                <FaSync className={isLoading ? 'animate-spin' : ''} />
            </button>
            {['serviceprovider', 'admin', 'portauthority'].includes(role) && (
            <button 
              onClick={() => setShowForm(!showForm)}
              className="port-btn-primary flex items-center gap-2"
            >
                {showForm ? 'Cancel' : <><FaPlus /> Log New Service</>}
            </button>
            )}
        </div>
      </div>

      {showForm && (
        <div className="port-card p-6 bg-white border-2 border-portaccent shadow-xl animate-in fade-in zoom-in duration-300">
           <h3 className="text-xl font-display mb-6">Log New Operational Service</h3>
           <form onSubmit={handleStart} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Select Vessel</label>
                 <select 
                    required
                    className="port-input w-full"
                    value={formData.submissionId}
                    onChange={(e) => setFormData({...formData, submissionId: e.target.value})}
                  >
                    <option value="">-- Choose Approved Vessel --</option>
                    {submissions?.filter(s => s.status === 'approved').map(s => (
                      <option key={s.submissionId} value={s.submissionId}>{s.vesselName} ({s.vesselIMO})</option>
                    ))}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Service Type</label>
                 <select 
                    className="port-input w-full uppercase font-bold text-xs"
                    value={formData.serviceType}
                    onChange={(e) => setFormData({...formData, serviceType: e.target.value})}
                  >
                    <option value="pilotage">Pilotage</option>
                    <option value="tug">Tug Master</option>
                    <option value="mooring">Mooring</option>
                    <option value="stevedoring">Stevedoring</option>
                    <option value="bunkering">Bunkering</option>
                 </select>
              </div>
              <div className="flex items-end">
                 <button 
                  disabled={isStarting}
                  type="submit" 
                  className="port-btn-primary w-full py-3 flex items-center justify-center gap-2"
                 >
                    <FaPlay /> {isStarting ? 'Broadcasting...' : 'Start Service'}
                 </button>
              </div>
           </form>
        </div>
      )}

      {isLoading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-portaccent">
          <FaSync className="text-4xl animate-spin" />
          <p className="font-display">Querying Ledger for Operations...</p>
        </div>
      ) : logs && logs.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {logs.map((log: any) => {
            const Icon = serviceIcons[log.serviceType] || FaAnchor;
            const isRequest = log.type === 'request';

            return (
              <div key={log.logId} className={`port-card p-6 flex items-center justify-between group hover:border-portaccent transition-all animate-in slide-in-from-bottom duration-300 ${isRequest ? 'border-amber-200 bg-amber-50/30' : ''}`}>
                <div className="flex items-center gap-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-portaccent group-hover:text-white transition-all ring-1 ring-portmid/30 ${isRequest ? 'bg-amber-100 text-amber-600' : 'bg-white text-portaccent'}`}>
                    <Icon className="text-2xl" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-lg text-color-text-primary capitalize">
                        {log.serviceType.replace('_', ' ')}
                        {isRequest && <span className="ml-2 text-[10px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Request</span>}
                      </h3>
                      <span className="text-[10px] font-mono bg-portmid/30 px-1.5 py-0.5 rounded text-color-text-secondary">{log.logId}</span>
                    </div>
                    <p className="text-sm font-bold text-color-text-primary uppercase tracking-tight">Vessel: {log.vesselIMO}</p>
                    <p className="text-[10px] text-color-text-muted font-bold uppercase tracking-widest mt-1">
                      {isRequest ? `Requested At: ${new Date(log.requestedAt).toLocaleString()}` : `Provider: ${log.providerName}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-12">
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest mb-1">Duration</p>
                    <p className="text-sm font-medium">{log.durationMins || '--'} mins</p>
                  </div>
                  <div className="text-center hidden md:block">
                    <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest mb-1">{isRequest ? 'Requested' : 'Logged'}</p>
                    <p className="text-sm font-medium">{new Date(log.loggedAt || log.requestedAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${
                      log.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                      log.status === 'started' ? 'bg-blue-50 text-blue-600 border-blue-200 animate-pulse' :
                      log.status === 'open' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                      log.status === 'disputed' ? 'bg-rose-50 text-rose-600 border-rose-200' :
                      log.status === 'resolved' ? 'bg-teal-50 text-teal-600 border-teal-200' :
                      'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {log.status === 'completed' || log.status === 'resolved' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                      {log.status}
                    </div>
                    
                    {/* Action Buttons */}
                    {isRequest && (['serviceprovider', 'admin'].includes(role)) && (
                        <button 
                            disabled={isStarting}
                            onClick={() => {
                                startService({
                                    requestId: log.logId,
                                    submissionId: log.submissionId,
                                    serviceType: log.serviceType,
                                    providerName: 'Marine Services Corp',
                                    quantityUnit: 'hours'
                                });
                            }}
                            className="text-[10px] font-bold bg-amber-500 text-white px-4 py-1.5 rounded hover:bg-amber-600 uppercase tracking-widest flex items-center gap-1"
                        >
                            <FaPlay /> Accept & Start
                        </button>
                    )}

                    {isRequest && (['shippingagent', 'portauthority', 'admin'].includes(role)) && (
                        <button 
                            onClick={() => {
                                const reason = window.prompt("Enter reason for cancellation:");
                                if (reason) cancelService({ logId: log.logId, reason });
                            }}
                            className="text-[10px] font-bold text-rose-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                        >
                            <FaTimes /> Cancel Request
                        </button>
                    )}

                    {log.status === 'started' && (['serviceprovider', 'admin', 'portauthority'].includes(role)) && (
                      <button 
                        disabled={isCompleting}
                        onClick={() => handleComplete(log.logId)}
                        className="text-[10px] font-bold text-portaccent hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        <FaCheck /> Mark Complete
                      </button>
                    )}

                    {(log.status === 'started' || log.status === 'completed') && (['portauthority', 'admin'].includes(role)) && (
                      <button 
                        onClick={() => {
                          const reason = window.prompt("Enter reason for dispute:");
                          if (reason) dispute({ action: 'raise', logId: log.logId, reason });
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        <FaExclamationTriangle /> Raise Dispute
                      </button>
                    )}

                    {log.status === 'disputed' && (['portauthority', 'admin'].includes(role)) && (
                      <button 
                        onClick={() => {
                          const res = window.prompt("Enter resolution details:");
                          if (res) dispute({ action: 'resolve', logId: log.logId, resolution: res });
                        }}
                        className="text-[10px] font-bold text-teal-600 hover:underline uppercase tracking-widest flex items-center gap-1"
                      >
                        <FaCheckCircle /> Resolve Dispute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="port-card p-20 text-center flex flex-col items-center gap-4 bg-white/40">
          <FaAnchor className="text-5xl text-portmid" />
          <h3 className="text-2xl font-display text-color-text-secondary">No Ledger Operations</h3>
          <p className="text-sm text-color-text-muted max-w-md">No port services have been requested or logged on this channel yet.</p>
        </div>
      )}
    </div>
  );
}

