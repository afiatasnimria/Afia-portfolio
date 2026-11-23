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
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const hits = new Map();

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function cleanHeader(str) {
  return str.replace(/[\r\n\x00-\x1F\x7F]/g, " ").trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function rateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    hits.set(ip, { start: now, count: 1 });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.RESEND_API_KEY) {
    return res.status(500).json({ error: "Contact form isn't configured yet." });
  }

  if (JSON.stringify(req.body || {}).length > 12000) {
    return res.status(413).json({ error: "Message too large." });
  }

  const ip = (req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown")
    .toString()
    .split(",")[0]
    .trim();
  if (rateLimited(ip)) {
    res.setHeader("Retry-After", "600");
    return res.status(429).json({ error: "Too many messages. Please try again later." });
  }

  const { name, email, message, website, elapsed } = req.body || {};

  if (website) {
    return res.status(200).json({ ok: true });
  }
  if (typeof elapsed === "number" && elapsed < 1500) {
    return res.status(400).json({ error: "Please take a moment before sending." });
  }
  if (typeof name !== "string" || typeof email !== "string" || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message format." });
  }
  if (!name.trim() || !email.trim() || !message.trim()) {
    return res.status(400).json({ error: "Name, email and message are all required." });
  }
  if (name.length > MAX_LEN.name || email.length > MAX_LEN.email || message.length > MAX_LEN.message) {
    return res.status(400).json({ error: "One of the fields is too long." });
  }
  if (!isValidEmail(email.trim())) {
    return res.status(400).json({ error: "That email address doesn't look right." });
  }

  try {
    const safeName = escapeHtml(name.trim());
    const safeMessage = escapeHtml(message.trim()).replace(/\n/g, "<br>");
    const safeSubject = cleanHeader(name).slice(0, MAX_LEN.name);
    const replyTo = cleanHeader(email);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Portfolio Contact <onboarding@resend.dev>",
        to: [CONTACT_TO_EMAIL],
        reply_to: replyTo,
        subject: `New portfolio message from ${safeSubject}`,
        html: `
          <p><strong>Name:</strong> ${safeName}</p>
          <p><strong>Email:</strong> ${escapeHtml(replyTo)}</p>
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
