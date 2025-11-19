import { useState, useEffect } from 'react';
import type { Subscription } from '@/types/subscription';
import SubscriptionList from '@/components/SubscriptionList';
import SubscriptionForm from '@/components/SubscriptionForm';
import Analytics from '@/components/Analytics';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const API_URL = 'http://localhost:3001/api';

function App() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch(`${API_URL}/subscriptions`);
      const data = await response.json();
      setSubscriptions(data);
    } catch (error) {
      console.error('Failed to fetch subscriptions:', error);
    }
  };

  const handleAddSubscription = async (subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch(`${API_URL}/subscriptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      await fetchSubscriptions();
      setShowForm(false);
    } catch (error) {
      console.error('Failed to add subscription:', error);
    }
  };

  const handleUpdateSubscription = async (id: string, subscription: Omit<Subscription, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await fetch(`${API_URL}/subscriptions/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
      await fetchSubscriptions();
      setEditingSubscription(null);
      setShowForm(false);
    } catch (error) {
      console.error('Failed to update subscription:', error);
    }
  };

  const handleDeleteSubscription = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription?')) {
      return;
    }
    try {
      await fetch(`${API_URL}/subscriptions/${id}`, {
        method: 'DELETE',
      });
      await fetchSubscriptions();
    } catch (error) {
      console.error('Failed to delete subscription:', error);
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
                    <div className="mb-6">
                      <Button onClick={() => setShowForm(true)}>
                        Add Subscription
                      </Button>
                    </div>
                    <SubscriptionList
                      subscriptions={subscriptions}
                      onEdit={handleEdit}
                      onDelete={handleDeleteSubscription}
                    />
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
    </div>
  );
}

export default App;
