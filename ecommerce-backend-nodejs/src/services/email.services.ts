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
}

const emailService = new EmailService()
export default emailService
