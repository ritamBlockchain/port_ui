import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PortServiceLog, FabricResponse } from '@/lib/types/portchain';
import { toast } from 'sonner';

export function useServices() {
  const queryClient = useQueryClient();

  const { data: logs, isLoading, error, refetch } = useQuery({
    queryKey: ['port-services-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/services/all');
      const json: FabricResponse<PortServiceLog[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
  });

  const startServiceMutation = useMutation({
    mutationFn: async (data: { 
      submissionId: string; 
      serviceType: string; 
      providerName: string; 
      providerId?: string;
      requestId?: string;
      logId?: string;
      assignmentId?: string;
      quantityUnit?: string;
    }) => {
      const res = await fetch('/api/fabric/services/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Service started and logged to ledger');
      queryClient.invalidateQueries({ queryKey: ['port-services-list'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to start service: ${err.message}`);
    },
  });

  const completeServiceMutation = useMutation({
    mutationFn: async (data: { logId: string; durationMins: number; remarks: string }) => {
      const res = await fetch('/api/fabric/services/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Service completed and finalized on blockchain');
      queryClient.invalidateQueries({ queryKey: ['port-services-list'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to complete service: ${err.message}`);
    },
  });

  const disputeMutation = useMutation({
    mutationFn: async (data: { action: 'raise' | 'resolve'; logId: string; reason?: string; resolution?: string }) => {
      const res = await fetch('/api/fabric/services/dispute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (_, variables) => {
      toast.success(`Service dispute ${variables.action === 'raise' ? 'raised' : 'resolved'} successfully`);
      queryClient.invalidateQueries({ queryKey: ['port-services-list'] });
    },
    onError: (err: any) => {
      toast.error(`Operation failed: ${err.message}`);
    },
  });

  return {
    logs,
    isLoading,
    error,
    refetch,
    startService: startServiceMutation.mutate,
    isStarting: startServiceMutation.isPending,
    completeService: completeServiceMutation.mutate,
    isCompleting: completeServiceMutation.isPending,
    dispute: disputeMutation.mutate,
    isDisputing: disputeMutation.isPending,
    cancelService: useMutation({
      mutationFn: async (data: { logId: string; reason: string }) => {
        const res = await fetch('/api/fabric/services/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.error);
        return json;
      },
      onSuccess: () => {
        toast.success('Service request cancelled successfully');
        queryClient.invalidateQueries({ queryKey: ['port-services-list'] });
      },
      onError: (err: any) => {
        toast.error(`Cancellation failed: ${err.message}`);
      },
    }).mutate
  };
}
