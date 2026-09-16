export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  avatar?: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  fullName: string;
  name?: string;
  mobile: string;
  phone?: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}
