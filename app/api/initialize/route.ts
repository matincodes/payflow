import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { email, amount, fullName } = await req.json();

        const amountInKobo = Math.round(Number(amount) * 100);

        if (!email || !amountInKobo || !fullName) {
            return NextResponse.json({ error: "Email, full name, and amount are required." }, { status: 400 });
        }

        if (amountInKobo < 10000) { // 100 NGN
            return NextResponse.json({ error: 'Minimum amount is ₦100' },{ status: 400 });
        }

        const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email,
                amount: amountInKobo,
                callback_url: `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify`,
                metadata: {
                    full_name: fullName,
                    custom_fields: [],
                },
            })
        });

        const data = await paystackResponse.json();

        if (!paystackResponse.ok) {
            console.error("Paystack initialization error:", data);
            return NextResponse.json({ error: data.message || "Failed to initialize transaction." }, { status: paystackResponse.status });
        }


        return NextResponse.json({
            authorization_url: data.data.authorization_url,
            access_code: data.data.access_code,
            reference: data.data.reference,
        });
    } catch (error) {
        console.error("Server error during Paystack initialization:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } 
}