import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PreArrivalSubmission, FabricResponse } from '@/lib/types/portchain';
import { toast } from 'sonner';

export function usePreArrival(submissionId?: string) {
  const queryClient = useQueryClient();

  // Fetch single submission
  const { data: submission, isLoading, error, refetch } = useQuery({
    queryKey: ['pre-arrival', submissionId],
    queryFn: async () => {
      if (!submissionId) return null;
      const res = await fetch(`/api/fabric/pre-arrival/get?id=${submissionId}`);
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Failed to fetch submission');
      }
      const json: FabricResponse<PreArrivalSubmission> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!submissionId,
  });

  // Submit new submission
  const submitMutation = useMutation({
    mutationFn: async (formData: any) => {
      const res = await fetch('/api/fabric/pre-arrival/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Submission failed');
      }
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Pre-Arrival submitted to ledger successfully');
      queryClient.invalidateQueries({ queryKey: ['pre-arrival-list'] });
    },
    onError: (err: any) => {
      toast.error(`Submission failed: ${err.message}`);
    },
  });

  // Regulatory Approval
  const approveMutation = useMutation({
    mutationFn: async ({ submissionId, agency, comments, approved }: any) => {
      const res = await fetch('/api/fabric/pre-arrival/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId, agency, comments, approved }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Approval status updated on blockchain');
      queryClient.invalidateQueries({ queryKey: ['pre-arrival'] });
    },
    onError: (err: any) => {
      toast.error(`Approval failed: ${err.message}`);
    },
  });

  // Validate Compliance
  const validateComplianceMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ submissionId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Automated compliance check completed on ledger');
      queryClient.invalidateQueries({ queryKey: ['pre-arrival'] });
      queryClient.invalidateQueries({ queryKey: ['pre-arrival-list'] });
    },
    onError: (err: any) => {
      toast.error(`Validation failed: ${err.message}`);
    },
  });

  return {
    submission,
    isLoading,
    error,
    refetch,
    submit: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    approve: approveMutation.mutate,
    isApproving: approveMutation.isPending,
    validateCompliance: validateComplianceMutation,
    overrideCompliance: useMutation({
      mutationFn: async ({ newStatus, reason }: { newStatus: string; reason: string }) => {
        const res = await fetch('/api/fabric/pre-arrival/override', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, newStatus, reason }),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        return json;
      },
      onSuccess: () => {
        toast.success('Compliance status overridden on blockchain');
        queryClient.invalidateQueries({ queryKey: ['pre-arrival'] });
        queryClient.invalidateQueries({ queryKey: ['pre-arrival-list'] });
      },
      onError: (err: any) => {
        toast.error(`Override failed: ${err.message}`);
      },
    }),
  };
}

export function usePreArrivalList() {
  return useQuery({
    queryKey: ['pre-arrival-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/pre-arrival/all');
      if (!res.ok) {
         const errorData = await res.json();
         throw new Error(errorData.error || 'Failed to fetch submissions');
      }
      const json: FabricResponse<PreArrivalSubmission[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
  });
}
