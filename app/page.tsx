'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/api/auth';
import { FaShip, FaFileAlt, FaCheckCircle, FaAnchor } from 'react-icons/fa';

// Dashboard Components
import ShippingAgentDashboard from '@/components/dashboard/ShippingAgentDashboard';
import RegulatoryDashboard from '@/components/dashboard/RegulatoryDashboard';
import PortAuthorityDashboard from '@/components/dashboard/PortAuthorityDashboard';
import ServiceProviderDashboard from '@/components/dashboard/ServiceProviderDashboard';
import CarrierDashboard from '@/components/dashboard/CarrierDashboard';
import TradeFinanceDashboard from '@/components/dashboard/TradeFinanceDashboard';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import PortChainFlow from '@/components/dashboard/PortChainFlow';

export default function Dashboard() {
  const { role, user } = useAuth();

  // Live Counts from Ledger
  const { data: submissions } = useQuery({
    queryKey: ['pre-arrival-stats-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: ebls } = useQuery({
    queryKey: ['ebl-stats-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/get');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: unanchored, isLoading: loadingAudit } = useQuery({
    queryKey: ['unanchored-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/merkle/unanchored');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: serviceLogs } = useQuery({
    queryKey: ['services-count'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json = await res.json();
      return json.success ? json.data?.length || 0 : 0;
    }
  });

  const { data: health } = useQuery({
    queryKey: ['fabric-health-dashboard'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/health');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  const stats = [
    { label: 'Submissions', value: submissions ?? '...', icon: FaShip, color: 'bg-blue-500' },
    { label: 'eBLs Issued', value: ebls ?? '...', icon: FaFileAlt, color: 'bg-indigo-500' },
    { label: 'Ledger Audit', value: loadingAudit ? '...' : unanchored, icon: FaCheckCircle, color: 'bg-emerald-500' },
    { label: 'Service Logs', value: serviceLogs ?? '...', icon: FaAnchor, color: 'bg-amber-500' },
  ];

  // Role-to-Component Mapping
  const renderRoleDashboard = () => {
    switch (role) {
      case 'shippingagent':
        return <ShippingAgentDashboard />;
      case 'customs':
      case 'immigration':
      case 'portHealth':
        return <RegulatoryDashboard />;
      case 'portauthority':
        return <PortAuthorityDashboard />;
      case 'serviceprovider':
        return <ServiceProviderDashboard />;
      case 'carrier':
        return <CarrierDashboard />;
      case 'shipper':
      case 'consignee':
      case 'banktrade':
        return <TradeFinanceDashboard />;
      case 'registrar':
      case 'admin':
      case 'verifier':
        return <AdminDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Banner */}
      <section className="relative overflow-hidden bg-[#1a2f45] rounded-3xl p-8 text-white shadow-xl border border-white/10">
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-2">
            <span className="bg-portaccent/20 text-portaccent px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border border-portaccent/30">
              Live Network Active
            </span>
          </div>
          <h1 className="text-5xl font-display mb-2">Maritime Ledger Dashboard</h1>
          <p className="opacity-80 max-w-2xl text-sm leading-relaxed">
            Connected as <span className="font-bold text-portaccent uppercase tracking-widest">{role}</span> ({user}).
            Real-time synchronization with <span className="font-mono bg-white/10 px-1 rounded">mychannel</span> is established via Fabric Gateway.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <FaShip className="text-[350px]" />
        </div>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="port-card p-6 flex items-center gap-4 group hover:border-portaccent transition-all bg-white shadow-sm border border-portmid/50">
              <div className={`${stat.color} p-4 rounded-2xl text-white shadow-lg shadow-black/5 transition-transform group-hover:-translate-y-1`}>
                <Icon className="text-2xl" />
              </div>
              <div>
                <p className="text-[10px] text-color-text-secondary font-bold uppercase tracking-[0.15em]">{stat.label}</p>
                <p className="text-2xl font-display text-color-text-primary mt-1">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Complete PortChain Flow Visualization */}
      <div className="pt-4">
        <PortChainFlow />
      </div>

      {/* Role-Specific Content */}
      <div className="pt-4">
        {renderRoleDashboard()}
      </div>

      {/* Global System Health Footer */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-portmid/30 text-[10px] font-bold uppercase tracking-widest text-color-text-muted">
         <div className="flex items-center gap-6">
            <span className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${health?.gateway === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
               Gateway: {health?.gateway || 'Checking...'}
            </span>
            <span className="flex items-center gap-2">
               <div className={`w-2 h-2 rounded-full ${health?.gateway === 'Connected' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
               Org: {health?.org || '...'}
            </span>
         </div>
         <div className="mt-4 md:mt-0">
            Chaincode: {health?.chaincode || '...'} • Channel: {health?.channel || '...'}
         </div>
      </div>
    </div>
  );
}

