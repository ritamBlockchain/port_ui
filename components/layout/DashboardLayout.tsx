'use client';

import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useSidebar } from '@/lib/context/SidebarContext';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  
  return (
    <div className="flex bg-[#F7FBFC] min-h-screen">
      <Sidebar />
      <main className={cn(
        "flex-1 p-8 transition-all duration-300 ease-in-out",
        isCollapsed ? "ml-20" : "ml-72"
      )}>
        <Header />
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
