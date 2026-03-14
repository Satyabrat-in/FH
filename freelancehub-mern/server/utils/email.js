const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: { user: process.env.SMTP_EMAIL, pass: process.env.SMTP_PASSWORD }
  });

  await transporter.sendMail({
    from: `"${process.env.FROM_NAME}" <${process.env.FROM_EMAIL}>`,
    to, subject, html
  });
};

const emailTemplates = {
  verification: (name, url) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#00D4AA;">Welcome to FreelanceHub, ${name}!</h2>
      <p>Please verify your email address to activate your account.</p>
      <a href="${url}" style="background:#00D4AA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">Verify Email</a>
      <p style="color:#666;font-size:13px;">Link expires in 24 hours. If you did not create this account, ignore this email.</p>
    </div>`,
  passwordReset: (name, url) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#00D4AA;">Password Reset Request</h2>
      <p>Hi ${name}, you requested a password reset.</p>
      <a href="${url}" style="background:#00D4AA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">Reset Password</a>
      <p style="color:#666;font-size:13px;">Link expires in 10 minutes. If you did not request this, ignore this email.</p>
    </div>`,
  applicationReceived: (employerName, projectTitle, freelancerName) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#00D4AA;">New Application Received</h2>
      <p>Hi ${employerName}, <strong>${freelancerName}</strong> has applied to your project <strong>${projectTitle}</strong>.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00D4AA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">View Application</a>
    </div>`,
  contractCreated: (name, projectTitle) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#00D4AA;">Contract Created</h2>
      <p>Hi ${name}, a contract has been created for <strong>${projectTitle}</strong>. Please review and accept it to begin work.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00D4AA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">View Contract</a>
    </div>`,
  paymentReleased: (name, amount, projectTitle) => `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:20px;">
      <h2 style="color:#00D4AA;">Payment Released</h2>
      <p>Hi ${name}, ₹${amount.toLocaleString('en-IN')} has been released to your account for <strong>${projectTitle}</strong>.</p>
      <a href="${process.env.CLIENT_URL}/dashboard" style="background:#00D4AA;color:#fff;padding:12px 24px;text-decoration:none;border-radius:6px;display:inline-block;margin:16px 0;">View Earnings</a>
    </div>`
};

module.exports = { sendEmail, emailTemplates };
