'use client';

import { useAuth } from '@/lib/api/auth';
import { useQuery } from '@tanstack/react-query';

export default function Header() {
  const { role, user } = useAuth();

  const { data: health } = useQuery({
    queryKey: ['fabric-health'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/health');
      const json = await res.json();
      return json.data;
    },
    refetchInterval: 30000, // ping every 30s
  });

  const isConnected = health?.gateway === 'Connected';

  return (
    <header className="flex justify-between items-center mb-8 bg-white/40 backdrop-blur-md p-4 rounded-xl border border-portmid/50">
      <div className="flex flex-col">
        <h2 className="text-xl font-display text-portaccent">System Overview</h2>
        <p className="text-sm text-color-text-secondary flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isConnected ? `${health.chaincode} on ${health.channel}` : 'Connecting to Fabric...'}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-bold text-color-text-primary">{user}</p>
          <p className="text-xs text-color-text-secondary uppercase tracking-widest">{role}</p>
        </div>
        <div className="w-10 h-10 rounded-full bg-portaccent flex items-center justify-center text-white font-bold border-2 border-white shadow-sm">
          {user?.charAt(0) || 'U'}
        </div>
      </div>
    </header>
  );
}
