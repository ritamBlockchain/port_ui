'use client';

import { FaAnchor, FaShip, FaHistory, FaPlusCircle, FaPlayCircle, FaCheckCircle, FaArrowRight, FaBell, FaTools, FaDollarSign } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';
import ServiceRequestManagement from '@/components/services/ServiceRequestManagement';

export default function ServiceProviderDashboard() {
  const { role } = useAuth();
  
  const { data: assignments } = useQuery({
    queryKey: ['service-assignments'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data?.filter((s: any) => s.status === 'approved') || [] : [];
    }
  });

  const { data: recentLogs } = useQuery({
    queryKey: ['my-service-logs', role],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      // Show all logs for service provider/admin for now, as providerId on ledger is an X509 string
      return json.success ? json.data?.slice(0, 5) || [] : [];
    }
  });

  const { data: completedLogs } = useQuery({
    queryKey: ['completed-service-logs', role],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      // Filter for completed logs that don't have an invoice yet
      return json.success ? json.data?.filter((l: any) => l.status === 'completed' && !l.invoiceId).slice(0, 5) || [] : [];
    }
  });

  // Stakeholder Journey Steps
  const journeySteps = [
    { id: 1, title: 'Receive Requests', description: 'Accept service orders', icon: FaBell, status: 'active' },
    { id: 2, title: 'Start Services', description: 'Log start time', icon: FaPlayCircle, status: 'pending' },
    { id: 3, title: 'Complete Services', description: 'Log quantity & duration', icon: FaCheckCircle, status: 'pending' },
    { id: 4, title: 'Get Paid', description: 'Automated invoicing', icon: FaDollarSign, status: 'pending' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stakeholder Journey Banner */}
      <div className="port-card p-6 bg-gradient-to-r from-[#1a2f45] to-[#2a4a6f] text-white rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold mb-1">Service Provider Journey</h3>
            <p className="text-sm opacity-80">Revenue cycle reduced from 30 days to 7 days with blockchain automation</p>
          </div>
          <div className="bg-portaccent/20 px-4 py-2 rounded-xl border border-portaccent/30">
            <p className="text-2xl font-display font-bold text-portaccent">7 Days</p>
            <p className="text-[10px] uppercase tracking-widest text-portaccent">Revenue Cycle</p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-2">
          {journeySteps.map((step, idx) => {
            const StepIcon = step.icon;
            return (
              <div key={step.id} className="flex-1 flex flex-col items-center text-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-2 ${step.status === 'active' ? 'bg-portaccent text-white' : 'bg-white/10 text-white/60'}`}>
                  <StepIcon className="text-lg" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider">{step.title}</p>
                <p className="text-[10px] opacity-60 mt-1">{step.description}</p>
                {idx < journeySteps.length - 1 && <FaArrowRight className="text-white/20 text-xs mt-2" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action */}
      <div className="port-card p-8 bg-portsurface/30 border-2 border-dashed border-portmid flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-portaccent text-white flex items-center justify-center text-3xl shadow-lg">
              <FaTools />
           </div>
           <div>
              <h3 className="text-2xl font-display text-color-text-primary capitalize">{role} Service Portal</h3>
              <p className="text-sm text-color-text-secondary">Log real-time pilotage, tug, or stevedoring activities on the ledger.</p>
           </div>
        </div>
        <Link href="/services" className="port-btn-primary flex items-center gap-3 px-8 py-4">
           <FaPlusCircle /> Start New Log
        </Link>
      </div>

      {/* Service Request Management */}
      <ServiceRequestManagement />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Vessels in Port - Phase 4 */}
        <div className="space-y-6">
          <h4 className="text-lg font-display flex items-center gap-2 text-portaccent uppercase tracking-wider">
            <FaShip className="text-xl" /> Phase 4: Vessels in Port
          </h4>
          <div className="space-y-4">
             {assignments?.length ? assignments.map((v: any) => (
               <div key={v.submissionId} className="port-card p-5 bg-white border border-portmid/50 hover:border-portaccent transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-portbase flex items-center justify-center text-portaccent group-hover:bg-portaccent group-hover:text-white transition-colors">
                        <FaShip />
                     </div>
                     <div>
                        <p className="font-bold text-sm uppercase">{v.vesselName}</p>
                        <p className="text-[10px] text-color-text-muted font-mono">{v.vesselIMO}</p>
                     </div>
                  </div>
                  <Link 
                    href={`/services?vessel=${v.submissionId}`}
                    className="flex items-center gap-2 text-[10px] font-bold text-portaccent uppercase tracking-widest hover:underline"
                  >
                    Action Log <FaPlayCircle className="text-lg" />
                  </Link>
               </div>
             )) : (
               <p className="py-10 text-center text-color-text-sm italic text-color-text-muted">No vessels currently awaiting services</p>
             )}
          </div>
        </div>

        {/* Recent Log Submissions */}
        <div className="space-y-6">
          <h4 className="text-lg font-display flex items-center gap-2 text-color-text-primary uppercase tracking-wider">
            <FaHistory className="text-xl text-color-text-muted" /> Recent Service Logs
          </h4>
          <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
             <div className="divide-y divide-portmid/10">
                {recentLogs?.length ? recentLogs.map((log: any) => (
                  <div key={log.logId} className="p-4 flex items-center justify-between hover:bg-portbase/20 transition-colors">
                     <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-tight text-color-text-primary">{log.serviceType} Log</span>
                        <span className="text-[10px] text-color-text-muted uppercase font-bold tracking-tighter">{log.vesselIMO}</span>
                     </div>
                     <div className="text-right">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          log.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {log.status}
                        </span>
                        <p className="text-[10px] text-color-text-muted mt-1 uppercase font-bold tracking-tighter">
                          {new Date(log.loggedAt).toLocaleTimeString()}
                        </p>
                     </div>
                  </div>
                )) : (
                  <div className="p-10 text-center flex flex-col items-center gap-4">
                     <FaHistory className="text-3xl text-portmid" />
                     <p className="text-sm italic text-color-text-muted">No service logs found for today</p>
                  </div>
                )}
             </div>
             <div className="p-4 bg-portbase/30 text-center">
                <Link href="/services" className="text-[10px] font-bold text-portaccent uppercase tracking-widest hover:underline">View Full Audit Log</Link>
             </div>
          </div>
        </div>
      </div>

      {/* Completed Services for Invoicing - Phase 5 */}
      <div className="space-y-6">
        <h4 className="text-lg font-display flex items-center gap-2 text-emerald-600 uppercase tracking-wider">
          <FaCheckCircle className="text-xl" /> Phase 5: Completed Services (Ready for Invoicing)
        </h4>
        <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
           <div className="divide-y divide-portmid/10">
              {completedLogs?.length ? completedLogs.map((log: any) => (
                <div key={log.logId} className="p-4 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <FaCheckCircle />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase">{log.serviceType}</p>
                        <p className="text-[10px] text-color-text-muted font-mono">{log.vesselIMO}</p>
                      </div>
                   </div>
                   <div className="text-right">
                      <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border border-emerald-200">
                        Ready for Invoice
                      </span>
                      {log.quantity && <p className="text-[10px] text-color-text-muted mt-1">
                        Qty: {log.quantity} {log.quantityUnit || ''}
                      </p>}
                   </div>
                </div>
              )) : (
                <div className="p-10 text-center flex flex-col items-center gap-4">
                   <FaCheckCircle className="text-3xl text-portmid" />
                   <p className="text-sm italic text-color-text-muted">No completed services ready for invoicing</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
