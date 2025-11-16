'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PaymentForm } from './payment-form';
import { TransactionHistory } from './transaction-history';
import { TransactionVerifier } from './transaction-verifier';
import { DashboardOverview } from './dashboard-overview';

export function Dashboard() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePaymentSuccess = (newTransaction: any) => {
    setTransactions([newTransaction, ...transactions]);
    setRefreshKey(prev => prev + 1);
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
                        <p className="text-muted-foreground">Backend verifies transaction status</p>
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
            <TransactionHistory transactions={transactions} refreshKey={refreshKey} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
