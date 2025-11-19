export type Subscription = {
  id: string;
  name: string;
  cost: number;
  billingCycle: 'monthly' | 'yearly';
  nextBillDate: string;
  description?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Analytics = {
  monthlyTotal: number;
  yearlyTotal: number;
  byCategory: Record<string, number>;
  totalSubscriptions: number;
};
