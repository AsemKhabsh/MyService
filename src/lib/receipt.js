/**
 * Utility to generate digital payment receipt metadata and URL structure.
 */
export function generateReceiptData({ paymentId, request, user, amount, currency, stripePaymentIntent }) {
  const dateStr = new Date().toISOString().split("T")[0];
  const receiptNumber = `REC-${dateStr.replace(/-/g, "")}-${paymentId.toString().slice(-6).toUpperCase()}`;

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const receiptUrl = `${appUrl}/dashboard/requests/${request._id || request}?receipt=${receiptNumber}`;

  return {
    receiptNumber,
    receiptUrl,
    issuedAt: new Date(),
    amount,
    currency,
    stripePaymentIntent,
    customerName: user.name || "Customer",
    customerEmail: user.email || "",
  };
}
