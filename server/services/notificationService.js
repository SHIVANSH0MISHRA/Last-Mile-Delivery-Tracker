const nodemailer = require('nodemailer');

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT || 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (host && user && pass) {
    transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: parseInt(port) === 465,
      auth: { user, pass }
    });
    console.log('📬 Configured custom SMTP transporter for notifications.');
  } else {
    try {
      console.log('📬 Initializing temporary Ethereal Mail testing account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });
      console.log(`✅ Ethereal Mail active. User: ${testAccount.user}`);
    } catch (err) {
      console.error('❌ Failed to create Ethereal Mail account, using Console Mailer:', err.message);
      transporter = {
        sendMail: async (options) => {
          console.log('\n========================================');
          console.log(`📧 [MOCK EMAIL DISPATCHED]`);
          console.log(`To:      ${options.to}`);
          console.log(`From:    ${options.from}`);
          console.log(`Subject: ${options.subject}`);
          console.log(`Body:\n${options.text}`);
          console.log('========================================\n');
          return { messageId: 'mock-id-' + Math.random() };
        }
      };
    }
  }

  return transporter;
}

/**
 * Sends a transactional order update email
 */
async function sendOrderNotification(order, status, recipientEmail, remarks = '') {
  try {
    const client = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || 'noreply@deliverytracker.local';

    let subject = `Last-Mile Delivery Tracker: Order ${order.orderNumber} Updated to ${status}`;
    let body = `Dear Customer,

Your delivery order (${order.orderNumber}) has been updated.

New Status: ${status.toUpperCase()}
Remarks/Details: ${remarks || 'None'}

Order Details:
---------------------------------------------
Pickup Address: ${order.pickupAddress.street}, ${order.pickupAddress.city} - ${order.pickupAddress.pincode}
Drop Address:   ${order.dropAddress.street}, ${order.dropAddress.city} - ${order.dropAddress.pincode}
Payment Method: ${order.paymentMethod}
Amount:         $${order.pricingDetails.totalRate}
---------------------------------------------

Thank you for choosing Last-Mile Delivery Tracker!`;

    const mailOptions = {
      from: fromAddress,
      to: recipientEmail,
      subject: subject,
      text: body
    };

    const info = await client.sendMail(mailOptions);
    
    // Log preview link if using Ethereal
    if (nodemailer.getTestMessageUrl(info)) {
      console.log(`📧 Email sent! View preview: ${nodemailer.getTestMessageUrl(info)}`);
    } else {
      console.log(`📧 Email sent to ${recipientEmail} for status ${status}.`);
    }
    
    return info;
  } catch (error) {
    console.error(`⚠️ Failed to dispatch notification email: ${error.message}`);
  }
}

module.exports = {
  sendOrderNotification
};
