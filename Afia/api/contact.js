// Vercel serverless function: POST /api/contact
// Sends the portfolio contact form to Afia's inbox via Resend.
//
// Requires an environment variable set in the Vercel project:
//   RESEND_API_KEY   — from https://resend.com/api-keys
//
// Until a custom domain is verified on Resend, the "from" address must
// stay on their shared onboarding@resend.dev sender, and Resend's free
// tier only delivers to the email address that owns the Resend account.
// Verify a domain (resend.com/domains) to send to any recipient.

const CONTACT_TO_EMAIL = process.env.CONTACT_TO_EMAIL || "aria2231058@bscse.uiu.ac.bd";
const MAX_LEN = { name: 100, email: 200, message: 4000 };

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Contact form isn't configured yet." });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email and message are all required." });
  }
  if (name.length > MAX_LEN.name || email.length > MAX_LEN.email || message.length > MAX_LEN.message) {
    return res.status(400).json({ error: "One of the fields is too long." });
  }
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "That email address doesn't look right." });
  }

  const safeName = escapeHtml(name.trim());
  const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br>");

  try {
    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: email.trim(),
        subject: `New portfolio message from ${name.trim()}`,
        html: `
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${escapeHtml(email.trim())}</p>
          <p><strong>Message:</strong></p>
          <p>${safeMessage}</p>
        `,
      }),
    });

    if (!resendResponse.ok) {
      const errBody = await resendResponse.json().catch(() => ({}));
      console.error("Resend error:", errBody);
      return res.status(502).json({ error: "Message couldn't be delivered right now." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Contact form error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again." });
  }
}
