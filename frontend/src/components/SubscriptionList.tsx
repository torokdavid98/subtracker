import type { Subscription } from '@/types/subscription';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currency';

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

  const formatCurrency = (amount: number, currency: string) => {
    return formatCurrencyUtil(amount, currency);
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
            <div className="flex justify-between items-start gap-3">
              <div className="flex items-start gap-3 flex-1">
                {sub.logoUrl && (
                  <div className="flex-shrink-0">
                    <img
                      src={sub.logoUrl}
                      alt={`${sub.name} logo`}
                      className="w-12 h-12 rounded-lg object-contain bg-white p-1 border"
                      onError={(e) => {
                        // Hide image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <CardTitle className="flex items-center gap-2 flex-wrap">
                    <span className="truncate">{sub.name}</span>
                    {sub.deletedAt && (
                      <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded flex-shrink-0">
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
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold">{formatCurrency(sub.cost, sub.currency || 'HUF')}</p>
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
