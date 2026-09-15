import { apiClient } from './api';
import { AppointmentFormData, ShowroomAppointment } from '../types/showroom';

export const showroomService = {
  /**
   * Book showroom appointment in database
   */
  async bookAppointment(data: AppointmentFormData): Promise<ShowroomAppointment> {
    const response = await apiClient.post<ShowroomAppointment>('/showroom/appointments', data);
    return response.data;
  },

  /**
   * Get user showroom appointments
   */
  async getAppointments(): Promise<ShowroomAppointment[]> {
    try {
      const response = await apiClient.get<ShowroomAppointment[]>('/showroom/appointments');
      return Array.isArray(response.data) ? response.data : [];
    } catch {
      return [];
    }
  },
};
