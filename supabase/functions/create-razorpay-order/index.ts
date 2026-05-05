import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  computeCheckoutTotals,
  corsHeaders,
  getRequiredEnv,
  jsonResponse,
  makeAdminClient,
  requireUser,
} from "../_shared/checkout.ts";

function basicAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminClient = makeAdminClient();
    await requireUser(req, adminClient);

    const { cartItems, shippingMethod, coupon } = await req.json();
    const totals = await computeCheckoutTotals({
      adminClient,
      cartItems,
      shippingMethod,
      coupon,
      includeCodFee: false,
    });

    const amount = Math.round(totals.total * 100);
    if (amount <= 0) throw new Error("Order amount must be greater than zero");

    const razorpayResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: basicAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency: "INR",
        receipt: `chronyx_${crypto.randomUUID()}`,
        payment_capture: 1,
        notes: {
          item_count: String(totals.items.length),
          coupon: totals.couponCode || "",
        },
      }),
    });

    const orderData = await razorpayResponse.json();
    if (!razorpayResponse.ok) {
      throw new Error(orderData?.error?.description || "Failed to create Razorpay order");
    }

    return jsonResponse({
      id: orderData.id,
      amount: orderData.amount,
      currency: orderData.currency,
      subtotal: totals.subtotal,
      shippingFee: totals.shippingFee,
      discount: totals.discount,
      total: totals.total,
      couponCode: totals.couponCode,
    });
  } catch (error) {
    return jsonResponse({ error: error.message || "Payment initialization failed" }, 400);
  }
});
