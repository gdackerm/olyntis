import dayjs from 'dayjs';
import { BaseService } from './base';

class ClinicalImpressionService extends BaseService<'clinical_impressions'> {
  constructor() {
    super('clinical_impressions');
  }

  async getByPatientId(patientId: string) {
    const { data, error } = await this.table
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getCompletedToday() {
    const startOfDay = dayjs().startOf('day').toISOString();
    const endOfDay = dayjs().endOf('day').toISOString();

    const { data, error } = await this.table
      .select('*')
      .eq('status', 'completed')
      .gte('created_at', startOfDay)
      .lte('created_at', endOfDay);
    if (error) throw error;
    return data;
  }
}

export const clinicalImpressionService = new ClinicalImpressionService();
