export type Subscription = {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  description?: string;
  category?: string;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type Analytics = {
  monthlyTotal: number;
  yearlyTotal: number;
  byCategory: Record<string, number>;
  totalSubscriptions: number;
  monthlySpending: Array<{
    month: string;
    total: number;
  }>;
};

export type User = {
  id: string;
  email: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};
