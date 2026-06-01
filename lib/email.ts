import { Resend } from "resend";

let _resend: Resend | null = null;

function client() {
  if (_resend) return _resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY not set");
  _resend = new Resend(key);
  return _resend;
}

const FROM =
  process.env.RESEND_FROM_EMAIL ?? "bizfoo <noreply@bizfoo.com>";

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendEmail(input: SendEmailInput) {
  const c = client();
  return c.emails.send({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}

const STOREFRONT_BASE =
  process.env.NEXT_PUBLIC_STOREFRONT_ACCESS_BASE ??
  "https://summoniq.com/store/access";

export function grantEmailHtml(opts: {
  productName: string;
  deliverableTitle: string;
  accessUrl: string;
  expiresAt: Date | null;
  customBody: string | null;
}) {
  const expiry = opts.expiresAt
    ? `<p style="color:#71717a;font-size:13px;margin:16px 0 0;">Link expires ${opts.expiresAt.toLocaleString()}.</p>`
    : "";
  const intro =
    opts.customBody ??
    "Thanks for your purchase — your delivery is ready below.";

  return `
<!doctype html>
<html><body style="margin:0;background:#0a0a0b;color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0b;padding:32px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111114;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px;">
        <tr><td>
          <div style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:#a8f015;font-weight:600;">bizfoo delivery</div>
          <h1 style="font-size:22px;margin:8px 0 4px;color:#fafafa;">${escape(opts.productName)}</h1>
          <div style="font-size:14px;color:#a1a1aa;">${escape(opts.deliverableTitle)}</div>
          <p style="margin:24px 0 0;font-size:14px;line-height:1.55;color:#d4d4d8;">${escape(intro)}</p>
          <div style="margin:24px 0 8px;">
            <a href="${opts.accessUrl}" style="display:inline-block;background:#a8f015;color:#09090b;font-weight:600;padding:12px 18px;border-radius:10px;text-decoration:none;font-size:14px;">Access your purchase</a>
          </div>
          ${expiry}
          <div style="margin-top:32px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);font-size:12px;color:#71717a;">Sent by bizfoo on behalf of the storefront. If you didn't make this purchase, reply to let us know.</div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`.trim();
}

function escape(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
