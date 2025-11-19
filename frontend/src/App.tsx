import { useState, useEffect } from 'react';
import type { Subscription } from '@/types/subscription';
import SubscriptionList from '@/components/SubscriptionList';
import SubscriptionForm from '@/components/SubscriptionForm';
import Analytics from '@/components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBillingCycle, setFilterBillingCycle] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_URL}/subscriptions`);
      if (!response.ok) {
        throw new Error('Failed to fetch subscriptions');
      }
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch subscriptions. Please try again.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) {
        throw new Error('Failed to add subscription');
      }
      await fetchSubscriptions();
      setShowForm(false);
      toast({
        title: 'Success',
        description: 'Subscription added successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add subscription. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateSubscription = async (id: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      await fetchSubscriptions();
      setEditingSubscription(null);
      setShowForm(false);
      toast({
        title: 'Success',
        description: 'Subscription updated successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update subscription. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }
    try {
      const response = await fetch(`${API_URL}/subscriptions/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to delete subscription');
      }
      await fetchSubscriptions();
      toast({
        title: 'Success',
        description: 'Subscription deleted successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete subscription. Please try again.',
      });
    }
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowForm(true);
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingSubscription(null);
  };

  const filteredSubscriptions = subscriptions
    .filter((sub) => {
      const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sub.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBillingCycle = filterBillingCycle === 'all' || sub.billingCycle === filterBillingCycle;
      const matchesCategory = filterCategory === 'all' || sub.category === filterCategory;
      return matchesSearch && matchesBillingCycle && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'cost-asc':
          return a.cost - b.cost;
        case 'cost-desc':
          return b.cost - a.cost;
        case 'date':
          return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        default:
          return 0;
      }
    });

  const uniqueCategories = Array.from(new Set(subscriptions.map(sub => sub.category).filter(Boolean)));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Subscription Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="subscriptions" className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>

              <TabsContent value="subscriptions" className="mt-6">
                {!showForm ? (
                  <>
                    <div className="mb-6 space-y-4">
                      <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                          <Label htmlFor="search" className="sr-only">Search</Label>
                          <Input
                            id="search"
                            placeholder="Search subscriptions..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            disabled={isLoading}
                          />
                        </div>
                        <div className="w-full sm:w-40">
                          <Label htmlFor="sort" className="sr-only">Sort By</Label>
                          <select
                            id="sort"
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="name">Name (A-Z)</option>
                            <option value="cost-asc">Cost (Low-High)</option>
                            <option value="cost-desc">Cost (High-Low)</option>
                            <option value="date">Start Date</option>
                          </select>
                        </div>
                        <div className="w-full sm:w-40">
                          <Label htmlFor="billing-cycle" className="sr-only">Billing Cycle</Label>
                          <select
                            id="billing-cycle"
                            value={filterBillingCycle}
                            onChange={(e) => setFilterBillingCycle(e.target.value)}
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="all">All Cycles</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                          </select>
                        </div>
                        <div className="w-full sm:w-40">
                          <Label htmlFor="category" className="sr-only">Category</Label>
                          <select
                            id="category"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            disabled={isLoading}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <option value="all">All Categories</option>
                            {uniqueCategories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div>
                        <Button onClick={() => setShowForm(true)} disabled={isLoading}>
                          Add Subscription
                        </Button>
                      </div>
                    </div>
                    {isLoading ? (
                      <div className="text-center py-12 text-muted-foreground">
                        <p className="text-lg">Loading subscriptions...</p>
                      </div>
                    ) : (
                      <SubscriptionList
                        subscriptions={filteredSubscriptions}
                        onEdit={handleEdit}
                        onDelete={handleDeleteSubscription}
                      />
                    )}
                  </>
                ) : (
                  <SubscriptionForm
                    subscription={editingSubscription || undefined}
                    onSubmit={
                      editingSubscription
                        ? (data) => handleUpdateSubscription(editingSubscription.id, data)
                        : handleAddSubscription
                    }
                    onCancel={handleCancelForm}
                    isSubmitting={isSubmitting}
                  />
                )}
              </TabsContent>

              <TabsContent value="analytics" className="mt-6">
                <Analytics />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}

export default App;
