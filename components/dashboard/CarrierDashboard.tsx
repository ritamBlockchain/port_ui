'use client';

import { FaShip, FaFileContract, FaPlus, FaCheckCircle, FaExchangeAlt, FaArrowRight, FaEdit, FaLock, FaCertificate, FaBolt } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';

export default function CarrierDashboard() {
  const { data: drafts } = useQuery({
    queryKey: ['ebl-drafts'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/drafts');
      const json = await res.json();
      return json.success ? json.data || [] : [];
    }
  });

  const { data: ebls } = useQuery({
    queryKey: ['carrier-ebls'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/all');
      const json = await res.json();
      return json.success ? json.data?.slice(0, 5) || [] : [];
    }
  });

  // Stakeholder Journey Steps
  const journeySteps = [
    { id: 1, title: 'Create Draft EBL', description: 'Initialize cargo title', icon: FaPlus, status: 'active' },
    { id: 2, title: 'Collaborative Revision', description: 'Revise with shipper', icon: FaEdit, status: 'pending' },
    { id: 3, title: 'Commit Draft', description: 'Finalize for issuance', icon: FaLock, status: 'pending' },
    { id: 4, title: 'Issue Official EBL', description: 'Mint on blockchain', icon: FaCertificate, status: 'pending' },
    { id: 5, title: 'Transfer EBL', description: 'Transfer to consignee', icon: FaExchangeAlt, status: 'pending' }
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stakeholder Journey Banner */}
      <div className="port-card p-6 bg-gradient-to-r from-[#1a2f45] to-[#2a4a6f] text-white rounded-2xl shadow-xl border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-display font-bold mb-1">Carrier EBL Journey</h3>
            <p className="text-sm opacity-80">Instant transfer vs 5-7 days for paper, 60% reduction in document handling costs</p>
          </div>
          <div className="bg-portaccent/20 px-4 py-2 rounded-xl border border-portaccent/30">
            <p className="text-2xl font-display font-bold text-portaccent">60%</p>
            <p className="text-[10px] uppercase tracking-widest text-portaccent">Cost Reduction</p>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/ebl/draft/new" className="port-card p-8 bg-[#1a2f45] text-white group hover:shadow-2xl hover:shadow-indigo-900/40 transition-all border-none relative overflow-hidden">
          <div className="relative z-10 flex justify-between items-start mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl">
              <FaPlus />
            </div>
            <FaFileContract className="text-4xl opacity-20 group-hover:scale-125 transition-transform" />
          </div>
          <h3 className="relative z-10 text-2xl font-display mb-2">Create Draft EBL</h3>
          <p className="relative z-10 text-sm opacity-70 leading-relaxed max-w-xs">Initialize electronic bill of lading with version control enabled.</p>
          <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-4">
            Phase 6: Step 1 <FaArrowRight />
          </div>
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-x-[-20%] -translate-y-[-20%]" />
        </Link>

        <div className="port-card p-8 bg-white border border-portmid flex flex-col justify-between">
           <div>
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-color-text-muted mb-4 border-l-2 border-indigo-600 pl-3">Collaborative Drafting</h4>
              <p className="text-2xl font-display text-color-text-primary mb-2">{drafts?.length || 0} Pending Drafts</p>
              <p className="text-sm text-color-text-secondary leading-relaxed mb-6">Review and commit e-BL drafts submitted by shippers for final issuance.</p>
           </div>
           <Link href="/ebl/drafts" className="text-sm font-bold text-portaccent uppercase tracking-widest hover:underline flex items-center gap-2 mt-4">
              Review Pipeline <FaArrowRight />
           </Link>
        </div>
      </div>

      {/* Phase 6: Electronic Bill of Lading Registry */}
      <div className="space-y-6">
        <h4 className="text-xl font-display text-color-text-primary flex items-center gap-2">
          <FaFileContract className="text-indigo-600" /> Phase 6: Electronic Bill of Lading Registry
        </h4>
        
        <div className="port-card bg-white border border-portmid/50 overflow-hidden shadow-sm">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-portmid/20 text-[10px] font-bold uppercase tracking-widest text-color-text-secondary">
                       <th className="px-6 py-4">Title ID / BL #</th>
                       <th className="px-6 py-4">Vessel / Voyage</th>
                       <th className="px-6 py-4">Current Holder</th>
                       <th className="px-6 py-4">Status</th>
                       <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-portmid/10">
                    {ebls?.length ? ebls.map((ebl: any) => (
                      <tr key={ebl.eblId} className="hover:bg-portbase/20 transition-colors">
                         <td className="px-6 py-4">
                            <p className="text-sm font-bold font-mono">{ebl.eblId}</p>
                            <p className="text-[10px] text-color-text-muted font-bold tracking-widest">{ebl.blNumber}</p>
                         </td>
                         <td className="px-6 py-4">
                            <p className="text-xs uppercase font-bold text-color-text-primary">{ebl.vesselName}</p>
                            <p className="text-[10px] text-color-text-muted font-mono">{ebl.voyageNumber}</p>
                         </td>
                         <td className="px-6 py-4">
                            <span className="text-[10px] font-bold uppercase py-1 px-2 bg-portbase rounded border border-portmid">
                               {ebl.currentHolder}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-center">
                            <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                              ebl.status === 'surrendered' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                              ebl.status === 'issued' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 
                              ebl.status === 'transferred' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                              'bg-gray-50 text-gray-600 border-gray-200'
                            }`}>
                               {ebl.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right">
                            <Link href={`/ebl/${ebl.eblId}`} className="text-xs font-bold text-portaccent hover:underline uppercase tracking-widest">
                               View History
                            </Link>
                         </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-10 text-center text-color-text-muted italic">No e-Bill of Lading records found on the ledger</td>
                      </tr>
                    )}
                 </tbody>
              </table>
           </div>
        </div>
      </div>
    </div>
  );
}
