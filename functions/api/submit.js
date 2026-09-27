// Cloudflare Pages Function — handles all 4 Twin Technologies forms:
// career-application, service-request, general-inquiry, academy-enrollment
//
// Setup needed in the Cloudflare Pages dashboard (Settings > Environment variables):
//   RESEND_API_KEY   — secret, from https://resend.com
//   NOTIFY_TO        — plain text, e.g. contact@twintechnologies.it.com
//
// Also verify the twintechnologies.it.com domain in Resend so email can be
// sent "from" that domain (Resend > Domains > Add Domain, then add the DNS
// records it gives you in Cloudflare DNS). Until that's done, emails can
// only be sent from Resend's own onboarding@resend.dev sandbox address.

const FORM_CONFIG = {
  'career-application': {
    subject: 'New Career Application — Twin Technologies',
    confirmSubject: "We've received your application",
    confirmText:
      "Thanks for applying to Twin Technologies. We've received your application and resume — there's no need to send it again. Our team will review it and reach out if there's a fit."
  },
  'service-request': {
    subject: 'New Service Proposal Request — Twin Technologies',
    confirmSubject: "We've received your request",
    confirmText:
      "Thanks for reaching out to Twin Technologies. We've received your proposal request and any attached files — no need to resend. We'll be in touch shortly with next steps."
  },
  'general-inquiry': {
    subject: 'New General Inquiry — Twin Technologies',
    confirmSubject: "We've received your message",
    confirmText:
      "Thanks for contacting Twin Technologies. We've received your message — no need to send it again. We'll get back to you shortly."
  },
  'academy-enrollment': {
    subject: 'New Academy Enrollment — Twin Technologies',
    confirmSubject: "We've received your enrollment",
    confirmText:
      "Thanks for enrolling with the Twin Technologies Academy. We've received your enrollment details and payment proof — no need to resend. We'll confirm your spot shortly."
  }
};

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const formData = await request.formData();

    // Honeypot — real users never fill this in
    if (formData.get('_gotcha')) {
      return Response.json({ ok: true });
    }

    const formType = formData.get('form_type') || 'general-inquiry';
    const cfg = FORM_CONFIG[formType] || FORM_CONFIG['general-inquiry'];

    const bodyLines = [];
    let submitterEmail = '';
    let submitterName = '';
    const attachments = [];

    for (const [key, value] of formData.entries()) {
      if (key === '_gotcha' || key === 'form_type') continue;

      if (value instanceof File) {
        if (value.size > 0) {
          const buf = await value.arrayBuffer();
          attachments.push({ filename: value.name, content: arrayBufferToBase64(buf) });
          bodyLines.push(`${key}: [attached — ${value.name}]`);
        }
        continue;
      }

      if (!value) continue;
      bodyLines.push(`${key}: ${value}`);
      if (key.toLowerCase().includes('email')) submitterEmail = value;
      if (key.toLowerCase().includes('name')) submitterName = value;
    }

    const notifyTo = env.NOTIFY_TO || 'contact@twintechnologies.it.com';

    await sendEmail(env, {
      to: notifyTo,
      subject: cfg.subject,
      text: bodyLines.join('\n'),
      attachments
    });

    if (submitterEmail) {
      await sendEmail(env, {
        to: submitterEmail,
        subject: cfg.confirmSubject,
        text: `Hi ${submitterName || 'there'},\n\n${cfg.confirmText}\n\n— Twin Technologies`
      });
    }

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json(
      { ok: false, error: 'Something went wrong submitting the form. Please try again or email us directly at contact@twintechnologies.it.com.' },
      { status: 500 }
    );
  }
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

async function sendEmail(env, { to, subject, text, attachments }) {
  const payload = {
    from: 'Twin Technologies <notifications@twintechnologies.it.com>',
    to: [to],
    subject,
    text
  };
  if (attachments && attachments.length) payload.attachments = attachments;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    console.error('Resend error', res.status, await res.text());
  }
}
