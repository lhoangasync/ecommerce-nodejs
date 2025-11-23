import nodemailer from 'nodemailer'
import { config } from 'dotenv'

config()

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    const SMTP_PORT_NUM = parseInt(process.env.SMTP_PORT || '587');
    const isSecure = SMTP_PORT_NUM === 465 || (process.env.SMTP_SECURE === 'true');

    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: SMTP_PORT_NUM,
      secure: isSecure,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    this.transporter.verify((error, success) => {
      if (error) {
        console.error('SMTP connection error:', error);
        
        if ((error as any).code === 'EAUTH') {
          console.error('Authentication Failed: Check SMTP_USER and SMTP_PASSWORD (App Password).');
        }
      } else {
        console.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendOrderConfirmationEmail(to: string, orderData: any) {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background: #f5f5f5; padding: 20px; }
            .email-wrapper { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ff6b9d, #c44569); padding: 30px; text-align: center; color: white; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .content { padding: 30px; }
            .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
            .order-info-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #495057; }
            .value { color: #212529; }
            .items-section { margin: 30px 0; }
            .items-section h2 { font-size: 20px; color: #c44569; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #ff6b9d; }
            .item { display: flex; gap: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px; }
            .item-image { width: 80px; height: 80px; object-fit: cover; border-radius: 6px; }
            .item-details { flex: 1; }
            .item-name { font-weight: 600; color: #212529; margin-bottom: 5px; }
            .item-variant { font-size: 14px; color: #6c757d; margin-bottom: 5px; }
            .item-price { display: flex; justify-content: space-between; font-size: 14px; }
            .shipping-address { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #2196f3; }
            .shipping-address h3 { color: #1976d2; margin-bottom: 10px; font-size: 18px; }
            .shipping-address p { color: #424242; margin: 5px 0; }
            .price-summary { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .price-row { display: flex; justify-content: space-between; padding: 8px 0; color: #424242; }
            .price-row.total { border-top: 2px solid #ff9800; margin-top: 10px; padding-top: 15px; font-size: 18px; font-weight: 700; color: #e65100; }
            .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 14px; font-weight: 600; background: #ffc107; color: #000; }
            .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
            .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
            @media (max-width: 600px) {
                .item { flex-direction: column; }
                .item-image { width: 100%; height: 150px; }
            }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>Order Successfully Created!</h1>
                <p>Thank you for shopping at Cosmetic Store</p>
            </div>
            
            <div class="content">
                <div class="order-info">
                    <div class="order-info-row">
                        <span class="label">Order Code:</span>
                        <span class="value">${orderData.order_code}</span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Order Date:</span>
                        <span class="value">${new Date(orderData.created_at).toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Status:</span>
                        <span class="value"><span class="status-badge">Pending Confirmation</span></span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Payment Method:</span>
                        <span class="value">${orderData.payment_method === 'cod' ? 'Cash on Delivery (COD)' : orderData.payment_method === 'momo' ? 'MoMo Wallet' : orderData.payment_method === 'vnpay' ? 'VNPay' : 'Bank Transfer'}</span>
                    </div>
                </div>
                
                <div class="items-section">
                    <h2>Product Details</h2>
                    ${orderData.items
                      .map(
                        (item: any) => `
                        <div class="item">
                            ${item.variant_image || item.product_image ? `<img src="${item.variant_image || item.product_image}" alt="${item.product_name}" class="item-image">` : ''}
                            <div class="item-details">
                                <div class="item-name">${item.product_name}</div>
                                <div class="item-variant">
                                    ${item.variant_shade_color ? `Color: ${item.variant_shade_color}` : ''}
                                    ${item.variant_volume_size ? `${item.variant_shade_color ? ' | ' : ''}Volume: ${item.variant_volume_size}` : ''}
                                </div>
                                <div class="item-price">
                                    <span>Quantity: ${item.quantity}</span>
                                    <span style="font-weight: 600;">${item.subtotal.toLocaleString('vi-VN')}₫</span>
                                </div>
                            </div>
                        </div>
                    `
                      )
                      .join('')}
                </div>
                
                <div class="shipping-address">
                    <h3>Shipping Address</h3>
                    <p><strong>${orderData.shipping_address.full_name}</strong></p>
                    <p>${orderData.shipping_address.phone_number}</p>
                    <p>${orderData.shipping_address.address}</p>
                    ${orderData.shipping_address.ward ? `<p>${orderData.shipping_address.ward}${orderData.shipping_address.district ? `, ${orderData.shipping_address.district}` : ''}, ${orderData.shipping_address.city}</p>` : `<p>${orderData.shipping_address.city}</p>`}
                    ${orderData.note ? `<p style="margin-top: 10px;"><em>Note: ${orderData.note}</em></p>` : ''}
                </div>
                
                <div class="price-summary">
                    <div class="price-row">
                        <span>Subtotal:</span>
                        <span>${orderData.subtotal.toLocaleString('vi-VN')}₫</span>
                    </div>
                    <div class="price-row">
                        <span>Shipping Fee:</span>
                        <span>${orderData.shipping_fee.toLocaleString('vi-VN')}₫</span>
                    </div>
                    ${
                      orderData.discount_amount > 0
                        ? `
                    <div class="price-row" style="color: #28a745;">
                        <span>Discount${orderData.coupon_code ? ` (${orderData.coupon_code})` : ''}:</span>
                        <span>-${orderData.discount_amount.toLocaleString('vi-VN')}₫</span>
                    </div>
                    `
                        : ''
                    }
                    <div class="price-row total">
                        <span>Total:</span>
                        <span>${orderData.total_amount.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/orders/${orderData._id}" class="button">
                        View Order Details
                    </a>
                </div>
                
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #4caf50;">
                    <p style="color: #2e7d32; margin: 0;">
                        <strong>Next Step:</strong> We will confirm your order and start preparing for delivery. You will receive email notifications when your order is updated.
                    </p>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Thank you for trusting Cosmetic Store!</strong></p>
                <p>If you have any questions, please contact us.</p>
            </div>
        </div>
    </body>
    </html>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: `Order ${orderData.order_code} Successfully Created`,
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Order confirmation email sent:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Error sending order confirmation email:', error)
      throw new Error('Failed to send order confirmation email')
    }
  }

  async sendOrderStatusUpdateEmail(to: string, orderData: any) {
    const statusConfig = {
      confirmed: {
        title: 'Order Confirmed',
        color: '#28a745',
        bgcolor: '#d4edda',
        icon: '✓',
        message: 'Your order has been confirmed and is being prepared.',
        nextStep: 'We will proceed with packaging and delivery as soon as possible.'
      },
      processing: {
        title: 'Order Processing',
        color: '#007bff',
        bgcolor: '#d1ecf1',
        icon: '📦',
        message: 'We are preparing your order.',
        nextStep: 'Your order will soon be transferred to the shipping unit.'
      },
      shipping: {
        title: 'Order Shipping',
        color: '#ff9800',
        bgcolor: '#fff3cd',
        icon: '🚚',
        message: 'Your order is on the way to you!',
        nextStep: 'Please pay attention to your phone to receive the order.'
      },
      delivered: {
        title: 'Order Delivered Successfully',
        color: '#4caf50',
        bgcolor: '#d4edda',
        icon: '✓',
        message: 'Your order has been successfully delivered!',
        nextStep: 'Thank you for shopping at Cosmetic Store. See you again!'
      },
      cancelled: {
        title: 'Order Cancelled',
        color: '#dc3545',
        bgcolor: '#f8d7da',
        icon: '✕',
        message: 'Your order has been cancelled.',
        nextStep: orderData.cancellation_reason
          ? `Reason: ${orderData.cancellation_reason}`
          : 'If you have any questions, please contact us.'
      },
      refunded: {
        title: 'Order Refunded',
        color: '#6c757d',
        bgcolor: '#e2e3e5',
        icon: '💰',
        message: 'Your order has been refunded.',
        nextStep: 'The amount will be transferred to your account within 3-5 business days.'
      }
    }

    const config = statusConfig[orderData.status as keyof typeof statusConfig]

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Update</title>
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; background: #f5f5f5; padding: 20px; }
            .email-wrapper { max-width: 650px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
            .header { background: ${config.color}; padding: 30px; text-align: center; color: white; }
            .header h1 { font-size: 28px; margin-bottom: 10px; }
            .content { padding: 30px; }
            .status-card { background: ${config.bgcolor}; padding: 25px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${config.color}; text-align: center; }
            .status-icon { font-size: 48px; margin-bottom: 15px; }
            .status-message { font-size: 18px; font-weight: 600; color: ${config.color}; margin-bottom: 10px; }
            .status-detail { color: #424242; font-size: 14px; }
            .order-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .order-info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e9ecef; }
            .order-info-row:last-child { border-bottom: none; }
            .label { font-weight: 600; color: #495057; }
            .value { color: #212529; }
            .timeline { margin: 30px 0; }
            .timeline-item { display: flex; gap: 15px; margin-bottom: 20px; }
            .timeline-icon { width: 40px; height: 40px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .timeline-icon.active { background: ${config.color}; color: white; }
            .timeline-content { flex: 1; }
            .timeline-title { font-weight: 600; color: #212529; }
            .timeline-time { font-size: 14px; color: #6c757d; }
            .button { display: inline-block; padding: 14px 30px; background: linear-gradient(135deg, #ff6b9d, #c44569); color: white; text-decoration: none; border-radius: 25px; font-weight: 600; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #e9ecef; }
            .footer p { color: #6c757d; font-size: 14px; margin: 5px 0; }
        </style>
    </head>
    <body>
        <div class="email-wrapper">
            <div class="header">
                <h1>${config.title}</h1>
                <p>Order Code: ${orderData.order_code}</p>
            </div>
            
            <div class="content">
                <div class="status-card">
                    <div class="status-icon">${config.icon}</div>
                    <div class="status-message">${config.message}</div>
                    <div class="status-detail">${config.nextStep}</div>
                </div>
                
                <div class="order-info">
                    <div class="order-info-row">
                        <span class="label">Order Code:</span>
                        <span class="value">${orderData.order_code}</span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Current Status:</span>
                        <span class="value" style="color: ${config.color}; font-weight: 600;">${config.title}</span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Update Date:</span>
                        <span class="value">${new Date().toLocaleString('vi-VN')}</span>
                    </div>
                    <div class="order-info-row">
                        <span class="label">Total Amount:</span>
                        <span class="value" style="font-weight: 700;">${orderData.total_amount.toLocaleString('vi-VN')}₫</span>
                    </div>
                </div>
                
                <div class="timeline">
                    <h3 style="margin-bottom: 20px; color: #212529;">Order History</h3>
                    
                    <div class="timeline-item">
                        <div class="timeline-icon active">✓</div>
                        <div class="timeline-content">
                            <div class="timeline-title">Order Created</div>
                            <div class="timeline-time">${new Date(orderData.created_at).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                    
                    ${
                      orderData.confirmed_at
                        ? `
                    <div class="timeline-item">
                        <div class="timeline-icon active">✓</div>
                        <div class="timeline-content">
                            <div class="timeline-title">Order Confirmed</div>
                            <div class="timeline-time">${new Date(orderData.confirmed_at).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    
                    ${
                      orderData.shipping_at
                        ? `
                    <div class="timeline-item">
                        <div class="timeline-icon active">✓</div>
                        <div class="timeline-content">
                            <div class="timeline-title">Order Shipping</div>
                            <div class="timeline-time">${new Date(orderData.shipping_at).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    
                    ${
                      orderData.delivered_at
                        ? `
                    <div class="timeline-item">
                        <div class="timeline-icon active">✓</div>
                        <div class="timeline-content">
                            <div class="timeline-title">Order Delivered Successfully</div>
                            <div class="timeline-time">${new Date(orderData.delivered_at).toLocaleString('vi-VN')}</div>
                        </div>
                    </div>
                    `
                        : ''
                    }
                    
                    ${
                      orderData.cancelled_at
                        ? `
                    <div class="timeline-item">
                        <div class="timeline-icon" style="background: #dc3545; color: white;">✕</div>
                        <div class="timeline-content">
                            <div class="timeline-title">Order Cancelled</div>
                            <div class="timeline-time">${new Date(orderData.cancelled_at).toLocaleString('vi-VN')}</div>
                            ${orderData.cancellation_reason ? `<div class="timeline-time">Reason: ${orderData.cancellation_reason}</div>` : ''}
                        </div>
                    </div>
                    `
                        : ''
                    }
                </div>
                
                <div style="text-align: center;">
                    <a href="${process.env.CLIENT_URL}/orders/${orderData._id}" class="button">
                        View Order Details
                    </a>
                </div>
            </div>
            
            <div class="footer">
                <p><strong>Cosmetic Store</strong></p>
                <p>Thank you for shopping at our store!</p>
                <p>If you have any questions, please contact us.</p>
            </div>
        </div>
    </body>
    </html>
    `

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: `${config.icon} ${config.title} - ${orderData.order_code}`,
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Order status update email sent:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Error sending order status update email:', error)
      throw new Error('Failed to send order status update email')
    }
  }

  async sendVerificationEmail(to: string, email_verify_token: string) {
    const verifyEmailUrl = `${process.env.CLIENT_URL}/verify-email?token=${email_verify_token}`

    const htmlContent = `
   <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification - Cosmetic Store</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            background: linear-gradient(135deg, #ff6b9d 0%, #c44569 50%, #f8b500 100%);
            background-attachment: fixed;
            min-height: 100vh;
            padding: 20px;
        }
        
        body::before {
            content: '';
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: 
                radial-gradient(circle at 20% 20%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 2px, transparent 2px),
                radial-gradient(circle at 40% 60%, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
            background-size: 50px 50px, 60px 60px, 30px 30px;
            pointer-events: none;
            z-index: -1;
        }
        
        .email-wrapper {
            max-width: 600px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(196, 69, 105, 0.3);
        }
        
        .header {
            background: url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80') center/cover;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(255, 107, 157, 0.8), rgba(196, 69, 105, 0.8));
        }
        
        .logo {
            position: relative;
            z-index: 1;
            font-size: 32px;
            font-weight: 700;
            color: white;
            margin-bottom: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .title {
            position: relative;
            z-index: 1;
            color: white;
            font-size: 24px;
            font-weight: 600;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
        
        .content {
            padding: 40px 30px;
            color: #2c2c2c;
        }
        
        .greeting {
            font-size: 18px;
            color: #c44569;
            font-weight: 600;
            margin-bottom: 20px;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.7;
            color: #444;
        }
        
        .cta-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .verify-button {
            display: inline-block;
            padding: 16px 40px;
            background: linear-gradient(135deg, #ff6b9d, #c44569);
            color: white;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 600;
            font-size: 16px;
            box-shadow: 0 8px 20px rgba(196, 69, 105, 0.3);
            transition: all 0.3s ease;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 25px rgba(196, 69, 105, 0.4);
            background: linear-gradient(135deg, #c44569, #ff6b9d);
        }
        
        .link-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin: 25px 0;
            border-left: 4px solid #ff6b9d;
        }
        
        .link-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
        }
        
        .link-url {
            word-break: break-all;
            background: white;
            padding: 12px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 13px;
            color: #c44569;
            border: 1px solid #e9ecef;
        }
        
        .warning {
            background: linear-gradient(135deg, #fff3e0, #ffe0b2);
            border: 1px solid #ffb74d;
            color: #e65100;
            padding: 20px;
            border-radius: 12px;
            margin: 25px 0;
            border-left: 5px solid #ff9800;
        }
        
        .warning-title {
            font-weight: 600;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .footer {
            background: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .signature {
            font-size: 16px;
            color: #c44569;
            font-weight: 600;
            margin-bottom: 15px;
        }
        
        .team-name {
            color: #ff6b9d;
            font-weight: 700;
        }
        
        .support-text {
            font-size: 14px;
            color: #666;
            margin-top: 20px;
        }
        
        .beauty-icons {
            display: flex;
            justify-content: center;
            gap: 15px;
            margin: 20px 0;
            font-size: 24px;
        }
        
        @media (max-width: 600px) {
            body {
                padding: 10px;
            }
            
            .email-wrapper {
                border-radius: 15px;
            }
            
            .header {
                padding: 30px 20px;
            }
            
            .content {
                padding: 30px 20px;
            }
            
            .logo {
                font-size: 28px;
            }
            
            .title {
                font-size: 20px;
            }
            
            .verify-button {
                padding: 14px 30px;
                color: white !important;
                font-size: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-wrapper">
        <div class="header">
            <div class="logo">Cosmetic Store</div>
            <h1 class="title">Verify Your Email Address</h1>
        </div>
        
        <div class="content">
            <div class="greeting">Hello Beautiful!</div>
            
            <p class="message">
                Thank you for joining our exclusive beauty community! We are thrilled to have you discover our carefully curated collection of premium cosmetics and skincare products.
            </p>
            
            <p class="message">
                To unlock your beauty journey and start exploring our amazing products, please verify your email address by clicking the button below:
            </p>
            
            <div class="cta-section">
                <a href="${verifyEmailUrl}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="link-section">
                <div class="link-text">Cannot click the button? Copy and paste this link in your browser:</div>
                <div class="link-url">${verifyEmailUrl}</div>
            </div>
            
            <div class="warning">
                <div class="warning-title">
                    <span>Important Notice</span>
                </div>
                <div>This verification link will expire in 7 days for security reasons. If you did not create an account with Cosmetic Store, please ignore this email safely.</div>
            </div>
            
            <div class="beauty-icons">
                <span>💄</span>
                <span>✨</span>
                <span>🌸</span>
                <span>💖</span>
                <span>🎀</span>
            </div>
        </div>
        
        <div class="footer">
            <div class="signature">
                With love and beauty,<br>
                <span class="team-name">Cosmetic Store Team</span>
            </div>
            
            <div class="support-text">
                Questions? Our beauty experts are here to help!<br>
                Contact our support team anytime for personalized assistance.
            </div>
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
    
    This verification link will expire in 7 days. If you did not create an account with us, please ignore this email.
    
    Best regards,
    The Cosmetic Store Team
    `

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Verify Your Email - Cosmetic Store',
      html: htmlContent,
      text: textContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
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
                <div class="logo">Cosmetic Store</div>
            </div>
            
            <div class="welcome-banner">
                <h1>Welcome, ${name}!</h1>
                <p>Your email has been verified successfully!</p>
            </div>
            
            <p>Congratulations! You are now part of our beauty community. Get ready to discover amazing cosmetic products and exclusive deals.</p>
            
            <div class="features">
                <div class="feature">
                    <h3>Premium Products</h3>
                    <p>Access to high-quality cosmetics from top brands</p>
                </div>
                <div class="feature">
                    <h3>Exclusive Offers</h3>
                    <p>Special discounts and early access to sales</p>
                </div>
                <div class="feature">
                    <h3>Beauty Tips</h3>
                    <p>Expert advice and tutorials from makeup artists</p>
                </div>
                <div class="feature">
                    <h3>Fast Shipping</h3>
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

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Welcome to Cosmetic Store - Your Account is Ready!',
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Welcome email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
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
              <div class="logo">Cosmetic Store</div>
              <h1 class="title">Reset Your Password</h1>
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
              <strong>Important:</strong> This password reset link will expire in 15 minutes for security reasons.
          </div>
          
          <div class="security-tips">
              <strong>Security Tips:</strong>
              <ul>
                  <li>Never share your password with anyone</li>
                  <li>Use a strong, unique password</li>
                  <li>If you did not request this reset, please ignore this email</li>
                  <li>Consider enabling two-factor authentication</li>
              </ul>
          </div>
          
          <div class="footer">
              <p>If you did not request a password reset, please ignore this email. Your password will remain unchanged.</p>
              
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
  
  If you did not request a password reset, please ignore this email. Your password will remain unchanged.
  
  Best regards,
  The Cosmetic Store Security Team
  `

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Reset Your Password - Cosmetic Store',
      html: htmlContent,
      text: textContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Forgot password email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
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
              <div class="logo">Cosmetic Store</div>
          </div>
          
          <div class="success-banner">
              <h1>Password Reset Successful!</h1>
              <p>Your password has been updated successfully</p>
          </div>
          
          <p>Hi ${name},</p>
          
          <p>This email confirms that your password has been successfully reset for your Cosmetic Store account.</p>
          
          <div class="security-notice">
              <strong>Security Notice:</strong> For your security, all active sessions have been logged out. You will need to log in again with your new password.
          </div>
          
          <div style="text-align: center;">
              <a href="${process.env.CLIENT_URL}/login" class="button">Login to Your Account</a>
          </div>
          
          <p><strong>What happens next:</strong></p>
          <ul>
              <li>Your old password is no longer valid</li>
              <li>All devices have been logged out for security</li>
              <li>You can now log in with your new password</li>
              <li>Your account is secure and ready to use</li>
          </ul>
          
          <div class="footer">
              <p><strong>Did not make this change?</strong></p>
              <p>If you did not reset your password, please contact our support team immediately.</p>
              
              <p>Best regards,<br>
              The Cosmetic Store Security Team</p>
          </div>
      </div>
  </body>
  </html>
  `

    const mailOptions = {
      from: process.env.MAIL_FROM,
      to: to,
      subject: 'Password Reset Successful - Cosmetic Store',
      html: htmlContent
    }

    try {
      const info = await this.transporter.sendMail(mailOptions)
      console.log('Password reset success email sent successfully:', info.messageId)
      return { success: true, messageId: info.messageId }
    } catch (error) {
      console.error('Error sending password reset success email:', error)
      throw new Error('Failed to send password reset success email')
    }
  }
}

const emailService = new EmailService()
export default emailService
