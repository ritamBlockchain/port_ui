'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/api/auth';
import { 
  LayoutDashboard, Ship, FileText, BadgeCheck, 
  Anchor, Gavel, Building2, HardHat, FileSignature, 
  ChevronLeft, ChevronRight, UserCircle, Settings,
  LogOut, Code2
} from 'lucide-react';
import RoleSwitcher from './RoleSwitcher';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/lib/context/SidebarContext';

const phases = [
  {
    title: 'Pre-Arrival',
    items: [
      { href: '/pre-arrival', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'shippingagent', 'customs', 'portauthority', 'immigration', 'portHealth'] },
      { href: '/pre-arrival/new', label: 'Submit Notice', icon: Ship, roles: ['shippingagent', 'admin'] },
    ]
  },
  {
    title: 'Approvals',
    items: [
      { href: '/pre-arrival', label: 'Multi-Agency Review', icon: Gavel, roles: ['customs', 'immigration', 'portHealth', 'admin'] },
    ]
  },
  {
    title: 'Operations',
    items: [
      { href: '/berth', label: 'Berth Management', icon: Building2, roles: ['portauthority', 'admin'] },
      { href: '/services', label: 'Port Services', icon: HardHat, roles: ['admin', 'shippingagent', 'serviceprovider', 'carrier', 'portauthority'] },
    ]
  },
  {
    title: 'E-Documents',
    items: [
      { href: '/invoices', label: 'Financial Settlement', icon: FileText, roles: ['admin', 'portauthority', 'shippingagent', 'carrier'] },
      { href: '/ebl/drafts', label: 'Create EBL', icon: FileSignature, roles: ['admin', 'carrier', 'shipper'] },
      { href: '/ebl', label: 'Issue & Transfer', icon: FileSignature, roles: ['admin', 'carrier', 'shipper', 'consignee', 'banktrade'] },
    ]
  },
  {
    title: 'Verification',
    items: [
      { href: '/credentials', label: 'Digital Credentials', icon: BadgeCheck, roles: ['admin', 'registrar', 'portauthority', 'verifier', 'carrier', 'customs', 'immigration', 'portHealth'] },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();
  const { isCollapsed, isMobileOpen, setIsMobileOpen, setIsCollapsed } = useSidebar();
  const [showDevTools, setShowDevTools] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        onMouseEnter={() => { if (window.innerWidth >= 1024) setIsCollapsed(false); }}
        onMouseLeave={() => { if (window.innerWidth >= 1024) setIsCollapsed(true); }}
        className={cn(
          "bg-[#04172F] text-white flex flex-col h-screen fixed left-0 top-0 z-[70] transition-all duration-300 ease-in-out border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.3)]",
          "lg:translate-x-0",
          isMobileOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
          isCollapsed ? "lg:w-20" : "lg:w-72"
        )}
      >
        {/* Sidebar Header */}
        <div className={cn(
          "p-6 flex items-center transition-all duration-300",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.4)]">
              <Anchor size={24} strokeWidth={2.5} />
            </div>
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col">
                <h1 className="text-xl font-display font-bold tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                  PortChain
                </h1>
                <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold -mt-1">
                  Blockchain Ledger
                </span>
              </div>
            )}
          </div>
          
          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button 
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden p-2 rounded-lg bg-white/5 text-white/40 hover:text-white"
            >
              <ChevronLeft size={20} />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <nav className="space-y-1">
            <Link
              href="/"
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                isCollapsed && !isMobileOpen ? "p-3 justify-center" : "px-4 py-3",
                pathname === '/' 
                  ? "bg-[#12386b]/40 text-white font-semibold ring-1 ring-white/10 shadow-lg shadow-black/20" 
                  : "text-slate-400 hover:text-white hover:bg-[#0a2a54]/50"
              )}
            >
              <LayoutDashboard size={20} className={cn(pathname === '/' ? "text-sky-400" : "group-hover:text-sky-400 transition-colors")} />
              {(!isCollapsed || isMobileOpen) && <span>Unified Dashboard</span>}
              {pathname === '/' && (
                <div className="absolute left-0 w-1 h-6 bg-sky-400 rounded-r-full shadow-[0_0_10px_rgba(56,189,248,0.8)]" />
              )}
            </Link>
          </nav>

          {phases.map((phase, idx) => {
            const visibleItems = phase.items.filter(item => 
              item.roles.includes('admin') || item.roles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                {(!isCollapsed || isMobileOpen) && (
                  <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
                    {phase.title}
                  </h3>
                )}
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={`${idx}-${item.href}`}
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        title={isCollapsed && !isMobileOpen ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                          isCollapsed && !isMobileOpen ? "p-3 justify-center" : "px-4 py-2.5 text-sm",
                          isActive 
                            ? "bg-[#12386b]/30 text-white font-medium ring-1 ring-white/10" 
                            : "text-slate-400 hover:text-white hover:bg-[#0a2a54]/40"
                        )}
                      >
                        <Icon size={isCollapsed && !isMobileOpen ? 20 : 18} className={cn(isActive ? "text-sky-400" : "group-hover:text-sky-300 transition-colors")} />
                        {(!isCollapsed || isMobileOpen) && <span>{item.label}</span>}
                        {isActive && (
                          <div className="absolute left-0 w-1 h-4 bg-sky-400/60 rounded-r-full" />
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 mt-auto space-y-4">
          {/* Developer Tools Toggle */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-2">
              <button 
                onClick={() => setShowDevTools(!showDevTools)}
                className={cn(
                  "flex items-center justify-between w-full p-2.5 rounded-xl transition-all",
                  showDevTools ? "bg-[#12386b]/40 text-sky-400" : "text-white/30 hover:text-white/60 hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-2">
                  <Code2 size={16} />
                  <span className="text-[10px] font-black uppercase tracking-wider">Dev Mode</span>
                </div>
                <div className={cn(
                  "w-9 h-5 rounded-full relative transition-colors duration-300",
                  showDevTools ? "bg-sky-500" : "bg-white/10"
                )}>
                  <div className={cn(
                    "absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 shadow-sm",
                    showDevTools ? "left-5" : "left-1"
                  )} />
                </div>
              </button>
            </div>
          )}

          {showDevTools && (
            <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
              <RoleSwitcher isCollapsed={isCollapsed && !isMobileOpen} />
            </div>
          )}

          {/* User Profile */}
          <div className={cn(
            "flex items-center gap-3 p-3 bg-gradient-to-br from-[#0a2a54] to-[#04172F] rounded-2xl border border-white/10 transition-all duration-300",
            isCollapsed && !isMobileOpen ? "justify-center p-2" : ""
          )}>
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-portaccent/40 to-portaccent/10 border border-white/20 flex items-center justify-center text-white">
                <UserCircle size={24} strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0f172a] shadow-sm" />
            </div>
            
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-white truncate capitalize">
                  {role.replace(/([A-Z])/g, ' $1').trim()}
                </span>
                <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">
                  Active Session
                </span>
              </div>
            )}
            
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex flex-col gap-1">
                <button className="p-1 rounded-md hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                  <Settings size={14} />
                </button>
                <button className="p-1 rounded-md hover:bg-white/10 text-rose-400 hover:text-rose-300 transition-colors">
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}


