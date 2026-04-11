'use client';

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { preArrivalSchema } from '@/lib/validations/schemas';
import { usePreArrival } from '@/hooks/usePreArrival';
import { FaShip, FaUserCircle, FaBox, FaPlus, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { useRouter } from 'next/navigation';

export default function PreArrivalForm() {
  const router = useRouter();
  const { submit, isSubmitting } = usePreArrival();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(preArrivalSchema),
    defaultValues: {
      submissionId: `SUB-${Date.now().toString().slice(-6)}`,
      vesselIMO: 'IMO',
      vesselName: '',
      callSign: '',
      flag: '',
      etaTimestamp: new Date().toISOString().slice(0, 16),
      portCallPurpose: 'discharging',
      cargoManifest: [{ containerNo: '', hsCode: '', description: '', weight: 0, countryOfOrigin: '' }],
      crewList: [{ name: '', passportNo: '', rank: '' }],
    },
  });

  const { fields: cargoFields, append: appendCargo, remove: removeCargo } = useFieldArray({
    control,
    name: 'cargoManifest',
  });

  const { fields: crewFields, append: appendCrew, remove: removeCrew } = useFieldArray({
    control,
    name: 'crewList',
  });

  const handleAutoFill = () => {
    reset({
      submissionId: `SUB-${Date.now().toString().slice(-6)}`,
      vesselIMO: 'IMO9456782',
      vesselName: 'OCEAN VOYAGER',
      callSign: 'KLVX',
      flag: 'Panama',
      etaTimestamp: new Date().toISOString().slice(0, 16),
      portCallPurpose: 'discharging',
      cargoManifest: [
        { containerNo: 'MSKU1122334', hsCode: '8471', description: 'Servers and Computing Hardware', weight: 12500, countryOfOrigin: 'Germany' },
        { containerNo: 'GLDU9988776', hsCode: '8517', description: 'Telecommunication Equipment', weight: 8400, countryOfOrigin: 'USA' }
      ],
      crewList: [
        { name: 'John Doe', passportNo: 'A1234567', rank: 'Master' },
        { name: 'Jane Smith', passportNo: 'B7654321', rank: 'Chief Officer' }
      ],
    });
  };

  const onSubmit = (data: any) => {
    // Ensure numbers are correctly typed
    data.cargoManifest = data.cargoManifest.map((item: any) => ({
      ...item,
      weight: parseFloat(item.weight)
    }));
    
    // ISO format for Fabric
    data.etaTimestamp = new Date(data.etaTimestamp).toISOString();

    submit(data, {
      onSuccess: () => {
        router.push('/pre-arrival');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 animate-in fade-in duration-500">
      {/* Vessel Information */}
      <section className="port-card p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-portmid pb-2">
            <h3 className="font-display text-xl flex items-center gap-2">
                <FaShip className="text-portaccent" /> Vessel Identification
            </h3>
            <button 
                type="button" 
                onClick={handleAutoFill}
                className="text-[10px] font-bold text-portaccent border border-portaccent/30 px-2 py-1 rounded hover:bg-portaccent hover:text-white transition-all uppercase tracking-widest"
            >
                Use Demo Data
            </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Submission ID</label>
            <input {...register('submissionId')} className="port-input" readOnly />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Vessel IMO</label>
            <input {...register('vesselIMO')} className={`port-input ${errors.vesselIMO ? 'border-rose-500' : ''}`} placeholder="IMO1234567" />
            {errors.vesselIMO && <span className="text-[10px] text-rose-500">{errors.vesselIMO.message as string}</span>}
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Vessel Name</label>
            <input {...register('vesselName')} className="port-input" placeholder="e.g. OCEAN VOYAGER" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Call Sign</label>
            <input {...register('callSign')} className="port-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Flag State</label>
            <input {...register('flag')} className="port-input" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">Purpose of Call</label>
            <select {...register('portCallPurpose')} className="port-input bg-white">
                <option value="discharging">Discharging</option>
                <option value="loading">Loading</option>
                <option value="both">Both</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase tracking-widest text-color-text-secondary">ETA (Port Time)</label>
            <input type="datetime-local" {...register('etaTimestamp')} className="port-input" />
          </div>
        </div>
      </section>

      {/* Cargo Manifest */}
      <section className="port-card p-6 space-y-4 bg-portsurface/30">
        <div className="flex justify-between items-center border-b border-portmid pb-2">
          <h3 className="font-display text-xl flex items-center gap-2">
            <FaBox className="text-indigo-600" /> Cargo Manifest
          </h3>
          <button type="button" onClick={() => appendCargo({ containerNo: '', hsCode: '', description: '', weight: 0, countryOfOrigin: '' })} className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:underline">
            <FaPlus /> Add Container
          </button>
        </div>
        
        <div className="space-y-4">
          {cargoFields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-white/50 rounded-xl border border-portmid items-end relative group">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-color-text-secondary">Container No</label>
                <input {...register(`cargoManifest.${index}.containerNo`)} className="port-input text-sm" placeholder="MSKU1234567" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-color-text-secondary">HS Code</label>
                <input {...register(`cargoManifest.${index}.hsCode`)} className="port-input text-sm" />
              </div>
              <div className="flex flex-col md:col-span-2 gap-1">
                <label className="text-[10px] font-bold uppercase tracking-tighter text-color-text-secondary">Description</label>
                <input {...register(`cargoManifest.${index}.description`)} className="port-input text-sm" />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex flex-col gap-1">
                    <label className="text-[10px] font-bold uppercase tracking-tighter text-color-text-secondary">Weight (KG)</label>
                    <input type="number" {...register(`cargoManifest.${index}.weight`)} className="port-input text-sm" />
                </div>
                {cargoFields.length > 1 && (
                    <button type="button" onClick={() => removeCargo(index)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                        <FaTrash />
                    </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Crew List */}
      <section className="port-card p-6 space-y-4 bg-emerald-50/20">
        <div className="flex justify-between items-center border-b border-portmid pb-2">
          <h3 className="font-display text-xl flex items-center gap-2 text-emerald-700">
            <FaUserCircle /> Crew Listing
          </h3>
          <button type="button" onClick={() => appendCrew({ name: '', passportNo: '', rank: '' })} className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline">
            <FaPlus /> Add Member
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crewFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 p-4 bg-white/50 rounded-xl border border-portmid items-center group">
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <input {...register(`crewList.${index}.name`)} placeholder="Name" className="port-input text-xs" />
                    <input {...register(`crewList.${index}.passportNo`)} placeholder="Passport No" className="port-input text-xs" />
                </div>
                <input {...register(`crewList.${index}.rank`)} placeholder="Rank (e.g. Master, Chief Officer)" className="port-input text-xs w-full" />
              </div>
              {crewFields.length > 1 && (
                <button type="button" onClick={() => removeCrew(index)} className="text-rose-500 p-2 hover:bg-rose-50 rounded-lg">
                    <FaTrash />
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {Object.keys(errors).length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
            <p className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-1">Validation Errors Found:</p>
            <ul className="list-disc list-inside text-[10px] text-rose-600 font-medium">
                {Object.entries(errors).map(([key, error]: any) => (
                    <li key={key} className="capitalize">{key}: {error.message || 'Invalid value'}</li>
                ))}
            </ul>
        </div>
      )}

      <div className="flex justify-end gap-4 pt-4">
        <button type="button" onClick={() => router.back()} className="px-8 py-3 rounded-xl border border-portmid font-bold text-color-text-secondary hover:bg-portbase transition-all uppercase tracking-widest text-xs">Cancel</button>
        <button 
            type="submit" 
            disabled={isSubmitting}
            className="px-12 py-3 rounded-xl bg-portaccent text-white font-bold flex items-center gap-3 shadow-lg hover:shadow-portaccent/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest text-xs"
        >
          {isSubmitting ? 'Processing Transaction...' : 'Broadcast to Ledger'} <FaCheckCircle />
        </button>
      </div>
    </form>
  );
}
