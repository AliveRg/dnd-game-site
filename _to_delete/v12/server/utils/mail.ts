import nodemailer from 'nodemailer'

let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (transporter) return transporter
  const c = useRuntimeConfig()
  if (!c.smtpHost || !c.smtpUser) return null
  const port = Number(c.smtpPort) || 465
  transporter = nodemailer.createTransport({
    host: c.smtpHost,
    port,
    secure: port === 465,
    auth: { user: c.smtpUser, pass: c.smtpPass }
  })
  return transporter
}

const esc = (s: unknown) =>
  String(s ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]!)

export async function sendMail(subject: string, rows: Record<string, unknown>) {
  const c = useRuntimeConfig()
  const t = getTransporter()
  if (!t || !c.mailTo) {
    console.warn('[mail] SMTP не настроен - письмо не отправлено:', subject, rows)
    return false
  }
  const text = Object.entries(rows).map(([k, v]) => `${k}: ${v ?? ''}`).join('\n')
  const html = `<h2 style="font-family:sans-serif">${esc(subject)}</h2>
    <table cellpadding="6" style="font-family:sans-serif;border-collapse:collapse">
      ${Object.entries(rows)
        .map(([k, v]) => `<tr><td style="color:#888">${esc(k)}</td><td><b>${esc(v)}</b></td></tr>`)
        .join('')}
    </table>`
  await t.sendMail({
    from: c.mailFrom || c.smtpUser,
    to: String(c.mailTo).split(',').map((s) => s.trim()).filter(Boolean),
    subject,
    text,
    html
  })
  return true
}
