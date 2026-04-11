import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ServiceInvoice, FabricResponse } from '@/lib/types/portchain';
import { toast } from 'sonner';

export function useInvoices() {
  const queryClient = useQueryClient();

  const { data: invoices, isLoading, error, refetch } = useQuery({
    queryKey: ['invoices-list'],
    queryFn: async () => {
      const res = await fetch('/api/fabric/invoices/all');
      const json: FabricResponse<ServiceInvoice[]> = await res.json();
      if (!json.success) throw new Error(json.error);
      return json.data || [];
    },
  });

  const generateInvoiceMutation = useMutation({
    mutationFn: async (data: { submissionId: string }) => {
      const res = await fetch('/api/fabric/invoices/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Service invoice generated on ledger');
      queryClient.invalidateQueries({ queryKey: ['invoices-list'] });
    },
    onError: (err: any) => {
      toast.error(`Failed to generate invoice: ${err.message}`);
    },
  });

  const settleInvoiceMutation = useMutation({
    mutationFn: async (invoiceId: string) => {
      const res = await fetch('/api/fabric/invoices/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      return json;
    },
    onSuccess: () => {
      toast.success('Payment confirmed and release triggered on blockchain');
      queryClient.invalidateQueries({ queryKey: ['invoices-list'] });
    },
    onError: (err: any) => {
      toast.error(`Payment failed: ${err.message}`);
    },
  });

  return {
    invoices,
    isLoading,
    error,
    refetch,
    generateInvoice: generateInvoiceMutation.mutate,
    isGenerating: generateInvoiceMutation.isPending,
    settleInvoice: settleInvoiceMutation.mutate,
    isSettling: settleInvoiceMutation.isPending,
  };
}
