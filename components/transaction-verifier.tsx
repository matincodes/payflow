'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react';

interface VerificationResult {
  reference: string;
  amount: number;
  status: string;
  customer: {
    email: string;
    customer_code: string;
  };
  paid_at: string;
  authorization: {
    last4: string;
    brand: string;
  };
}

export function TransactionVerifier() {
  const [reference, setReference] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResult(null);

    if (!reference.trim()) {
      setError('Please enter a transaction reference');
      return;
    }

    setLoading(true);

    try {
      // Call your backend to verify the transaction with Paystack
      const response = await fetch('/api/paystack/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference: reference.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to verify transaction');
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'pending':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600 dark:text-red-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Verify Transaction</CardTitle>
        <CardDescription>Check the status of a payment transaction</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference" className="text-sm font-medium">Transaction Reference</Label>
            <Input
              id="reference"
              placeholder="e.g., 0123456789"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              disabled={loading}
              className="bg-input border-input"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify Transaction'
            )}
          </Button>
        </form>

        {error && (
          <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {result && (
          <div className="space-y-4 rounded-lg border border-border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-foreground">Transaction Details</h3>
                <p className="text-sm text-muted-foreground">Reference: {result.reference}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(result.status)}
                <span className={`font-medium capitalize ${getStatusColor(result.status)}`}>
                  {result.status}
                </span>
              </div>
            </div>

            <div className="grid gap-4 border-t border-border pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-semibold text-foreground">₦{(result.amount / 100).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-semibold text-foreground">{result.customer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Card Brand</p>
                  <p className="font-semibold text-foreground capitalize">{result.authorization.brand}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Last 4 Digits</p>
                  <p className="font-semibold text-foreground">•••• {result.authorization.last4}</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Paid At</p>
                <p className="font-semibold text-foreground">
                  {new Date(result.paid_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
