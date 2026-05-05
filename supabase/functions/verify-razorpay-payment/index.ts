import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  assignAuthenticityUnits,
  computeCheckoutTotals,
  corsHeaders,
  decrementStock,
  getRequiredEnv,
  jsonResponse,
  makeAdminClient,
  requireUser,
  incrementCouponUsage,
  sanitizeShipping,
} from "../_shared/checkout.ts";

function basicAuthHeader() {
  const keyId = getRequiredEnv("RAZORPAY_KEY_ID");
  const keySecret = getRequiredEnv("RAZORPAY_KEY_SECRET");
  return `Basic ${btoa(`${keyId}:${keySecret}`)}`;
}

async function hmacSha256Hex(message: string, secret: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const expected = await hmacSha256Hex(
    `${razorpayOrderId}|${razorpayPaymentId}`,
    getRequiredEnv("RAZORPAY_KEY_SECRET"),
  );

  if (expected !== razorpaySignature) {
    throw new Error("Payment signature verification failed");
  }
}

async function loadRazorpayPayment(paymentId: string) {
  const response = await fetch(`https://api.razorpay.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: basicAuthHeader(),
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || "Failed to verify Razorpay payment");
  }

  return data;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const adminClient = makeAdminClient();
    const user = await requireUser(req, adminClient);
    const {
      razorpay_payment_id,
      razorpay_order_id,
      razorpay_signature,
      cartItems,
      shipping = {},
      shippingMethod,
      coupon,
      paymentMethod,
    } = await req.json();

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      throw new Error("Missing Razorpay verification fields");
    }

    await verifyRazorpaySignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    const totals = await computeCheckoutTotals({
      adminClient,
      cartItems,
      shippingMethod,
      coupon,
      includeCodFee: false,
    });
    const expectedAmount = Math.round(totals.total * 100);
    const payment = await loadRazorpayPayment(razorpay_payment_id);

    if (payment.order_id !== razorpay_order_id) {
      throw new Error("Payment order mismatch");
    }

    if (payment.currency !== "INR" || Number(payment.amount) !== expectedAmount) {
      throw new Error("Payment amount mismatch");
    }

    if (!["captured", "authorized"].includes(payment.status)) {
      throw new Error(`Payment is not complete: ${payment.status}`);
    }

    const safeShipping = sanitizeShipping(shipping);
    const orderData = {
      customer_email: user.email,
      customer_name: safeShipping.name || user.email?.split("@")[0] || "Customer",
      items: totals.items,
      total_amount: totals.total,
      total: totals.total,
      status: "paid",
      shipping_address: {
        address: safeShipping.address,
        city: safeShipping.city,
        pincode: safeShipping.pincode,
        phone: safeShipping.phone,
        email: safeShipping.email,
        shippingMethod,
      },
      payment_method: paymentMethod || "Razorpay",
      razorpay_payment_id,
      razorpay_order_id,
    };

    const { data: insertedOrder, error: insertError } = await adminClient
      .from("orders")
      .insert([orderData])
      .select()
      .single();

    if (insertError) throw insertError;

    await decrementStock(adminClient, totals.items);
    await incrementCouponUsage(adminClient, totals.couponCode);
    await assignAuthenticityUnits({
      adminClient,
      items: totals.items,
      orderId: insertedOrder.id,
      email: user.email,
    });

    return jsonResponse({ success: true, order: insertedOrder });
  } catch (error) {
    return jsonResponse({ error: error.message || "Payment verification failed" }, 400);
  }
});
