import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Create reusable transporter
const createTransporter = () => {
  // Check if email credentials are configured
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;
  const emailHost = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const emailPort = parseInt(process.env.EMAIL_PORT || '587');

  if (!emailUser || !emailPass) {
    console.log('⚠️  Email credentials not configured. Using test account...');
    return null;
  }

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
};

/**
 * Send OTP email for Super Admin verification
 */
export const sendOTPEmail = async (email: string, otp: string, name: string): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    // If no transporter (credentials not configured), log OTP to console
    if (!transporter) {
      console.log('\n📧 ========================================');
      console.log('🔐 SUPER ADMIN OTP (Development Mode)');
      console.log('========================================');
      console.log(`👤 Name: ${name}`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔢 OTP: ${otp}`);
      console.log('⏱️  Valid for: 10 minutes');
      console.log('========================================\n');
      return true; // Return success for development
    }

    const mailOptions: EmailOptions = {
      to: email,
      subject: '🔐 Your Super Admin Verification OTP - Library Management System',
      text: `
Hello ${name},

Your OTP for Super Admin verification is: ${otp}

This OTP is valid for 10 minutes only.

Please do not share this OTP with anyone.

If you didn't request this, please ignore this email.

Best regards,
Library Management System Team
      `,
      html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .container {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 40px;
      border-radius: 10px;
      color: white;
    }
    .otp-box {
      background: white;
      color: #333;
      padding: 30px;
      text-align: center;
      border-radius: 8px;
      margin: 20px 0;
    }
    .otp-code {
      font-size: 36px;
      font-weight: bold;
      letter-spacing: 8px;
      color: #667eea;
      margin: 20px 0;
      font-family: 'Courier New', monospace;
    }
    .warning {
      background: #fff3cd;
      color: #856404;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
      border-left: 4px solid #ffc107;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #e0e0e0;
    }
    .icon {
      font-size: 48px;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center;">
      <div class="icon">👑</div>
      <h1 style="margin: 0;">Super Admin Verification</h1>
      <p>Library Management System</p>
    </div>
    
    <div class="otp-box">
      <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Hello <strong>${name}</strong>,</p>
      <p style="margin: 0 0 20px 0; color: #666;">Your One-Time Password (OTP) is:</p>
      <div class="otp-code">${otp}</div>
      <p style="margin: 20px 0 0 0; color: #999; font-size: 13px;">⏱️ Valid for 10 minutes</p>
    </div>

    <div class="warning">
      <strong>🔒 Security Notice:</strong><br>
      • Never share this OTP with anyone<br>
      • This OTP is for Super Admin account creation only<br>
      • If you didn't request this, please ignore this email
    </div>

    <div style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 5px; margin-top: 20px;">
      <p style="margin: 0; font-size: 14px;">
        <strong>What's Next?</strong><br>
        Enter this OTP on the verification page to complete your Super Admin account setup.
      </p>
    </div>

    <div class="footer">
      <p>© 2026 Library Management System. All rights reserved.</p>
      <p>This is an automated email. Please do not reply.</p>
    </div>
  </div>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ OTP Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Error sending OTP email:', error);
    // Log to console as fallback
    console.log('\n📧 ========================================');
    console.log('🔐 SUPER ADMIN OTP (Email Failed - Fallback)');
    console.log('========================================');
    console.log(`👤 Name: ${name}`);
    console.log(`📧 Email: ${email}`);
    console.log(`🔢 OTP: ${otp}`);
    console.log('⏱️  Valid for: 10 minutes');
    console.log('========================================\n');
    return false; // Return false to indicate email sending failed
  }
};

/**
 * Send admin approval notification email
 */
export const sendAdminApprovalEmail = async (
  email: string,
  name: string,
  isApproved: boolean
): Promise<boolean> => {
  try {
    const transporter = createTransporter();

    if (!transporter) {
      console.log(`\n📧 Admin ${isApproved ? 'Approved' : 'Rejected'}: ${name} (${email})\n`);
      return true;
    }

    const subject = isApproved
      ? '✅ Your Admin Account Has Been Approved!'
      : '❌ Admin Account Request Update';

    const text = isApproved
      ? `
Hello ${name},

Great news! Your admin account request has been approved by the Super Admin.

You can now login to the admin panel using your credentials.

Login URL: http://localhost:3001/admin-login

Best regards,
Library Management System Team
      `
      : `
Hello ${name},

We regret to inform you that your admin account request has been reviewed and not approved at this time.

If you believe this is an error, please contact the Super Admin.

Best regards,
Library Management System Team
      `;

    const html = isApproved
      ? `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px; border-radius: 10px; color: white; }
    .content-box { background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .button { display: inline-block; background: #10b981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .icon { font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center;">
      <div class="icon">✅</div>
      <h1 style="margin: 0;">Account Approved!</h1>
    </div>
    <div class="content-box">
      <p>Hello <strong>${name}</strong>,</p>
      <p>Congratulations! Your admin account request has been approved by the Super Admin.</p>
      <p>You can now access the admin panel with full administrative privileges.</p>
      <div style="text-align: center;">
        <a href="http://localhost:3001/admin-login" class="button">Login to Admin Panel</a>
      </div>
    </div>
  </div>
</body>
</html>
      `
      : `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    .container { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 40px; border-radius: 10px; color: white; }
    .content-box { background: white; color: #333; padding: 30px; border-radius: 8px; margin: 20px 0; }
    .icon { font-size: 48px; margin-bottom: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div style="text-align: center;">
      <div class="icon">❌</div>
      <h1 style="margin: 0;">Account Request Update</h1>
    </div>
    <div class="content-box">
      <p>Hello <strong>${name}</strong>,</p>
      <p>We regret to inform you that your admin account request has been reviewed and not approved at this time.</p>
      <p>If you have any questions or believe this is an error, please contact the Super Admin.</p>
    </div>
  </div>
</body>
</html>
      `;

    const mailOptions: EmailOptions = {
      to: email,
      subject,
      text,
      html,
    };

    await transporter.sendMail(mailOptions);
    console.log(`✅ Admin ${isApproved ? 'approval' : 'rejection'} email sent to:`, email);
    return true;
  } catch (error) {
    console.error('❌ Error sending admin approval email:', error);
    return false;
  }
};
