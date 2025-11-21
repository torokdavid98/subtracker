import type { Subscription } from '@/types/subscription';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

export default function SubscriptionList({ subscriptions, onEdit, onDelete }: SubscriptionListProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  if (subscriptions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-lg">No subscriptions yet</p>
        <p className="text-sm mt-2">Click "Add Subscription" to get started</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {subscriptions?.map((sub) => (
        <Card key={sub.id} className={`flex flex-col ${sub.deletedAt ? 'opacity-60 border-red-300' : ''}`}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {sub.name}
                  {sub.deletedAt && (
                    <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                      Deleted
                    </span>
                  )}
                </CardTitle>
                {sub.category && (
                  <span className="inline-block mt-2 px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded">
                    {sub.category}
                  </span>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{formatCurrency(sub.cost)}</p>
                <p className="text-xs text-muted-foreground">{sub.billingCycle}</p>
              </div>
            </div>
          </CardHeader>

          {sub.description && (
            <CardContent className="flex-grow">
              <p className="text-sm text-muted-foreground">{sub.description}</p>
            </CardContent>
          )}

          <CardContent className={!sub.description ? 'flex-grow' : ''}>
            <p className="text-sm text-muted-foreground">
              From: <span className="font-medium text-foreground">{formatDate(sub.startDate)}</span>
            </p>
            {sub.deletedAt && (
              <p className="text-sm text-red-600 mt-2">
                Deleted: <span className="font-medium">{formatDate(sub.deletedAt)}</span>
              </p>
            )}
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => onEdit(sub)}
              className="flex-1"
              disabled={!!sub.deletedAt}
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDelete(sub.id)}
              className="flex-1"
              disabled={!!sub.deletedAt}
            >
              Delete
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
