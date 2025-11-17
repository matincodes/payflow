'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentForm } from './payment-form';
// 1. IMPORT THE TRANSACTION TYPE
import { TransactionHistory, Transaction } from './transaction-history'; 
import { TransactionVerifier } from './transaction-verifier';
import { DashboardOverview } from './dashboard-overview';

// Define the API response type (matches Paystack's API data)
interface ApiTransaction {
  id: string | number;
  reference: string;
  amount: number; // This will be in Kobo
  status: string;
  paid_at: string;
  customer: {
    email: string;
  };
  metadata?: { // Make metadata optional
    full_name: string;
  };
}

export function Dashboard() {
  // 2. ADD STATE FOR LOADING AND ERROR
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true); // Start true for initial load
  const [error, setError] = useState<string | null>(null);

  // 3. CREATE THE REAL FETCH FUNCTION
  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/history");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch history");
      }

      // We have new data from the API. Let's format it.
      const apiTransactions: Transaction[] = data.map((tx: ApiTransaction) => ({
        id: tx.id,
        reference: tx.reference,
        amount: tx.amount, 
        email: tx.customer.email,
        fullName: tx.metadata?.full_name || 'N/A', // Handle missing metadata
        status: tx.status,
        timestamp: tx.paid_at,
      }));

      // 4. MERGE API DATA WITH LOCAL PENDING DATA
      setTransactions(prevTransactions => {
        // Get all local transactions that are still "pending"
        const pendingTxs = prevTransactions.filter(t => t.status === 'pending');
        const txMap = new Map<string, Transaction>();

        // Add pending transactions first
        pendingTxs.forEach(t => txMap.set(t.reference, t));
        
        // Add API transactions (this will overwrite a pending tx if the reference matches)
        apiTransactions.forEach(t => txMap.set(t.reference, t));

        // Return a single, sorted list
        return Array.from(txMap.values())
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // 5. FETCH HISTORY ON INITIAL LOAD
  useEffect(() => {
    fetchHistory();
  }, []); // Empty array means this runs once on mount

  // This is called by the PaymentForm when a new payment is *initialized*
  const handlePaymentSuccess = (newTransaction: Transaction) => {
    // We add the new "pending" transaction to the top of the list
    // for instant UI feedback. The next `fetchHistory` call will confirm its status.
    setTransactions(prevTransactions => [newTransaction, ...prevTransactions]);
    // No need to manage refreshKey
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">PayFlow</h1>
              <p className="text-sm text-muted-foreground">Secure Payment Platform</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Powered by Paystack</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="pay">Pay</TabsTrigger>
            <TabsTrigger value="verify">Verify</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <DashboardOverview transactions={transactions} />
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="pay" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <PaymentForm onSuccess={handlePaymentSuccess} />
              <Card>
                <CardHeader>
                  <CardTitle>How it works</CardTitle>
                  <CardDescription>Payment flow overview</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  {/* Your "How it works" steps are perfect and remain unchanged */}
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">1</div>
                      <div>
                        <p className="font-medium">Enter Payment Details</p>
                        <p className="text-muted-foreground">Fill in the amount and customer information</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">2</div>
                      <div>
                        <p className="font-medium">Initialize Transaction</p>
                        <p className="text-muted-foreground">Backend initializes payment with Paystack API</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">3</div>
                      <div>
                        <p className="font-medium">Secure Payment</p>
                        <p className="text-muted-foreground">Customer completes payment on Paystack gateway</p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">4</div>
                      <div>
                        <p className="font-medium">Verify & Confirm</p>
                        <p className="text-muted-foreground">App redirects to /verify for server-side confirmation</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Verify Tab */}
          <TabsContent value="verify" className="space-y-6">
            <TransactionVerifier />
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            {/* 6. PASS THE NEW PROPS */}
            <TransactionHistory
              transactions={transactions}
              loading={loading}
              error={error}
              onRefresh={fetchHistory} // Pass the real fetch function
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}