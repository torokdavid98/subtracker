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
