export type UserRole = 'manager' | 'sales_rep';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId?: string | null;
  date: string;
  customerName: string;
  telephone: string;
  location: string | null;
  product: string;
  buyerType: string;
  comments: string | null;
  summary: string | null;
  followUpDate: string | null;
  followedUpBy: string;
  status: string;
  createdAt: string;
  createdBy: string;
  userName?: string | null;
  userEmail?: string | null;
}
