'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/api/auth';
import { 
  FaChartPie, FaShip, FaFileInvoice, FaCertificate, FaAnchor, 
  FaSignature, FaBuilding, FaGavel, FaTools, FaFileContract 
} from 'react-icons/fa';
import RoleSwitcher from './RoleSwitcher';

const phases = [
  {
    title: 'Phase 1: Pre-Arrival (2-7 Days)',
    items: [
      { href: '/pre-arrival', label: 'Pre-Arrival Notifications', icon: FaShip, roles: ['admin', 'shippingagent', 'customs', 'portauthority', 'immigration', 'portHealth'] },
      { href: '/pre-arrival/new', label: 'Submit Pre-Arrival', icon: FaShip, roles: ['shippingagent', 'admin'] },
    ]
  },
  {
    title: 'Phase 2: Agency Approval (1-3 Days)',
    items: [
      { href: '/pre-arrival', label: 'Multi-Agency Review', icon: FaGavel, roles: ['customs', 'immigration', 'portHealth', 'admin'] },
    ]
  },
  {
    title: 'Phase 3: Berth Assignment',
    items: [
      { href: '/berth', label: 'Assign Berth', icon: FaBuilding, roles: ['portauthority', 'admin'] },
    ]
  },
  {
    title: 'Phase 4: Port Services (Day of Arrival)',
    items: [
      { href: '/services', label: 'Request Services', icon: FaAnchor, roles: ['admin', 'shippingagent', 'serviceprovider', 'carrier'] },
      { href: '/services', label: 'Service Execution', icon: FaTools, roles: ['admin', 'serviceprovider', 'portauthority'] },
    ]
  },
  {
    title: 'Phase 5: Invoicing & Settlement',
    items: [
      { href: '/invoices', label: 'Generate Invoice', icon: FaFileInvoice, roles: ['admin', 'portauthority'] },
      { href: '/invoices', label: 'Confirm Payment', icon: FaFileInvoice, roles: ['admin', 'shippingagent', 'carrier'] },
    ]
  },
  {
    title: 'Phase 6: Electronic Bill of Lading',
    items: [
      { href: '/ebl/drafts', label: 'Create Draft EBL', icon: FaFileContract, roles: ['admin', 'carrier', 'shipper'] },
      { href: '/ebl', label: 'Issue & Transfer EBL', icon: FaFileContract, roles: ['admin', 'carrier', 'shipper', 'consignee', 'banktrade'] },
    ]
  },
  {
    title: 'Phase 7: Digital Credentials',
    items: [
      { href: '/credentials', label: 'Issue Credentials', icon: FaCertificate, roles: ['admin', 'registrar', 'portauthority'] },
      { href: '/credentials', label: 'Verify Credentials', icon: FaCertificate, roles: ['admin', 'verifier', 'carrier', 'customs', 'immigration', 'portHealth'] },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { role } = useAuth();

  return (
    <aside className="w-64 bg-[#1a2f45] text-white flex flex-col h-screen fixed left-0 top-0 shadow-2xl z-20 border-r border-white/5">
      <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 rounded-xl bg-portaccent flex items-center justify-center text-white shadow-lg shadow-portaccent/20">
            <FaAnchor className="text-xl" />
          </div>
          <h1 className="text-2xl font-display font-bold tracking-tight">PortChain</h1>
        </div>

        <nav className="space-y-8">
          <div>
            <Link
              href="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 ${
                pathname === '/' 
                  ? 'bg-portaccent text-white font-bold shadow-lg shadow-portaccent/20' 
                  : 'hover:bg-white/10 opacity-70 text-white'
              }`}
            >
              <FaChartPie />
              <span>Unified Dashboard</span>
            </Link>
          </div>

          {phases.map((phase, idx) => {
            const visibleItems = phase.items.filter(item => 
              item.roles.includes('admin') || item.roles.includes(role)
            );

            if (visibleItems.length === 0) return null;

            return (
              <div key={idx} className="space-y-2">
                <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-portaccent/60">
                  {phase.title}
                </h3>
                <div className="space-y-1">
                  {visibleItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${
                          isActive 
                            ? 'bg-white/10 text-white font-semibold border border-white/10' 
                            : 'hover:bg-white/5 opacity-60 hover:opacity-100 text-white'
                        }`}
                      >
                        <Icon className="text-xs" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 bg-black/20 backdrop-blur-md">
        <RoleSwitcher />
      </div>
    </aside>
  );
}

