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
  const { isCollapsed, toggleSidebar } = useSidebar();
  const [showDevTools, setShowDevTools] = useState(true);

  return (
    <aside 
      className={cn(
        "bg-[#0f172a] text-white flex flex-col h-screen fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out border-r border-white/5 shadow-[4px_0_24px_rgba(0,0,0,0.3)]",
        isCollapsed ? "w-20" : "w-72"
      )}
    >
      {/* Sidebar Header */}
      <div className={cn(
        "p-6 flex items-center transition-all duration-300",
        isCollapsed ? "justify-center" : "justify-between"
      )}>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-portaccent to-portaccent/60 flex items-center justify-center text-white shadow-[0_0_15px_rgba(118,159,205,0.4)]">
            <Anchor size={24} strokeWidth={2.5} />
          </div>
          {!isCollapsed && (
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
        
        {!isCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        )}
      </div>

      {isCollapsed && (
        <button 
          onClick={toggleSidebar}
          className="mx-auto my-2 p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors"
        >
          <ChevronRight size={18} />
        </button>
      )}

      {/* Main Navigation */}
      <div className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar space-y-8">
        <nav className="space-y-1">
          <Link
            href="/"
            className={cn(
              "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
              isCollapsed ? "p-3 justify-center" : "px-4 py-3",
              pathname === '/' 
                ? "bg-white/10 text-white font-semibold ring-1 ring-white/20 shadow-lg shadow-black/20" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            )}
          >
            <LayoutDashboard size={20} className={cn(pathname === '/' ? "text-portaccent" : "group-hover:text-portaccent transition-colors")} />
            {!isCollapsed && <span>Unified Dashboard</span>}
            {pathname === '/' && (
              <div className="absolute left-0 w-1 h-6 bg-portaccent rounded-r-full shadow-[0_0_10px_rgba(118,159,205,0.8)]" />
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
              {!isCollapsed && (
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
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group relative flex items-center gap-3 rounded-xl transition-all duration-200",
                        isCollapsed ? "p-3 justify-center" : "px-4 py-2.5 text-sm",
                        isActive 
                          ? "bg-white/10 text-white font-medium ring-1 ring-white/10" 
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <Icon size={isCollapsed ? 20 : 18} className={cn(isActive ? "text-portaccent" : "group-hover:text-portaccent/80 transition-colors")} />
                      {!isCollapsed && <span>{item.label}</span>}
                      {isActive && (
                        <div className="absolute left-0 w-1 h-4 bg-portaccent/60 rounded-r-full" />
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
        {!isCollapsed && (
          <div className="px-2">
            <button 
              onClick={() => setShowDevTools(!showDevTools)}
              className={cn(
                "flex items-center justify-between w-full p-2 rounded-lg transition-all",
                showDevTools ? "bg-white/5 text-portaccent" : "text-white/30 hover:text-white/60 hover:bg-white/5"
              )}
            >
              <div className="flex items-center gap-2">
                <Code2 size={14} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-inherit">Dev Mode</span>
              </div>
              <div className={cn(
                "w-6 h-3 rounded-full relative transition-colors duration-200",
                showDevTools ? "bg-portaccent" : "bg-white/10"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-2 h-2 rounded-full bg-white transition-all duration-200",
                  showDevTools ? "right-0.5" : "left-0.5"
                )} />
              </div>
            </button>
          </div>
        )}

        {showDevTools && (
          <div className="bg-black/20 rounded-xl overflow-hidden border border-white/5">
            <RoleSwitcher isCollapsed={isCollapsed} />
          </div>
        )}

        {/* User Profile */}
        <div className={cn(
          "flex items-center gap-3 p-3 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 transition-all duration-300",
          isCollapsed ? "justify-center p-2" : ""
        )}>
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-portaccent/40 to-portaccent/10 border border-white/20 flex items-center justify-center text-white">
              <UserCircle size={24} strokeWidth={1.5} />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0f172a] shadow-sm" />
          </div>
          
          {!isCollapsed && (
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-semibold text-white truncate capitalize">
                {role.replace(/([A-Z])/g, ' $1').trim()}
              </span>
              <span className="text-[10px] text-white/40 font-medium uppercase tracking-tighter">
                Active Session
              </span>
            </div>
          )}
          
          {!isCollapsed && (
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
  );
}


