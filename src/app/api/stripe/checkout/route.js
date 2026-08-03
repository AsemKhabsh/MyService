import { NextResponse } from "next/server";
import stripe from "@/lib/stripe";
import dbConnect from "@/lib/dbConnect";
import RequestModel from "@/models/Request";
import Service from "@/models/Service";
import { getAuthTokenFromRequest, verifyToken } from "@/lib/jwt";

export async function POST(req) {
  try {
    const token = getAuthTokenFromRequest(req);
    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });
    }

    const { requestId } = await req.json();
    if (!requestId) {
      return NextResponse.json({ success: false, message: "Request ID is required" }, { status: 400 });
    }

    await dbConnect();

    const requestItem = await RequestModel.findById(requestId).populate("service").populate("user");
    if (!requestItem) {
      return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
    }

    if (requestItem.user._id.toString() !== decoded.id && decoded.role !== "admin") {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    if (requestItem.paymentStatus === "Paid") {
      return NextResponse.json({ success: false, message: "Request is already paid" }, { status: 400 });
    }

    const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: requestItem.service.title,
              description: requestItem.service.shortDescription,
              images: requestItem.service.image ? [requestItem.service.image] : [],
            },
            unit_amount: Math.round(requestItem.price * 100), // convert dollars to cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      customer_email: requestItem.user.email,
      client_reference_id: requestId,
      metadata: {
        requestId: requestId,
        userId: decoded.id,
        serviceId: requestItem.service._id.toString(),
      },
      success_url: `${origin}/dashboard/requests?payment=success&request_id=${requestId}`,
      cancel_url: `${origin}/dashboard/requests?payment=cancelled&request_id=${requestId}`,
    });

    return NextResponse.json(
      {
        success: true,
        data: { url: session.url, sessionId: session.id },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create payment session: " + error.message },
      { status: 500 }
    );
  }
}
