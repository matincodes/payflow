import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

/**
 * Handles Paystack verification logic
 */
async function verifyTransaction(reference: string) {
    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
        cache: 'no-store', // Always re-verify
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
        console.error("Paystack verification error:", data);
        throw new Error(data.message || "Failed to verify transaction.");
    }

    return data;
}


export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        // This is for the redirect from Paystack which uses query params
        const reference = searchParams.get('reference') || searchParams.get('trxref');

        if (!reference) {
            return NextResponse.json({ error: "Transaction reference is required." }, { status: 400 });
        }

        const data = await verifyTransaction(reference);
        return NextResponse.json({ data: data.data });

    } catch (error) {
        console.error("Server error during Paystack verification (GET):", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}


export async function POST(req: NextRequest) {
    try {
        // This is for your manual 'TransactionVerifier' component
        const { reference } = await req.json();

        if (!reference) {
            return NextResponse.json({ error: "Transaction reference is required." }, { status: 400 });
        }

        const data = await verifyTransaction(reference);
        return NextResponse.json({ data: data.data });

    } catch (error) {
        console.error("Server error during Paystack verification (POST):", error);
        // Handle JSON parse error specifically
        if (error instanceof SyntaxError && error.message.includes("JSON")) {
            return NextResponse.json({ error: "Invalid request body. Expected { \"reference\": \"...\" }" }, { status: 400 });
        }
        return NextResponse.json({ error: error instanceof Error ? error.message : "Internal Server Error" }, { status: 500 });
    }
}