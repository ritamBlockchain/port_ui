'use client';

import { useAuth } from '@/lib/api/auth';
import { Role } from '@/lib/types/portchain';
import { FaUserShield, FaShip, FaGavel, FaIdCard, FaHospital, FaAnchor, FaBox, FaBuilding, FaUniversity, FaTools, FaCheckDouble } from 'react-icons/fa';

const roleConfig: Record<Role, { icon: any; color: string; label: string }> = {
  admin: { icon: FaUserShield, color: 'text-red-500', label: 'Admin' },
  shippingagent: { icon: FaShip, color: 'text-blue-500', label: 'Shipping Agent' },
  customs: { icon: FaGavel, color: 'text-amber-600', label: 'Customs' },
  portauthority: { icon: FaAnchor, color: 'text-indigo-600', label: 'Port Authority' },
  immigration: { icon: FaIdCard, color: 'text-green-600', label: 'Immigration' },
  portHealth: { icon: FaHospital, color: 'text-pink-500', label: 'Port Health' },
  registrar: { icon: FaIdCard, color: 'text-purple-600', label: 'Registrar' },
  carrier: { icon: FaShip, color: 'text-cyan-600', label: 'Carrier' },
  shipper: { icon: FaBox, color: 'text-orange-500', label: 'Shipper' },
  consignee: { icon: FaBuilding, color: 'text-slate-600', label: 'Consignee' },
  banktrade: { icon: FaUniversity, color: 'text-emerald-600', label: 'Bank' },
  serviceprovider: { icon: FaTools, color: 'text-gray-600', label: 'Service Provider' },
  verifier: { icon: FaCheckDouble, color: 'text-teal-600', label: 'Verifier' },
};

export default function RoleSwitcher() {
  const { role, setRole } = useAuth();

  return (
    <div className="flex flex-col gap-2 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-portmid">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-color-text-secondary mb-2">Test Identities</h3>
      <div className="grid grid-cols-1 gap-1 max-h-[400px] overflow-y-auto pr-2">
        {Object.entries(roleConfig).map(([r, config]) => {
          const Icon = config.icon;
          const isActive = role === r;
          return (
            <button
              key={r}
              onClick={() => setRole(r as Role)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                isActive 
                  ? 'bg-portaccent text-white shadow-md scale-[1.02]' 
                  : 'hover:bg-portmid/50 text-color-text-secondary'
              }`}
            >
              <Icon className={isActive ? 'text-white' : config.color} />
              <span className="text-sm font-medium">{config.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
