'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton'; // Import Skeleton

// Make sure to EXPORT the Transaction type so other components can use it
export interface Transaction {
  id?: string | number; // Make ID optional
  reference: string;
  amount: number; // This amount is in KOBO
  email: string;
  fullName: string;
  status: string;
  timestamp: string;
  paid_at?: string; // Add optional fields
  customer?: { email: string };
  metadata?: { full_name: string }; // Add optional metadata
}

// 1. UPDATE THE PROPS
// The component now receives its state from the parent (Dashboard)
interface TransactionHistoryProps {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void; // This is now a function passed from the parent
}

export function TransactionHistory({ 
  transactions, 
  loading, 
  error, 
  onRefresh 
}: TransactionHistoryProps) {

  // 2. UPDATE THE BADGE FUNCTION
  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    };
    // Ensure case-insensitivity and default
    return variants[status.toLowerCase()] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  };

  // 3. ADD CURRENCY & DATE FORMATTERS
  // Helper to format Kobo to NGN
  const formatCurrency = (amountInKobo: number) => {
    // This correctly converts kobo (e.g., 10000) to NGN (e.g., "₦100.00")
    return (amountInKobo / 100).toLocaleString('en-NG', {
      style: 'currency',
      currency: 'NGN',
    });
  };

  const formatDate = (dateString: string) => {
     if (!dateString) return 'N/A';
     return new Date(dateString).toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  // 4. CREATE A RENDER FUNCTION
  // This makes the main return easier to read
  const renderContent = () => {
    // Show skeletons ONLY if we are loading and have no transactions yet
    if (loading && transactions.length === 0) {
      return (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-32 mb-2" />
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Skeleton className="h-3 w-16 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                   <div>
                    <Skeleton className="h-3 w-12 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                   <div className="col-span-2 md:col-span-1">
                    <Skeleton className="h-3 w-10 mb-1" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-5 w-5 ml-4 flex-shrink-0" />
            </div>
          ))}
        </div>
      );
    }
    
    if (error) {
       return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-4xl">❌</div>
          <p className="text-sm text-destructive font-medium">Failed to load transactions</p>
          <p className="text-xs text-muted-foreground">{error}</p>
        </div>
      );
    }

    if (!loading && transactions.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-4xl">📋</div>
          <p className="text-sm text-muted-foreground">No transactions yet</p>
          <p className="text-xs text-muted-foreground">Start by initializing a payment</p>
        </div>
      );
    }

    // If not loading, and we have transactions, show them
    return (
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div
            key={transaction.reference}
            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h4 className="font-medium text-foreground truncate">{transaction.fullName}</h4>
                <Badge className={`text-xs ${getStatusBadge(transaction.status)}`}>
                  {transaction.status}
                </Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="font-mono text-xs text-foreground truncate">{transaction.reference}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">
                    {/* 5. CRUCIAL FIX: Format from Kobo */}
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <p className="text-xs text-muted-foreground">Date</p>
                  <p className="text-xs text-foreground">
                    {formatDate(transaction.timestamp)}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 truncate">{transaction.email}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground ml-4 flex-shrink-0" />
          </div>
        ))}
      </div>
    );
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
          onClick={onRefresh} // 6. Call the prop function
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
        {renderContent()}
      </CardContent>
    </Card>
  );
}