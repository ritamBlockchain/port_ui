'use client';

import { useAuth } from '@/lib/api/auth';
import { Role } from '@/lib/types/portchain';
import { 
  ShieldCheck, Ship, Scale, Anchor, UserRound, 
  Hospital, FileBadge, Box, Building2, University, 
  Settings, CheckCircle2, Search
} from 'lucide-react';
import { cn } from '@/lib/utils';

const roleConfig: Record<Role, { icon: any; color: string; label: string }> = {
  admin: { icon: ShieldCheck, color: 'text-rose-500', label: 'Admin' },
  shippingagent: { icon: Ship, color: 'text-sky-500', label: 'Shipping Agent' },
  customs: { icon: Scale, color: 'text-amber-500', label: 'Customs' },
  portauthority: { icon: Anchor, color: 'text-indigo-500', label: 'Port Authority' },
  immigration: { icon: UserRound, color: 'text-emerald-500', label: 'Immigration' },
  portHealth: { icon: Hospital, color: 'text-pink-500', label: 'Port Health' },
  registrar: { icon: FileBadge, color: 'text-violet-500', label: 'Registrar' },
  carrier: { icon: Ship, color: 'text-cyan-500', label: 'Carrier' },
  shipper: { icon: Box, color: 'text-orange-500', label: 'Shipper' },
  consignee: { icon: Building2, color: 'text-slate-500', label: 'Consignee' },
  banktrade: { icon: University, color: 'text-teal-500', label: 'Bank' },
  serviceprovider: { icon: Settings, color: 'text-gray-500', label: 'Service Provider' },
  verifier: { icon: CheckCircle2, color: 'text-blue-500', label: 'Verifier' },
};

interface RoleSwitcherProps {
  isCollapsed?: boolean;
}

export default function RoleSwitcher({ isCollapsed }: RoleSwitcherProps) {
  const { role, setRole } = useAuth();

  return (
    <div className={cn(
      "flex flex-col gap-2 transition-all duration-300",
      isCollapsed ? "items-center" : "p-2"
    )}>
      {!isCollapsed && (
        <div className="flex items-center justify-between px-2 mb-1">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/40">Test Identities</h3>
          <Search className="w-3 h-3 text-white/20" />
        </div>
      )}
      
      <div className={cn(
        "grid grid-cols-1 gap-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1",
        isCollapsed ? "max-h-[300px]" : "max-h-[240px]"
      )}>
        {Object.entries(roleConfig).map(([r, config]) => {
          const Icon = config.icon;
          const isActive = role === r;
          
          return (
            <button
              key={r}
              onClick={() => setRole(r as Role)}
              title={config.label}
              className={cn(
                "group relative flex items-center gap-3 rounded-lg transition-all duration-200",
                isCollapsed ? "p-2 justify-center" : "px-3 py-1.5",
                isActive 
                  ? "bg-white/10 text-white ring-1 ring-white/20 shadow-lg" 
                  : "hover:bg-white/5 text-white/60 hover:text-white"
              )}
            >
              <div className={cn(
                "transition-transform duration-200 group-hover:scale-110",
                isActive ? "text-white" : config.color
              )}>
                <Icon size={isCollapsed ? 18 : 16} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              
              {!isCollapsed && (
                <span className="text-xs font-medium truncate">{config.label}</span>
              )}
              
              {isActive && !isCollapsed && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
              )}
              
              {isCollapsed && isActive && (
                <div className="absolute left-0 w-1 h-4 bg-portaccent rounded-r-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

