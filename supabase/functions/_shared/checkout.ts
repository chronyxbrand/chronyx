import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export type CartInputItem = {
  id?: string;
  productId?: string;
  quantity?: number;
};

export type ShippingInput = {
  name?: string;
  email?: string;
  address?: string;
  city?: string;
  pincode?: string;
  phone?: string;
};

export type CheckoutTotals = {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    lineTotal: number;
  }>;
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  couponCode: string | null;
};

export function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing required secret: ${name}`);
  return value;
}

export function makeAdminClient() {
  return createClient(getRequiredEnv("SUPABASE_URL"), getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY"));
}

export function getBearerToken(req: Request) {
  const header = req.headers.get("Authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

export async function requireUser(req: Request, adminClient: ReturnType<typeof createClient>) {
  const token = getBearerToken(req);
  if (!token) throw new Error("Authentication required");

  const { data, error } = await adminClient.auth.getUser(token);
  if (error || !data.user) throw new Error("Invalid authentication token");
  return data.user;
}

export function normalizeCartItems(cartItems: CartInputItem[]) {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new Error("Cart is empty");
  }

  return cartItems.map((item) => {
    const id = String(item.id || item.productId || "").trim();
    const quantity = Math.max(1, Math.min(3, Number(item.quantity || 1)));
    if (!id) throw new Error("Cart item is missing a product id");
    return { id, quantity };
  });
}

export function sanitizeShipping(shipping: ShippingInput = {}) {
  return {
    name: String(shipping.name || "").trim(),
    email: String(shipping.email || "").trim(),
    address: String(shipping.address || "").trim(),
    city: String(shipping.city || "").trim(),
    pincode: String(shipping.pincode || "").trim(),
    phone: String(shipping.phone || "").trim(),
  };
}

async function loadStoreSettings(adminClient: ReturnType<typeof createClient>) {
  const { data } = await adminClient
    .from("settings")
    .select("value")
    .eq("key", "store_settings")
    .maybeSingle();

  return data?.value || {};
}

async function loadCoupon(adminClient: ReturnType<typeof createClient>, couponCode: string | null) {
  if (!couponCode) return null;

  const { data, error } = await adminClient
    .from("coupons")
    .select("code, discount_percent, is_active, max_uses, times_used, expires_at")
    .eq("code", couponCode)
    .maybeSingle();

  if (error || !data || !data.is_active) return null;
  if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
  if (data.max_uses && Number(data.times_used || 0) >= Number(data.max_uses)) return null;
  return data;
}

export async function computeCheckoutTotals({
  adminClient,
  cartItems,
  shippingMethod,
  coupon,
  includeCodFee = false,
}: {
  adminClient: ReturnType<typeof createClient>;
  cartItems: CartInputItem[];
  shippingMethod?: string;
  coupon?: string;
  includeCodFee?: boolean;
}): Promise<CheckoutTotals> {
  const normalizedCart = normalizeCartItems(cartItems);
  const productIds = Array.from(new Set(normalizedCart.map((item) => item.id)));

  const { data: products, error: productsError } = await adminClient
    .from("products")
    .select("id, name, price, stock_quantity, stock")
    .in("id", productIds);

  if (productsError) throw productsError;

  const productMap = new Map((products || []).map((product) => [String(product.id), product]));
  const items = normalizedCart.map((item) => {
    const product = productMap.get(item.id);
    if (!product) throw new Error(`Product not found: ${item.id}`);

    const stock = Number(product.stock_quantity ?? product.stock ?? 0);
    if (stock < item.quantity) throw new Error(`${product.name} does not have enough stock`);

    const price = Number(product.price || 0);
    const lineTotal = price * item.quantity;
    return {
      id: item.id,
      name: String(product.name || "CHRONYX item"),
      price,
      quantity: item.quantity,
      lineTotal,
    };
  });

  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const settings = await loadStoreSettings(adminClient);
  const shippingFee = shippingMethod === "express" ? Number(settings.express_shipping_fee || 1500) : 0;
  const codFee = includeCodFee ? Number(settings.cod_fee || 100) : 0;
  const couponCode = String(coupon || "").trim().toUpperCase() || null;
  const couponRow = await loadCoupon(adminClient, couponCode);
  const discount = couponRow ? subtotal * (Number(couponRow.discount_percent || 0) / 100) : 0;
  const total = Math.max(0, Math.round(subtotal + shippingFee + codFee - discount));

  return {
    items,
    subtotal,
    shippingFee,
    discount,
    total,
    couponCode: couponRow ? couponRow.code : null,
  };
}

export async function decrementStock(adminClient: ReturnType<typeof createClient>, items: CheckoutTotals["items"]) {
  for (const item of items) {
    const { error } = await adminClient.rpc("decrement_stock", {
      product_id: item.id,
      quantity: item.quantity,
    });
    if (error) throw error;
  }
}

export async function incrementCouponUsage(adminClient: ReturnType<typeof createClient>, couponCode: string | null) {
  if (!couponCode) return;

  const { error } = await adminClient.rpc("increment_coupon_usage", {
    coupon_code: couponCode,
  });
  if (error) throw error;
}

export async function assignAuthenticityUnits({
  adminClient,
  items,
  orderId,
  email,
}: {
  adminClient: ReturnType<typeof createClient>;
  items: CheckoutTotals["items"];
  orderId: string;
  email: string;
}) {
  for (const item of items) {
    const { data: availableUnits, error: fetchError } = await adminClient
      .from("product_auth_units")
      .select("id")
      .eq("product_id", item.id)
      .eq("status", "available")
      .order("serial_number", { ascending: true })
      .limit(item.quantity);

    if (fetchError) throw fetchError;
    if (!availableUnits?.length) continue;

    const selectedUnitIds = availableUnits.map((unit) => unit.id);
    const { error: assignError } = await adminClient
      .from("product_auth_units")
      .update({
        status: "assigned",
        order_id: orderId,
        assigned_to_email: email,
        assigned_at: new Date().toISOString(),
      })
      .in("id", selectedUnitIds);

    if (assignError) throw assignError;
  }
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status,
  });
}
