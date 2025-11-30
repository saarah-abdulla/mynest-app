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
}

// Create transporter (only if credentials are provided)
const transporter = nodemailer.createTransport(
  emailConfig.auth.user && emailConfig.auth.pass
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

export interface InvitationEmailData {
  to: string
  caregiverName: string
  familyName: string
  inviterName: string
  invitationLink: string
}

export async function sendInvitationEmail(data: InvitationEmailData): Promise<void> {
  const { to, caregiverName, familyName, inviterName, invitationLink } = data

  const mailOptions = {
    from: process.env.SMTP_FROM || `"MyNest" <${process.env.SMTP_USER || 'noreply@mynest.app'}>`,
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
              font-size: 24px;
              font-weight: bold;
              color: #795548;
              margin-bottom: 10px;
            }
            h1 {
              color: #795548;
              font-size: 24px;
              margin-bottom: 20px;
            }
            .content {
              color: #795548;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .button {
              display: inline-block;
              padding: 14px 28px;
              background-color: #B4BFAB;
              color: white;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              margin: 20px 0;
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
                as a caregiver on MyNest, a platform for coordinating childcare.
              </p>
              <p>
                Click the button below to accept the invitation and create your account:
              </p>
              <div style="text-align: center;">
                <a href="${invitationLink}" class="button">Accept Invitation</a>
              </div>
              <p style="font-size: 14px; color: #795548; opacity: 0.7;">
                Or copy and paste this link into your browser:<br>
                <span class="link">${invitationLink}</span>
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
    const info = await transporter.sendMail(mailOptions)
    console.log('Invitation email sent:', info.messageId)
    
    // In development with ethereal, log the preview URL
    if (process.env.NODE_ENV !== 'production' && info.response.includes('ethereal')) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
    }
  } catch (error) {
    console.error('Error sending invitation email:', error)
    throw new Error('Failed to send invitation email')
  }
}



