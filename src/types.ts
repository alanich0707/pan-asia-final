
export type Language = 'en' | 'zh';

export interface Employer {
  id: string;
  name: string;
  name_zh: string;
}

export interface MedicalRecord {
  id: string;
  date: string;
  type: 'checkup' | 'treatment';
  description: string;
  description_zh?: string;
}

export interface Promotion {
  id: string;
  title: string;
  title_zh: string;
  date: string;
  content: string;
  content_zh: string;
  icon: string;
}

export interface User {
  passportNumber: string;
  birthDate: string; // Password (YYYYMMDD)
  name: string;
  employer: string; // Employer ID
  workerId: string;
  bloodType: string;
  allergies: string[];
  passportExpiry: string; // YYYY-MM-DD
  medicalCheckupDate: string; // Manual override or most recent checkup YYYY-MM-DD
  entryDate: string; // YYYY-MM-DD
  entryType: 'abroad' | 'domestic'; // Entry logic type
  dormitory?: string; // Dormitory ID
  roomNumber?: string;
  medicalHistory?: MedicalRecord[];
  readPromotions?: string[]; // IDs of promotions read
  points?: number; // Total reward points
  lastLoginMonth?: string; // Format: YYYY-MM to track monthly login bonus
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  role?: 'admin' | 'worker';
}

export enum Page {
  LOGIN = 'LOGIN',
  DASHBOARD = 'DASHBOARD',
  MEDICAL_CARD = 'MEDICAL_CARD',
  EMERGENCY = 'EMERGENCY',
  LIFESTYLE = 'LIFESTYLE',
  ANNOUNCEMENTS = 'ANNOUNCEMENTS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  PROMOTIONS = 'PROMOTIONS',
  ADMIN = 'ADMIN',
  REWARDS = 'REWARDS'
}

export interface Announcement {
  id: string;
  title: string;
  title_zh: string;
  date: string;
  content: string;
  content_zh: string;
  category: 'Labor' | 'Notice' | 'Safety';
  category_zh: string;
}

export interface SubService {
  name: string;
  name_zh: string;
  location?: string; // Google Maps link
  link?: string; // External URL
  desc: string;
  desc_zh: string;
}

export interface LifeService {
  id: string;
  title: string;
  title_zh: string;
  icon: string;
  category: string;
  category_zh: string;
  items: SubService[];
}
