import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses'
import { config } from 'dotenv'

config()

class EmailService {
  private sesClient: SESClient

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string
      }
    })
  }

  async sendVerificationEmail(to: string, email_verify_token: string) {
    const verifyEmailUrl = `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
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
                background: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .title {
                color: #333;
                margin-bottom: 20px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #007bff;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .button:hover {
                background-color: #0056b3;
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 14px;
                color: #666;
            }
            .warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                color: #856404;
                padding: 15px;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🌟 Cosmetic Store</div>
                <h1 class="title">Verify Your Email Address</h1>
            </div>
            
            <p>Hi there!</p>
            
            <p>Thank you for registering with our cosmetic store. To complete your registration and start shopping for amazing beauty products, please verify your email address.</p>
            
            <div style="text-align: center;">
                <a href="${verifyEmailUrl}" class="button">Verify Email Address</a>
            </div>
            
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 3px;">
                ${verifyEmailUrl}
            </p>
            
            <div class="warning">
                <strong>⚠️ Important:</strong> This verification link will expire in 7 days. If you didn't create an account with us, please ignore this email.
            </div>
            
            <div class="footer">
                <p>Best regards,<br>
                The Cosmetic Store Team</p>
                
                <p><small>If you have any questions, please contact our support team.</small></p>
            </div>
        </div>
    </body>
    </html>
    `

    const textContent = `
    Verify Your Email Address
    
    Hi there!
    
    Thank you for registering with our cosmetic store. To complete your registration, please verify your email address by clicking the following link:
    
    ${verifyEmailUrl}
    
    This verification link will expire in 7 days. If you didn't create an account with us, please ignore this email.
    
    Best regards,
    The Cosmetic Store Team
    `

    const params = {
      Source: process.env.MAIL_FROM as string,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: '🌟 Verify Your Email - Cosmetic Store',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          },
          Text: {
            Data: textContent,
            Charset: 'UTF-8'
          }
        }
      }
    }

    try {
      const command = new SendEmailCommand(params)
      const response = await this.sesClient.send(command)
      console.log('Email sent successfully:', response.MessageId)
      return { success: true, messageId: response.MessageId }
    } catch (error) {
      console.error('Error sending email:', error)
      throw new Error('Failed to send verification email')
    }
  }

  async sendWelcomeEmail(to: string, name: string) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to Cosmetic Store</title>
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
                background: #f9f9f9;
                padding: 30px;
                border-radius: 10px;
                box-shadow: 0 0 10px rgba(0,0,0,0.1);
            }
            .header {
                text-align: center;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #007bff;
                margin-bottom: 10px;
            }
            .welcome-banner {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin-bottom: 30px;
            }
            .button {
                display: inline-block;
                padding: 12px 30px;
                background-color: #28a745;
                color: white;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
            }
            .features {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
            }
            .feature {
                background: white;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
            }
            .footer {
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                font-size: 14px;
                color: #666;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">🌟 Cosmetic Store</div>
            </div>
            
            <div class="welcome-banner">
                <h1>Welcome, ${name}! 🎉</h1>
                <p>Your email has been verified successfully!</p>
            </div>
            
            <p>Congratulations! You're now part of our beauty community. Get ready to discover amazing cosmetic products and exclusive deals.</p>
            
            <div class="features">
                <div class="feature">
                    <h3>💄 Premium Products</h3>
                    <p>Access to high-quality cosmetics from top brands</p>
                </div>
                <div class="feature">
                    <h3>🎁 Exclusive Offers</h3>
                    <p>Special discounts and early access to sales</p>
                </div>
                <div class="feature">
                    <h3>✨ Beauty Tips</h3>
                    <p>Expert advice and tutorials from makeup artists</p>
                </div>
                <div class="feature">
                    <h3>🚀 Fast Shipping</h3>
                    <p>Quick delivery right to your doorstep</p>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.CLIENT_URL}" class="button">Start Shopping Now</a>
            </div>
            
            <div class="footer">
                <p>Thank you for choosing Cosmetic Store!</p>
                <p><small>Follow us on social media for the latest updates and beauty tips.</small></p>
            </div>
        </div>
    </body>
    </html>
    `

    const params = {
      Source: process.env.MAIL_FROM as string,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: '🎉 Welcome to Cosmetic Store - Your Account is Ready!',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          }
        }
      }
    }

    try {
      const command = new SendEmailCommand(params)
      const response = await this.sesClient.send(command)
      console.log('Welcome email sent successfully:', response.MessageId)
      return { success: true, messageId: response.MessageId }
    } catch (error) {
      console.error('Error sending welcome email:', error)
      throw new Error('Failed to send welcome email')
    }
  }
  async sendForgotPasswordEmail(to: string, forgot_password_token: string, name: string) {
    const resetPasswordUrl = `${process.env.CLIENT_URL}/reset-password?token=${forgot_password_token}`

    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
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
              background: #f9f9f9;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
          }
          .title {
              color: #333;
              margin-bottom: 20px;
          }
          .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #dc3545;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
          }
          .button:hover {
              background-color: #c82333;
          }
          .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              color: #666;
          }
          .warning {
              background-color: #f8d7da;
              border: 1px solid #f5c6cb;
              color: #721c24;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          .security-tips {
              background-color: #d1ecf1;
              border: 1px solid #bee5eb;
              color: #0c5460;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">🌟 Cosmetic Store</div>
              <h1 class="title">🔐 Reset Your Password</h1>
          </div>
          
          <p>Hi ${name},</p>
          
          <p>We received a request to reset your password for your Cosmetic Store account. If you made this request, click the button below to reset your password:</p>
          
          <div style="text-align: center;">
              <a href="${resetPasswordUrl}" class="button">Reset Password</a>
          </div>
          
          <p>Or copy and paste this link in your browser:</p>
          <p style="word-break: break-all; background: #f1f1f1; padding: 10px; border-radius: 3px;">
              ${resetPasswordUrl}
          </p>
          
          <div class="warning">
              <strong>⚠️ Important:</strong> This password reset link will expire in 15 minutes for security reasons.
          </div>
          
          <div class="security-tips">
              <strong>🛡️ Security Tips:</strong>
              <ul>
                  <li>Never share your password with anyone</li>
                  <li>Use a strong, unique password</li>
                  <li>If you didn't request this reset, please ignore this email</li>
                  <li>Consider enabling two-factor authentication</li>
              </ul>
          </div>
          
          <div class="footer">
              <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
              <p>Best regards,<br>
              The Cosmetic Store Security Team</p>
              
              <p><small>If you have any questions about your account security, please contact our support team immediately.</small></p>
          </div>
      </div>
  </body>
  </html>
  `

    const textContent = `
  Reset Your Password - Cosmetic Store
  
  Hi ${name},
  
  We received a request to reset your password for your Cosmetic Store account.
  
  To reset your password, click the following link:
  ${resetPasswordUrl}
  
  This link will expire in 15 minutes for security reasons.
  
  If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
  
  Best regards,
  The Cosmetic Store Security Team
  `

    const params = {
      Source: process.env.MAIL_FROM as string,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: '🔐 Reset Your Password - Cosmetic Store',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          },
          Text: {
            Data: textContent,
            Charset: 'UTF-8'
          }
        }
      }
    }

    try {
      const command = new SendEmailCommand(params)
      const response = await this.sesClient.send(command)
      console.log('Forgot password email sent successfully:', response.MessageId)
      return { success: true, messageId: response.MessageId }
    } catch (error) {
      console.error('Error sending forgot password email:', error)
      throw new Error('Failed to send password reset email')
    }
  }

  async sendPasswordResetSuccessEmail(to: string, name: string) {
    const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Password Reset Successful</title>
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
              background: #f9f9f9;
              padding: 30px;
              border-radius: 10px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          .header {
              text-align: center;
              margin-bottom: 30px;
          }
          .logo {
              font-size: 24px;
              font-weight: bold;
              color: #007bff;
              margin-bottom: 10px;
          }
          .success-banner {
              background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
              color: white;
              padding: 30px;
              border-radius: 10px;
              text-align: center;
              margin-bottom: 30px;
          }
          .button {
              display: inline-block;
              padding: 12px 30px;
              background-color: #007bff;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
          }
          .security-notice {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 5px;
              margin: 20px 0;
          }
          .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              font-size: 14px;
              color: #666;
              text-align: center;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <div class="logo">🌟 Cosmetic Store</div>
          </div>
          
          <div class="success-banner">
              <h1>✅ Password Reset Successful!</h1>
              <p>Your password has been updated successfully</p>
          </div>
          
          <p>Hi ${name},</p>
          
          <p>This email confirms that your password has been successfully reset for your Cosmetic Store account.</p>
          
          <div class="security-notice">
              <strong>🔐 Security Notice:</strong> For your security, all active sessions have been logged out. You'll need to log in again with your new password.
          </div>
          
          <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/login" class="button">Login to Your Account</a>
          </div>
          
          <p><strong>What happens next:</strong></p>
          <ul>
              <li>✓ Your old password is no longer valid</li>
              <li>✓ All devices have been logged out for security</li>
              <li>✓ You can now log in with your new password</li>
              <li>✓ Your account is secure and ready to use</li>
          </ul>
          
          <div class="footer">
              <p><strong>Didn't make this change?</strong></p>
              <p>If you didn't reset your password, please contact our support team immediately.</p>
              
              <p>Best regards,<br>
              The Cosmetic Store Security Team</p>
          </div>
      </div>
  </body>
  </html>
  `

    const params = {
      Source: process.env.MAIL_FROM as string,
      Destination: {
        ToAddresses: [to]
      },
      Message: {
        Subject: {
          Data: '✅ Password Reset Successful - Cosmetic Store',
          Charset: 'UTF-8'
        },
        Body: {
          Html: {
            Data: htmlContent,
            Charset: 'UTF-8'
          }
        }
      }
    }

    try {
      const command = new SendEmailCommand(params)
      const response = await this.sesClient.send(command)
      console.log('Password reset success email sent successfully:', response.MessageId)
      return { success: true, messageId: response.MessageId }
    } catch (error) {
      console.error('Error sending password reset success email:', error)
      throw new Error('Failed to send password reset success email')
    }
  }
}

const emailService = new EmailService()
export default emailService
