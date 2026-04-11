'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Role } from '@/lib/types/portchain';

interface AuthContextType {
  role: Role;
  setRole: (role: Role) => void;
  user: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('admin');
  const [user, setUser] = useState('Admin User');

  // Load from localStorage on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('portchain-role') as Role;
    if (savedRole) {
      setRoleState(savedRole);
    }
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    localStorage.setItem('portchain-role', newRole);
    
    // Mock user name based on role
    const names: Record<Role, string> = {
      admin: 'Global Admin',
      shippingagent: 'Mariner Agency',
      customs: 'National Customs',
      portauthority: 'Main Port Authority',
      immigration: 'Border Control',
      portHealth: 'Health Inspector',
      registrar: 'Ship Registrar',
      carrier: 'Oceanic Carrier',
      shipper: 'Global Exports Ltd',
      consignee: 'Import Logistics',
      banktrade: 'Trade Finance Bank',
      serviceprovider: 'Marine Services Corp',
      verifier: 'Quality Auditor'
    };
    setUser(names[newRole] || 'User');
  };

  return (
    <AuthContext.Provider value={{ role, setRole, user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
