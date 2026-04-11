'use client';

import { useAuth } from '@/lib/api/auth';
import { Role } from '@/lib/types/portchain';
import { FaCheckCircle, FaTimesCircle, FaCommentAlt, FaShieldAlt } from 'react-icons/fa';
import { useState } from 'react';
import { toast } from 'sonner';

import { usePreArrival } from '@/hooks/usePreArrival';

export default function ApprovalPanel({ submissionId }: { submissionId: string }) {
  const { role } = useAuth();
  const [comments, setComments] = useState('');
  const { approve, isApproving } = usePreArrival(submissionId);

  const agencyRoles: Role[] = ['customs', 'portauthority', 'immigration', 'portHealth'];
  const canApprove = agencyRoles.includes(role);

  const handleAction = async (approved: boolean) => {
    approve({
      submissionId,
      agency: role,
      comments,
      approved
    });
  };

  if (!canApprove) {
    return (
      <div className="port-card p-6 bg-portsurface/50 border-dashed">
        <div className="flex items-center gap-3 text-color-text-muted">
          <FaShieldAlt className="text-xl" />
          <p className="text-sm italic">You are viewing this as "{role}". Only regulatory agencies can perform approval actions.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="port-card overflow-hidden shadow-lg border-2 border-portaccent/20">
      <div className="bg-portaccent p-4 text-white flex items-center justify-between">
        <h3 className="font-display text-lg flex items-center gap-2">
          <FaShieldAlt /> Regulatory Approval Panel
        </h3>
        <span className="text-[10px] bg-white/20 px-2 py-1 rounded font-bold uppercase tracking-widest leading-none">
          Active Role: {role}
        </span>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary flex items-center gap-2">
            <FaCommentAlt /> Review Comments
          </label>
          <textarea 
            className="port-input w-full min-h-[100px] resize-none"
            placeholder="Enter compliance notes, findings, or reasons for rejection..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <button 
            disabled={isApproving}
            onClick={() => handleAction(true)}
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaCheckCircle /> Approve Entry
          </button>
          <button 
            disabled={isApproving}
            onClick={() => handleAction(false)}
            className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 rounded-xl shadow-md shadow-rose-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <FaTimesCircle /> Deny / Hold
          </button>
        </div>
        
        <p className="text-[10px] text-center text-color-text-muted">
          Proceeding will cryptographically sign this transaction with the <span className="font-bold underline">{role}</span> identity wallet.
        </p>
      </div>
    </div>
  );
}
