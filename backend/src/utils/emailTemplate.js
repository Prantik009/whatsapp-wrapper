export const emailTemplates = {
  otpVerification: (otp) => ({
    subject: "Your Verification Code: " + otp, // More natural subject
    text: `Your verification code is: ${otp}. This code will expire in 5 minutes. If you didn't request this code, please ignore this email.`,
    html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="color-scheme" content="light">
    <meta name="supported-color-schemes" content="light">
    <title>Verify Your Account</title>
    <style>
        /* Simplified CSS - remove gradients and flashy styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.5;
            color: #333333;
            margin: 0;
            padding: 0;
            background-color: #f6f6f6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4F46E5;
            padding: 24px 20px;
            text-align: center;
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }
        .content {
            padding: 32px 24px;
        }
        .otp-code {
            background-color: #f8f9fa;
            color: #1a1a1a;
            font-size: 32px;
            font-weight: 700;
            text-align: center;
            padding: 16px;
            margin: 24px 0;
            border: 2px dashed #e0e0e0;
            border-radius: 6px;
            letter-spacing: 4px;
            font-family: 'Courier New', monospace;
        }
        .info-box {
            background-color: #f0f7ff;
            border: 1px solid #d0e3ff;
            padding: 16px;
            margin: 20px 0;
            border-radius: 6px;
            font-size: 14px;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666666;
            font-size: 12px;
            border-top: 1px solid #e0e0e0;
        }
        .expiry-note {
            color: #dc2626;
            font-weight: 600;
            margin: 16px 0;
            font-size: 14px;
        }
        .support-text {
            color: #6b7280;
            font-size: 14px;
            margin-top: 24px;
        }
        /* Remove any hidden elements */
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Verify Your Account</h1>
        </div>
        
        <div class="content">
            <p>Hello,</p>
            <p>To complete your verification, please use the following code:</p>
            
            <div class="otp-code">${otp}</div>
            
            <div class="expiry-note">
                This code will expire in 5 minutes.
            </div>
            
            <div class="info-box">
                <strong>Security notice:</strong> For your protection, never share this code with anyone.
            </div>
            
            <p>If you didn't request this verification, please disregard this email.</p>
            
            <div class="support-text">
                Need assistance? Contact us at support@yourapp.com
            </div>
        </div>
        
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Your App Name. All rights reserved.</p>
            <p>This is an automated message - please do not reply directly to this email.</p>
        </div>
    </div>
</body>
</html>
    `
  })
};

export default emailTemplates;