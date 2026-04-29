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
        "flex-1 transition-all duration-300 ease-in-out flex flex-col min-w-0",
        "lg:ml-72",
        isCollapsed && "lg:ml-20"
      )}>
        <Header />
        <div className="flex-1 p-4 sm:p-8 pt-0">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
