import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Fetches the 10 most recent transactions
    const paystackResponse = await fetch(
      'https://api.paystack.co/transaction?perPage=10&status=success',
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
        // We can cache this for a short time, e.g., 60 seconds
        next: { revalidate: 60 },
      }
    );

    const paystackData = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack API Error:', paystackData);
      return NextResponse.json(
        { error: 'Failed to fetch transaction history', details: paystackData.message },
        { status: 500 }
      );
    }

    // Send the array of transactions back to the frontend
    return NextResponse.json(paystackData.data);

  } catch (error) {
    console.error('Internal Server Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}