'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader } from 'lucide-react';

interface Transaction {
  reference: string;
  amount: number;
  email: string;
  fullName: string;
  status: string;
  timestamp: string;
}

interface TransactionHistoryProps {
  transactions: Transaction[];
  refreshKey: number;
}

export function TransactionHistory({ transactions, refreshKey }: TransactionHistoryProps) {
  const [displayTransactions, setDisplayTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setDisplayTransactions(transactions);
  }, [transactions, refreshKey]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    return variants[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <Card className="border border-border">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All your payment transactions</CardDescription>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={loading}
          className="border-border"
        >
          {loading ? (
            <Loader className="h-4 w-4 animate-spin" />
          ) : (
            'Refresh'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {displayTransactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="mb-4 text-4xl">📋</div>
            <p className="text-sm text-muted-foreground">No transactions yet</p>
            <p className="text-xs text-muted-foreground">Start by initializing a payment</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayTransactions.map((transaction) => (
              <div
                key={transaction.reference}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-foreground truncate">{transaction.fullName}</h4>
                    <Badge className={getStatusBadge(transaction.status)}>
                      {transaction.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-mono text-xs text-foreground">{transaction.reference}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="font-semibold text-foreground">₦{transaction.amount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date</p>
                      <p className="text-xs text-foreground">
                        {new Date(transaction.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">{transaction.email}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
