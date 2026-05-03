import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");

    if (!resendApiKey || !resendFromEmail) {
      throw new Error("Missing required Resend secrets");
    }

    const { name, email, message, supportEmail } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      throw new Error("Name, email, and message are required");
    }

    const cleanedName = escapeHtml(name.trim());
    const cleanedEmail = escapeHtml(email.trim());
    const cleanedMessage = escapeHtml(message.trim()).replaceAll("\n", "<br />");
    const targetSupportEmail = supportEmail?.trim() || "hello@chronyx.in";

    const adminHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9b7a54;">CHRONYX Contact Request</p>
        <h1 style="margin:0 0 16px 0;font-size:28px;color:#171310;">New customer message</h1>
        <p style="margin:0 0 8px 0;"><strong>Name:</strong> ${cleanedName}</p>
        <p style="margin:0 0 8px 0;"><strong>Email:</strong> ${cleanedEmail}</p>
        <div style="margin-top:18px;padding:18px;border:1px solid #eadfce;border-radius:16px;background:#fffaf4;">
          ${cleanedMessage}
        </div>
      </div>
    `;

    const customerHtml = `
      <div style="font-family:Arial,sans-serif;max-width:620px;margin:0 auto;padding:24px;">
        <p style="margin:0 0 8px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9b7a54;">CHRONYX</p>
        <h1 style="margin:0 0 16px 0;font-size:28px;color:#171310;">We received your message</h1>
        <p style="margin:0 0 14px 0;color:#2c241d;line-height:1.7;">Hi ${cleanedName}, thank you for reaching out. Our team will review your message and get back to you as soon as possible.</p>
        <p style="margin:0;color:#2c241d;line-height:1.7;">If your request is urgent, you can also reply directly to this email.</p>
      </div>
    `;

    const adminResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: targetSupportEmail,
        reply_to: email.trim(),
        subject: `New CHRONYX contact message from ${name.trim()}`,
        html: adminHtml,
      }),
    });

    const adminData = await adminResponse.json();
    if (!adminResponse.ok) {
      throw new Error(adminData?.message || "Failed to send support email");
    }

    const customerResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: email.trim(),
        subject: "We received your CHRONYX message",
        html: customerHtml,
      }),
    });

    const customerData = await customerResponse.json();
    if (!customerResponse.ok) {
      throw new Error(customerData?.message || "Failed to send customer confirmation email");
    }

    return new Response(JSON.stringify({ success: true, adminData, customerData }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
