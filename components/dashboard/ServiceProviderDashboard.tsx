'use client';

import { FaAnchor, FaShip, FaHistory, FaPlusCircle, FaPlayCircle, FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';

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
      return json.success ? json.data?.filter((l: any) => l.providerId === role || l.serviceType?.includes(role)).slice(0, 5) || [] : [];
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="port-card p-8 bg-portsurface/30 border-2 border-dashed border-portmid flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-6">
           <div className="w-16 h-16 rounded-2xl bg-portaccent text-white flex items-center justify-center text-3xl shadow-lg">
              <FaAnchor />
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h4 className="text-lg font-display flex items-center gap-2 text-portaccent uppercase tracking-wider">
            <FaShip className="text-xl" /> Vessels in Port
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

        <div className="space-y-6">
          <h4 className="text-lg font-display flex items-center gap-2 text-color-text-primary uppercase tracking-wider">
            <FaHistory className="text-xl text-color-text-muted" /> Recent Log Submissions
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
    </div>
  );
}
