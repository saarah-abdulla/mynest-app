import nodemailer from 'nodemailer'

// Email configuration from environment variables
const emailConfig = {
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  // Connection timeout settings
  connectionTimeout: 10000, // 10 seconds
  greetingTimeout: 10000, // 10 seconds
  socketTimeout: 10000, // 10 seconds
  // Retry settings
  pool: true,
  maxConnections: 1,
  maxMessages: 3,
}

// Check if SMTP is configured
const isSMTPConfigured = Boolean(emailConfig.auth.user && emailConfig.auth.pass)

// Create transporter (only if credentials are provided)
const transporter = nodemailer.createTransport(
  isSMTPConfigured
    ? emailConfig
    : {
        // For development/testing without real SMTP
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: 'ethereal.user',
          pass: 'ethereal.pass',
        },
      },
)

// Log SMTP configuration status on startup
if (!isSMTPConfigured) {
  console.warn('⚠️  SMTP not configured! Invitation emails will not be sent.')
  console.warn('   Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in Railway environment variables.')
  console.warn('   See docs/email-setup-guide.md for setup instructions.')
}

export interface InvitationEmailData {
  to: string
  caregiverName: string
  familyName: string
  inviterName: string
  invitationLink: string
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { to, caregiverName, familyName, inviterName, invitationLink } = data

  // Check if SMTP is configured
  if (!isSMTPConfigured) {
    const error = new Error('SMTP not configured. Please set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASSWORD in Railway environment variables.')
    console.error('❌ Cannot send invitation email:', error.message)
    throw error
  }

  // Validate SMTP_FROM - it should not contain "apikey"
  const smtpFrom = process.env.SMTP_FROM || `"MyNest" <${process.env.SMTP_USER || 'noreply@mynest.app'}>`
  if (smtpFrom.includes('apikey')) {
    console.error('❌ SMTP_FROM contains "apikey" - this is incorrect!')
    console.error('   For SendGrid, SMTP_FROM must be a verified email address.')
    console.error('   Example: "MyNest" <your-verified-email@gmail.com>')
    console.error('   See docs/fix-sendgrid-email.md for setup instructions.')
  }

  const mailOptions = {
    from: smtpFrom,
    to,
    subject: `You've been invited to join ${familyName} on MyNest`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
              line-height: 1.6;
              color: #795548;
              background-color: #F3F1E7;
              margin: 0;
              padding: 20px;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #FDFDFD;
              border-radius: 16px;
              padding: 40px;
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              font-size: 32px;
              font-weight: bold;
              color: #795548;
              margin-bottom: 20px;
              background-color: #FFEB3B;
              display: inline-block;
              padding: 8px 16px;
              border-radius: 8px;
            }
            h1 {
              color: #795548;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 20px;
              text-align: center;
            }
            .content {
              color: #795548;
              font-size: 16px;
              margin-bottom: 30px;
              line-height: 1.8;
            }
            .mynest-highlight {
              background-color: #FFEB3B;
              padding: 2px 4px;
              border-radius: 4px;
              font-weight: 600;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #B4BFAB;
              color: #FFFFFF;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              margin: 20px 0;
              text-align: center;
            }
            .button:hover {
              background-color: #879678;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e0e0e0;
              font-size: 14px;
              color: #795548;
              opacity: 0.7;
            }
            .link {
              color: #B4BFAB;
              word-break: break-all;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">MyNest</div>
            </div>
            <h1>You've been invited!</h1>
            <div class="content">
              <p>Hi ${caregiverName},</p>
              <p>
                <strong>${inviterName}</strong> has invited you to join <strong>${familyName}</strong> 
                as a caregiver on <span class="mynest-highlight">MyNest</span>, a platform for coordinating childcare.
              </p>
              <p>
                Click the button below to accept the invitation and create your account:
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: #795548; opacity: 0.7; margin-top: 20px;">
                Or copy and paste this link into your browser:<br>
                <span class="link" style="color: #795548; word-break: break-all;">${invitationLink}</span>
              </p>
              <p style="font-size: 14px; color: #795548; opacity: 0.7; margin-top: 20px;">
                This invitation will expire in 7 days.
              </p>
            </div>
            <div class="footer">
              <p>If you didn't expect this invitation, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} MyNest. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
    text: `
      Hi ${caregiverName},

      ${inviterName} has invited you to join ${familyName} as a caregiver on MyNest.

      Click the link below to accept the invitation and create your account:
      ${invitationLink}

      This invitation will expire in 7 days.

      If you didn't expect this invitation, you can safely ignore this email.
    `,
  }

  try {
    console.log(`📧 Attempting to send invitation email to: ${to}`)
    console.log(`   From: ${mailOptions.from}`)
    console.log(`   Subject: ${mailOptions.subject}`)
    
    const info = await transporter.sendMail(mailOptions)
    console.log(`✅ Invitation email sent successfully to ${to}`)
    console.log(`   Message ID: ${info.messageId}`)
    
    // In development with ethereal, log the preview URL
    if (process.env.NODE_ENV !== 'production' && info.response.includes('ethereal')) {
      const previewUrl = nodemailer.getTestMessageUrl(info)
      if (previewUrl) {
        console.log(`   Preview URL: ${previewUrl}`)
      }
    }
  } catch (error: any) {
    console.error('❌ Error sending invitation email:')
    console.error('   To:', to)
    console.error('   SMTP Host:', emailConfig.host)
    console.error('   SMTP Port:', emailConfig.port)
    console.error('   Error:', error.message)
    if (error.code) {
      console.error('   Error Code:', error.code)
    }
    if (error.command) {
      console.error('   Failed Command:', error.command)
    }
    if (error.response) {
      console.error('   SMTP Response:', error.response)
    }
    if (error.responseCode) {
      console.error('   Response Code:', error.responseCode)
    }
    
    // Provide helpful error message with troubleshooting steps
    let errorMessage = 'Failed to send invitation email'
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP authentication failed. Check SMTP_USER and SMTP_PASSWORD in Railway. For Gmail, use an App Password, not your regular password.'
    } else if (error.code === 'ECONNECTION' || error.code === 'ETIMEDOUT') {
      errorMessage = `Cannot connect to SMTP server (${emailConfig.host}:${emailConfig.port}). This could be due to:\n` +
        '1. Incorrect SMTP_HOST or SMTP_PORT in Railway\n' +
        '2. Network/firewall blocking the connection\n' +
        '3. SMTP server is down or unreachable\n' +
        '4. Railway IP may be blocked by the SMTP provider\n' +
        'Try using a different SMTP provider (SendGrid, Mailgun, AWS SES) that works better with cloud platforms.'
    } else if (error.code === 'EENVELOPE') {
      errorMessage = 'Invalid email address. Check the recipient email format.'
    } else if (error.message) {
      errorMessage = `Failed to send email: ${error.message}`
    }
    
    throw new Error(errorMessage)
  }
}



