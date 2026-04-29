'use client';

import { useAuth } from '@/lib/api/auth';
import { useQuery } from '@tanstack/react-query';
import { useSidebar } from '@/lib/context/SidebarContext';
import { FaNetworkWired, FaUserCircle, FaChevronDown, FaBars } from 'react-icons/fa';

export default function Header() {
  const { role, user } = useAuth();
  const { setIsMobileOpen } = useSidebar();

  const { data: health } = useQuery({
    queryKey: ['fabric-health'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/health');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000,
  });

  const isConnected = health?.gateway === 'Connected';

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-8 py-4 mb-6 bg-[#04172F]/95 backdrop-blur-xl border-b border-white/5 animate-in slide-in-from-top duration-700 shadow-xl shadow-black/20">
      
      <div className="flex items-center gap-4 sm:gap-8">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="lg:hidden p-2.5 rounded-xl bg-white/5 text-white hover:bg-white/10 transition-colors"
        >
          <FaBars />
        </button>

        <div className="flex flex-col">
          <h2 className="text-sm sm:text-lg font-black tracking-tight text-white uppercase">
            System <span className="text-sky-400 font-light">Overview</span>
          </h2>
          <div className="hidden sm:flex items-center gap-2 mt-1">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'}`} />
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {isConnected ? `${health.chaincode} / ${health.channel}` : 'Connecting...'}
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT: USER & NOTIFICATIONS ── */}
      <div className="flex items-center gap-6">
        {/* User Profile */}
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-black text-white leading-none">{user}</p>
            <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-1">{role}</p>
          </div>
          
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-tr from-sky-400 to-blue-600 rounded-2xl blur-sm opacity-0 group-hover:opacity-40 transition-opacity" />
            <div className="relative w-11 h-11 rounded-2xl bg-[#0a2a54] border border-white/10 shadow-inner flex items-center justify-center text-white font-black text-lg transition-all group-hover:scale-105 group-hover:border-white/20 overflow-hidden">
              {user?.charAt(0).toUpperCase() || <FaUserCircle />}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#04172F]" />
          </div>
          
          <FaChevronDown className="text-white/20 text-[10px] transition-transform group-hover:translate-y-0.5" />
        </div>
      </div>
    </header>
  );
}
