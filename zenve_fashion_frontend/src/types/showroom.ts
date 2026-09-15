export interface AppointmentFormData {
  fullName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  guestCount: number;
  petName?: string;
  petBreed?: string;
  serviceInterest: 'people_bespoke' | 'pet_tailoring' | 'twin_matching' | 'private_walkthrough';
  message?: string;
}

export interface ShowroomAppointment extends AppointmentFormData {
  id: string;
  status: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}
