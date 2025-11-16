"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Loader } from 'lucide-react'; // Using your icons

// A small component to handle the logic, wrapped in Suspense
function VerificationContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Paystack redirects with 'reference' or 'trxref'
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    console.log("Verifying reference:", reference);
    if (!reference) {
      setError("No payment reference found.");
      setLoading(false);
      return;
    }

    // This is the reference you saved, you could use it for a check
    const localReference = localStorage.getItem('last_transaction_reference');
    if (reference !== localReference) {
        // Optional: Handle this, but the URL reference is the source of truth
        console.warn("Reference mismatch, but proceeding with URL reference.");
    }

    async function verifyPayment() {
      try {
        setLoading(true);
        setError(null);
        setStatus(null);
        
        const res = await fetch(`/api/verify?reference=${reference}`);
        const data = await res.json();
        console.log("Verification data:", data);

        if (!res.ok) {
          throw new Error(data.data.error || "Verification failed");
        }

        if (data.data.status === "success") {
          setStatus("success");
          localStorage.removeItem('last_transaction_reference'); // Clear the ref
        } else {
          setStatus(data.data.status);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [searchParams]);

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-center">Payment Verification</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center space-y-6 p-6">
        {loading && (
          <>
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Verifying your payment...</p>
          </>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center text-center space-y-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
            <h2 className="text-2xl font-semibold">Payment Successful!</h2>
            <p className="text-muted-foreground">
              Your payment has been confirmed. Thank you!
            </p>
            <Badge variant="secondary">Success</Badge>
          </div>
        )}
        
        {(status && status !== "success") && (
           <div className="flex flex-col items-center text-center space-y-4">
             <AlertCircle className="h-16 w-16 text-destructive" />
             <h2 className="text-2xl font-semibold">Payment Failed</h2>
             <p className="text-muted-foreground">
               Your payment could not be processed. Status: {status}
             </p>
             <Badge variant="destructive">{status}</Badge>
           </div>
        )}

        {error && (
          <div className="flex flex-col items-center text-center space-y-4">
            <AlertCircle className="h-16 w-16 text-destructive" />
            <h2 className="text-2xl font-semibold">Verification Error</h2>
            <p className="text-muted-foreground">{error}</p>
            <Badge variant="destructive">Error</Badge>
          </div>
        )}

        {!loading && (
            <Button asChild className="w-full">
            <Link href="/">Go to Dashboard</Link>
            </Button>
        )}
      </CardContent>
    </Card>
  );
}

// The main page component wraps the content in Suspense
export default function VerifyPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4">
            <Loader className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading verification page...</p>
        </div>
      }>
        <VerificationContent />
      </Suspense>
    </div>
  );
}