import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/dbConnect";
import RequestModel from "@/models/Request";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { generateReceiptData } from "@/lib/receipt";

export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      // In dev mode without webhook secret, parse raw JSON body with event payload
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ success: false, message: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  await dbConnect();

  // Idempotency Check: Prevent duplicate event processing
  if (event.id) {
    const existingPayment = await Payment.findOne({ stripeEventId: event.id });
    if (existingPayment) {
      console.log(`Event ${event.id} already processed. Skipping.`);
      return NextResponse.json({ success: true, message: "Event already processed" }, { status: 200 });
    }
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const requestId = session.client_reference_id || session.metadata?.requestId;

    if (requestId) {
      const requestItem = await RequestModel.findById(requestId).populate("user");

      if (requestItem) {
        // Generate digital receipt
        const paymentId = session.payment_intent || session.id;
        const receiptInfo = generateReceiptData({
          paymentId: paymentId,
          request: requestItem,
          user: requestItem.user,
          amount: session.amount_total / 100,
          currency: session.currency || "usd",
          stripePaymentIntent: session.payment_intent || session.id,
        });

        // Create Payment record
        await Payment.create({
          user: requestItem.user._id,
          request: requestItem._id,
          stripePaymentIntent: session.payment_intent || session.id,
          stripeEventId: event.id || "",
          amount: session.amount_total / 100,
          currency: session.currency || "usd",
          status: "Succeeded",
          receiptUrl: receiptInfo.receiptUrl,
        });

        // Update Request paymentStatus & timeline
        requestItem.paymentStatus = "Paid";
        if (requestItem.status === "Pending") {
          requestItem.status = "Accepted";
        }
        requestItem.statusHistory.push({
          status: requestItem.status,
          note: `Payment of $${(session.amount_total / 100).toFixed(2)} received via Stripe Checkout`,
          createdAt: new Date(),
        });

        await requestItem.save();
        console.log(`Payment confirmed for Request ID: ${requestId}`);
      }
    }
  }

  return NextResponse.json({ success: true, received: true }, { status: 200 });
}
