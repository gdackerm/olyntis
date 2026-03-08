import dayjs from 'dayjs';
import { BaseService } from './base';

// LOINC codes for behavioral health screening instruments
const SCREENING_LOINC_CODES = [
  '44261-6', // PHQ-9
  '70274-6', // GAD-7
  '75626-2', // AUDIT-C
];

class ObservationService extends BaseService<'observations'> {
  constructor() {
    super('observations');
  }

  async getByPatientId(patientId: string) {
    const { data, error } = await this.table
      .select('*')
      .eq('patient_id', patientId)
      .order('effective_date', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getRecentScreeningScores(daysBack = 90) {
    const since = dayjs().subtract(daysBack, 'day').toISOString();

    const { data, error } = await this.table
      .select('*, patients!inner(id, given_name, family_name)')
      .in('code_value', SCREENING_LOINC_CODES)
      .gte('effective_date', since)
      .order('effective_date', { ascending: false });
    if (error) throw error;
    return data;
  }
}

export const observationService = new ObservationService();
