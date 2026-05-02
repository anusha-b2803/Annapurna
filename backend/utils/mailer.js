const nodemailer = require('nodemailer');

// For local testing without a key, we use Ethereal Email which generates a temporary account
let transporter;

const getTransporter = async () => {
  if (transporter) return transporter;

  // Create a test account on the fly if no SMTP credentials are provided
  const testAccount = await nodemailer.createTestAccount();
  
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  
  console.log('✉️ Mailer initialized with Ethereal Test Account:', testAccount.user);
  return transporter;
};

const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const transport = await getTransporter();
    
    const info = await transport.sendMail({
      from: '"Annapurna Support" <no-reply@annapurna.org>',
      to,
      subject,
      text,
      html,
    });

    console.log('🚀 Message sent: %s', info.messageId);
    console.log('🔗 Preview URL: %s', nodemailer.getTestMessageUrl(info));
    
    return info;
  } catch (err) {
    console.error('Email send error:', err);
    throw err;
  }
};

module.exports = { sendEmail };
