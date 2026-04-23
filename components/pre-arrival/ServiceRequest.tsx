'use client';

import { useState } from 'react';
import { FaAnchor, FaPlus, FaClock, FaCheckCircle } from 'react-icons/fa';

interface ServiceRequestProps {
  submissionId: string;
  vesselIMO: string;
  onRequestSuccess?: () => void;
}

const serviceTypes = [
  { id: 'pilotage', name: 'Pilotage', icon: FaAnchor, description: 'Pilot guidance for vessel navigation' },
  { id: 'tug', name: 'Tug Assistance', icon: FaAnchor, description: 'Tug boat assistance for berthing/departure' },
  { id: 'mooring', name: 'Mooring', icon: FaAnchor, description: 'Mooring line handling services' },
  { id: 'stevedoring', name: 'Stevedoring', icon: FaAnchor, description: 'Cargo loading/unloading services' },
  { id: 'waste_disposal', name: 'Waste Disposal', icon: FaAnchor, description: 'Marine waste management' },
  { id: 'bunkering', name: 'Bunkering', icon: FaAnchor, description: 'Fuel supply services' },
];

export default function ServiceRequest({ submissionId, vesselIMO, onRequestSuccess }: ServiceRequestProps) {
  const [selectedService, setSelectedService] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService) return;

    setIsSubmitting(true);
    setStatus('idle');

    try {
      const requestId = `REQ-${submissionId}-${selectedService}-${Date.now()}`;
      
      const response = await fetch('/api/fabric/services/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestId,
          submissionId,
          serviceType: selectedService,
          notes,
        }),
      });

      if (!response.ok) throw new Error('Failed to request service');

      setStatus('success');
      setSelectedService('');
      setNotes('');
      
      setTimeout(() => {
        setStatus('idle');
        onRequestSuccess?.();
      }, 2000);
    } catch (error) {
      setStatus('error');
      console.error('Service request error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="port-card p-6 space-y-4">
      <h3 className="font-display text-xl flex items-center gap-2 border-b border-portmid pb-2">
        <FaAnchor className="text-portaccent" /> Request Port Services
      </h3>

      {status === 'success' && (
        <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700 animate-in zoom-in-95 duration-300">
          <FaCheckCircle className="text-xl" />
          <span className="font-display">Service request submitted successfully</span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-xl text-rose-700">
          Failed to submit service request. Please try again.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-color-text-muted uppercase tracking-widest mb-2">
            Service Type
          </label>
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="w-full p-3 border border-portmid rounded-lg bg-white focus:ring-2 focus:ring-portaccent focus:border-transparent"
            disabled={isSubmitting}
          >
            <option value="">Select a service...</option>
            {serviceTypes.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name} - {service.description}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-color-text-muted uppercase tracking-widest mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add any special requirements or notes..."
            className="w-full p-3 border border-portmid rounded-lg bg-white focus:ring-2 focus:ring-portaccent focus:border-transparent h-24 resize-none"
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          disabled={!selectedService || isSubmitting}
          className="w-full port-btn-primary flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <FaClock className="animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <FaPlus />
              Request Service
            </>
          )}
        </button>
      </form>
    </div>
  );
}
