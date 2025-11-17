'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface PaymentFormProps {
  onSuccess?: (transaction: any) => void;
}

// Define the Transaction type
export interface Transaction {
  reference: string;
  amount: number;
  email: string;
  fullName: string;
  status: 'pending' | 'success' | 'failed' | string;
  timestamp: string;
  id?: string | number; // Optional ID
  paid_at?: string; // Optional from Paystack
  customer?: { email: string }; // Optional from Paystack
}

export function PaymentForm({ onSuccess }: PaymentFormProps) {
  const [amount, setAmount] = useState('');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Validation
    if (!amount || !email || !fullName) {
      setError('Please fill in all fields');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    setLoading(true);

    try {
      // Call your backend to initialize the transaction with Paystack
      const response = await fetch('/api/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          email,
          fullName,
          metadata: {
            full_name: fullName,
            custom_fields: [],
          },
        }),
      });

      const data = await response.json();
      console.log('Initialization response:', data);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Store transaction reference and redirect to payment URL
      if (data.authorization_url) {
        // Save reference to localStorage for verification later
        localStorage.setItem('last_transaction_reference', data.reference);
        
        // Show success message and redirect
        setSuccessMessage('Redirecting to payment gateway...');
        setTimeout(() => {
          window.location.href = data.authorization_url;
        }, 1500);

        // Also add to transaction history
        if (onSuccess) {
          onSuccess({
            reference: data.reference,
            amount: parseFloat(amount) * 100, // Convert to kobo
            email,
            fullName,
            status: 'pending',
            timestamp: new Date().toISOString(),
          });
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border border-border">
      <CardHeader>
        <CardTitle>Initialize Payment</CardTitle>
        <CardDescription>Start a new payment transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-900">
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-900 dark:text-green-200">{successMessage}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="fullName" className="text-sm font-medium">Full Name</Label>
            <Input
              id="fullName"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading}
              className="bg-input border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              className="bg-input border-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">Amount (NGN)</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">₦</span>
              <Input
                id="amount"
                type="number"
                placeholder="1000.00"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
                className="bg-input border-input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Minimum amount: ₦100
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {loading ? (
              <>
                <Loader className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Proceed to Payment'
            )}
          </Button>

          <div className="rounded-lg bg-muted/30 p-4 text-xs text-muted-foreground space-y-2">
            <p className="font-medium">Security Information:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Your payment details are encrypted and secure</li>
              <li>Processed through Paystack's secure gateway</li>
              <li>Your data is never stored on our servers</li>
            </ul>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
