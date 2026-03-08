import { supabase } from '../lib/supabase/client';
import { BaseService } from './base';

class PatientService extends BaseService<'patients'> {
  constructor() {
    super('patients');
  }

  async search(query: string) {
    const { data, error } = await supabase.rpc('search_patients' as any, { search_query: query });
    if (error) throw error;
    return (data ?? []) as Awaited<ReturnType<typeof this.getById>>[];
  }

  async getWithRelated(id: string) {
    const [patient, allergies, conditions, medications, immunizations, coverages] = await Promise.all([
      this.getById(id),
      supabase.from('allergy_intolerances').select('*').eq('patient_id', id).then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      supabase.from('conditions').select('*').eq('patient_id', id).then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      supabase.from('medication_requests').select('*').eq('patient_id', id).then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      supabase.from('immunizations').select('*').eq('patient_id', id).then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
      supabase.from('coverages').select('*').eq('patient_id', id).then(({ data, error }) => {
        if (error) throw error;
        return data;
      }),
    ]);

    return {
      patient,
      allergies,
      conditions,
      medications,
      immunizations,
      coverages,
    };
  }
}

export const patientService = new PatientService();
