'use client';

import { FaUniversity, FaBox, FaBuilding, FaExchangeAlt, FaFileContract, FaArrowRight, FaClock } from 'react-icons/fa';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';

export default function TradeFinanceDashboard() {
  const { role, user } = useAuth();
  
  const { data: myHoldings } = useQuery({
    queryKey: ['my-ebl-holdings', role],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/all');
      const json = await res.json();
      if (!json.success) return [];
      
      // In a real app, we'd filter by currentHolder or identity
      // For demo, we'll show all where status is transferred/issued and role matches
      return json.data?.filter((ebl: any) => ebl.status !== 'surrendered') || [];
    }
  });

  const config = {
    banktrade: { icon: FaUniversity, color: 'text-emerald-600', label: 'Trade Finance' },
    shipper: { icon: FaBox, color: 'text-orange-500', label: 'Export Logistics' },
    consignee: { icon: FaBuilding, color: 'text-indigo-600', label: 'Import Operations' }
  }[role as string] || { icon: FaFileContract, color: 'text-portaccent', label: 'Trade Participant' };

  const Icon = config.icon;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="port-card p-8 bg-white border border-portmid shadow-sm flex flex-col md:flex-row items-center gap-8">
         <div className={`w-20 h-20 rounded-3xl bg-portbase ${config.color} flex items-center justify-center text-4xl shadow-inner`}>
            <Icon />
         </div>
         <div className="flex-1">
            <h3 className="text-3xl font-display text-color-text-primary mb-2">Trade Asset Management</h3>
            <p className="text-color-text-secondary">
               Welcome back, <span className="font-bold text-portaccent uppercase tracking-widest">{user}</span>. 
               Manage your digital title documents and execute secure transfers on the blockchain.
            </p>
         </div>
         <Link href="/ebl" className="bg-portaccent text-white px-8 py-4 rounded-2xl font-bold uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-portaccent/20 transition-all flex items-center gap-3">
            <FaExchangeAlt /> Negotiate Title
         </Link>
      </div>

      <div className="space-y-6">
        <h4 className="text-xl font-display text-color-text-primary flex items-center gap-2">
           <FaFileContract className="text-portaccent" /> Digital Titles in Possession
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {myHoldings?.length ? myHoldings.map((ebl: any) => (
             <div key={ebl.eblId} className="port-card bg-white border border-portmid/50 hover:shadow-xl hover:border-portaccent transition-all group overflow-hidden">
                <div className="p-6 bg-portbase/40 border-b border-portmid/20 flex justify-between items-start">
                   <div>
                      <p className="text-[10px] font-bold text-color-text-muted uppercase tracking-widest">e-Bill of Lading</p>
                      <h5 className="text-lg font-display text-color-text-primary">{ebl.blNumber}</h5>
                   </div>
                   <div className="text-right">
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-100 text-indigo-600">
                         {ebl.status}
                      </span>
                   </div>
                </div>
                <div className="p-6 space-y-4">
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-color-text-secondary font-bold uppercase tracking-tighter">Vessel</span>
                      <span className="font-medium">{ebl.vesselName}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-color-text-secondary font-bold uppercase tracking-tighter">Destination</span>
                      <span className="font-medium">{ebl.portOfDischarge}</span>
                   </div>
                   <div className="flex justify-between items-center text-xs">
                      <span className="text-color-text-secondary font-bold uppercase tracking-tighter">Issue Date</span>
                      <span className="font-mono">{new Date(ebl.issuedAt).toLocaleDateString()}</span>
                   </div>
                   
                   <div className="pt-4 border-t border-portmid/10 flex gap-2">
                       <Link 
                        href={`/ebl/${ebl.eblId}`}
                        className="flex-1 bg-white border border-portmid hover:border-portaccent hover:text-portaccent py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center transition-all"
                       >
                         Transfer
                       </Link>
                       {role === 'consignee' && (
                         <Link 
                           href={`/ebl/${ebl.eblId}`}
                           className="flex-1 bg-indigo-600 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest text-center hover:bg-indigo-700 transition-all"
                         >
                           Surrender
                         </Link>
                       )}
                   </div>
                </div>
             </div>
           )) : (
             <div className="col-span-full py-20 text-center bg-portbase/30 rounded-3xl border-2 border-dashed border-portmid">
                <FaFileContract className="text-5xl text-portmid mx-auto mb-4" />
                <h4 className="text-xl font-display text-color-text-secondary">No Titles Held</h4>
                <p className="text-sm text-color-text-muted">You do not currently have any electronic bills of lading assigned to your identity.</p>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
