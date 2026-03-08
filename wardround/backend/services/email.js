/**
 * Email service using the Resend API.
 *
 * Two exported functions:
 *   sendFamilyUpdateEmail      — per family-member email with the nightly care summary.
 *   sendCoordinatorDiscrepancyAlert — single email to the coordinator listing all FLAGGED clients.
 *
 * Both functions fail gracefully: if RESEND_API_KEY is not set or Resend returns
 * an error, a warning is logged and the cron job continues uninterrupted.
 */

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM   = process.env.RESEND_FROM || 'CareSync <onboarding@resend.dev>';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateStr) {
    if (!dateStr) return dateStr;
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day).toLocaleDateString('en-CA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
}

/**
 * Wrap plain-text content in a minimal, readable HTML shell.
 * Line-breaks become <br> tags so the summary reads naturally in email clients.
 */
function textToHtml(text) {
    const escaped = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return escaped.replace(/\n/g, '<br>');
}

function guard(label) {
    if (!process.env.RESEND_API_KEY) {
        console.warn(`[email/${label}] RESEND_API_KEY not set — skipping email.`);
        return false;
    }
    return true;
}

// ── sendFamilyUpdateEmail ─────────────────────────────────────────────────────

/**
 * Send the nightly care summary to a single family-member email address.
 *
 * @param {{ to: string, clientName: string, summaryDate: string, summaryText: string }} opts
 */
export async function sendFamilyUpdateEmail({ to, clientName, summaryDate, summaryText }) {
    if (!guard('family')) return;
    if (!to) return;

    const dateLabel = formatDate(summaryDate);

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%);padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">CareSync</p>
            <p style="margin:4px 0 0;font-size:14px;color:#bfdbfe;">Daily Care Update</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:.06em;font-weight:600;">
              ${dateLabel}
            </p>
            <h2 style="margin:0 0 20px;font-size:18px;color:#0f172a;">Update for ${clientName}</h2>
            <div style="font-size:15px;color:#334155;line-height:1.7;white-space:pre-wrap;">
              ${textToHtml(summaryText)}
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 32px;border-top:1px solid #f1f5f9;">
            <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
              This update was generated automatically by CareSync on behalf of the care team.
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
        const { error } = await resend.emails.send({
            from: FROM,
            to: [to],
            subject: `CareSync: Daily update for ${clientName} — ${dateLabel}`,
            html,
        });
        if (error) {
            console.warn(`[email/family] Resend error for ${to} (${clientName}):`, error.message ?? error);
        } else {
            console.log(`[email/family] Sent family update for ${clientName} → ${to}`);
        }
    } catch (err) {
        console.warn(`[email/family] Failed to send for ${clientName} → ${to}:`, err.message);
    }
}

// ── sendCoordinatorDiscrepancyAlert ──────────────────────────────────────────

/**
 * Send a single alert email to the coordinator listing all FLAGGED clients.
 *
 * @param {{ flaggedResults: Array<{name:string, clientId:string, status:string, summary:string}>, appUrl?: string }} opts
 */
export async function sendCoordinatorDiscrepancyAlert({ flaggedResults, appUrl }) {
    if (!guard('sentinel')) return;

    const coordinatorEmail = process.env.COORDINATOR_EMAIL;
    if (!coordinatorEmail) {
        console.warn('[email/sentinel] COORDINATOR_EMAIL not set — skipping alert.');
        return;
    }

    if (!flaggedResults || flaggedResults.length === 0) return;

    const date = new Date().toLocaleDateString('en-CA', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    const clientRows = flaggedResults.map(r => `
        <tr>
          <td style="padding:16px;border-bottom:1px solid #fee2e2;vertical-align:top;">
            <p style="margin:0 0 4px;font-weight:700;font-size:15px;color:#0f172a;">${r.name}</p>
            <span style="display:inline-block;padding:2px 10px;border-radius:9999px;background:#fee2e2;color:#b91c1c;font-size:11px;font-weight:700;letter-spacing:.06em;">FLAGGED</span>
          </td>
          <td style="padding:16px;border-bottom:1px solid #fee2e2;vertical-align:top;font-size:13px;color:#475569;line-height:1.6;white-space:pre-wrap;">${textToHtml(r.summary)}</td>
        </tr>`).join('');

    const viewLink = appUrl
        ? `<p style="margin:16px 0 0;font-size:13px;color:#64748b;">
             View full details on the website:
             <a href="${appUrl}/coordinator" style="color:#2563eb;text-decoration:none;">${appUrl}/coordinator</a>
           </p>`
        : '';

    const html = `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:32px 0;">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;border:1px solid #fecaca;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#dc2626 0%,#b91c1c 100%);padding:28px 32px;">
            <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;">CareSync — Medication Alert</p>
            <p style="margin:4px 0 0;font-size:14px;color:#fecaca;">Overnight Sentinel Report · ${date}</p>
          </td>
        </tr>
        <!-- Alert bar -->
        <tr>
          <td style="background:#fef2f2;padding:14px 32px;border-bottom:1px solid #fecaca;">
            <p style="margin:0;font-size:14px;color:#b91c1c;font-weight:600;">
              ⚠️ ${flaggedResults.length} client${flaggedResults.length > 1 ? 's' : ''} flagged for medication discrepanc${flaggedResults.length > 1 ? 'ies' : 'y'} — immediate review recommended.
            </p>
          </td>
        </tr>
        <!-- Table -->
        <tr>
          <td style="padding:24px 32px 0;">
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fee2e2;border-radius:10px;overflow:hidden;">
              <thead>
                <tr style="background:#fef2f2;">
                  <th style="text-align:left;padding:10px 16px;font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:.06em;width:30%;">Client</th>
                  <th style="text-align:left;padding:10px 16px;font-size:11px;font-weight:700;color:#b91c1c;text-transform:uppercase;letter-spacing:.06em;">Discrepancy Details</th>
                </tr>
              </thead>
              <tbody>
                ${clientRows}
              </tbody>
            </table>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px 28px;">
            ${viewLink}
            <p style="margin:${appUrl ? '12px' : '0'} 0 0;font-size:12px;color:#94a3b8;line-height:1.6;">
              This alert was generated automatically by the CareSync overnight medication sentinel.
              Please do not reply to this email.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    try {
        const { error } = await resend.emails.send({
            from: FROM,
            to: [coordinatorEmail],
            subject: `CareSync: ⚠️ ${flaggedResults.length} medication discrepanc${flaggedResults.length > 1 ? 'ies' : 'y'} flagged — ${date}`,
            html,
        });
        if (error) {
            console.warn('[email/sentinel] Resend error:', error.message ?? error);
        } else {
            console.log(`[email/sentinel] Coordinator alert sent to ${coordinatorEmail} (${flaggedResults.length} flagged client(s))`);
        }
    } catch (err) {
        console.warn('[email/sentinel] Failed to send coordinator alert:', err.message);
    }
}
