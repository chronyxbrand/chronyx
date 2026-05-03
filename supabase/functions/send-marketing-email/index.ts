import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const renderEmailHtml = ({
  subject,
  message,
  ctaLabel,
  ctaUrl,
}: {
  subject: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
}) => {
  const paragraphs = message
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<p style="margin:0 0 14px 0;color:#2c241d;line-height:1.7;">${line}</p>`)
    .join("");

  const cta = ctaLabel && ctaUrl
    ? `<a href="${ctaUrl}" style="display:inline-block;margin-top:10px;padding:12px 18px;border-radius:999px;background:#1a1511;color:#f5eee6;text-decoration:none;font-weight:600;">${ctaLabel}</a>`
    : "";

  return `
    <div style="background:#f6f0e8;padding:32px 16px;font-family:Arial,sans-serif;">
      <div style="max-width:620px;margin:0 auto;background:#fffaf4;border:1px solid #eadfce;border-radius:20px;padding:32px;">
        <p style="margin:0 0 10px 0;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#9b7a54;">CHRONYX</p>
        <h1 style="margin:0 0 18px 0;font-size:28px;line-height:1.2;color:#171310;">${subject}</h1>
        ${paragraphs}
        ${cta}
      </div>
    </div>
  `;
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const resendFromEmail = Deno.env.get("RESEND_FROM_EMAIL");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!resendApiKey || !resendFromEmail || !supabaseUrl || !serviceRoleKey) {
      throw new Error("Missing required email or Supabase secrets");
    }

    const { segment = "all", subject, message, ctaLabel, ctaUrl } = await req.json();

    if (!subject?.trim() || !message?.trim()) {
      throw new Error("Subject and message are required");
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const { data: subscribers, error: subscribersError } = await adminClient
      .from("subscribers")
      .select("email");
    if (subscribersError) throw subscribersError;

    const { data: waitlistEntries, error: waitlistError } = await adminClient
      .from("waitlist")
      .select("email, is_newsletter");
    if (waitlistError) throw waitlistError;

    const recipientSet = new Set<string>();

    if (segment === "all" || segment === "subscribers") {
      (subscribers || []).forEach((entry: { email: string }) => {
        if (entry.email) recipientSet.add(entry.email.toLowerCase());
      });
    }

    (waitlistEntries || []).forEach((entry: { email: string; is_newsletter: boolean }) => {
      if (!entry.email) return;

      if (segment === "all") recipientSet.add(entry.email.toLowerCase());
      if (segment === "newsletter" && entry.is_newsletter) recipientSet.add(entry.email.toLowerCase());
      if (segment === "waitlist" && !entry.is_newsletter) recipientSet.add(entry.email.toLowerCase());
    });

    const recipients = Array.from(recipientSet);

    if (!recipients.length) {
      throw new Error("No recipients found for the selected audience");
    }

    const html = renderEmailHtml({ subject, message, ctaLabel, ctaUrl });

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: resendFromEmail,
        to: recipients,
        subject,
        html,
      }),
    });

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      throw new Error(resendData?.message || "Failed to send marketing email");
    }

    return new Response(JSON.stringify({ success: true, recipients: recipients.length, resendData }), {
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
