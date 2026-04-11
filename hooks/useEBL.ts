import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { EBL, FabricResponse } from '@/lib/types/portchain';
import { toast } from 'sonner';

export function useEBL(eblId?: string) {
  const queryClient = useQueryClient();

  const { data: ebl, isLoading, error, refetch } = useQuery({
    queryKey: ['ebl', eblId],
    queryFn: async () => {
      if (!eblId) return null;
      const res = await fetch(`/api/fabric/ebl/get?id=${eblId}`);
      const json: FabricResponse<EBL> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!eblId,
  });

  const transferMutation = useMutation({
    mutationFn: async ({ toHolder, notes }: { toHolder: string; notes?: string }) => {
      const res = await fetch('/api/fabric/ebl/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eblId, toHolder, notes })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['ebl', eblId] });
      queryClient.invalidateQueries({ queryKey: ['ebl-list'] });
    },
    onError: (err: any) => {
      toast.error(`Transfer failed: ${err.message}`);
    }
  });

  const surrenderMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/fabric/ebl/surrender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eblId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['ebl', eblId] });
      queryClient.invalidateQueries({ queryKey: ['ebl-list'] });
    },
    onError: (err: any) => {
      toast.error(`Surrender failed: ${err.message}`);
    }
  });

  const issueMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/fabric/ebl/issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['ebl-list'] });
    },
    onError: (err: any) => {
      toast.error(`Issuance failed: ${err.message}`);
    }
  });

  return { 
    ebl, 
    isLoading, 
    error, 
    refetch, 
    transfer: transferMutation,
    surrender: surrenderMutation,
    issue: issueMutation
  };
}


export function useEBLList() {
  return useQuery({
    queryKey: ['ebl-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/get');
      const json: FabricResponse<EBL[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
  });
}
export function useDraftEBL(draftId?: string) {
  const queryClient = useQueryClient();

  const { data: draft, isLoading, error, refetch } = useQuery({
    queryKey: ['ebl-draft', draftId],
    queryFn: async () => {
      if (!draftId) return null;
      const res = await fetch(`/api/fabric/ebl/draft?id=${draftId}`);
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data;
    },
    enabled: !!draftId,
  });

  const draftActionMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await fetch('/api/fabric/ebl/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, draftId })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['ebl-draft', draftId] });
      queryClient.invalidateQueries({ queryKey: ['ebl-draft-list'] });
    },
    onError: (err: any) => {
      toast.error(`Draft action failed: ${err.message}`);
    }
  });

  return { draft, isLoading, error, refetch, performAction: draftActionMutation };
}

export function useDraftList() {
  return useQuery({
    queryKey: ['ebl-draft-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/ebl/draft');
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
  });
}
