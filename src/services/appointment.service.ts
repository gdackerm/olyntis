import dayjs from 'dayjs';
import { BaseService } from './base';

class AppointmentService extends BaseService<'appointments'> {
  constructor() {
    super('appointments');
  }

  async getByPatientId(patientId: string) {
    const { data, error } = await this.table
      .select('*')
      .eq('patient_id', patientId)
      .order('start_time', { ascending: false });
    if (error) throw error;
    return data;
  }

  async getTodayForPractitioner(practitionerId: string) {
    const startOfDay = dayjs().startOf('day').toISOString();
    const endOfDay = dayjs().endOf('day').toISOString();

    const { data, error } = await this.table
      .select('*, patients!inner(id, given_name, family_name, birth_date, gender)')
      .eq('practitioner_id', practitionerId)
      .gte('start_time', startOfDay)
      .lte('start_time', endOfDay)
      .order('start_time', { ascending: true });
    if (error) throw error;
    return data;
  }
}

export const appointmentService = new AppointmentService();
