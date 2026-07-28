const express = require('express');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const apiKey = process.env.OPENAI_API_KEY;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '/')));

// Resend SMTP connection options
const transporter = nodemailer.createTransport({
    host: 'smtp.resend.com',
    port: 465,
    secure: true, // TLS/SSL for port 465
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS, // Your Resend API key
    }
});

app.post('/api/send-email', async (req, res) => {
    try {
        const { name, phone, plan, message } = req.body;

        // Basic validation
        if (!name || !phone || !plan) {
            return res.status(400).json({
                success: false,
                message: 'Name, phone, and plan are required fields.'
            });
        }

        // HTML Email content formatting
        const htmlContent = `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; border: 1px solid #e0e0e0; rounded: 8px;">
                <h2 style="color: #002672; border-bottom: 2px solid #facc15; padding-bottom: 10px;">
                    🚀 New Website Lead Received!
                </h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
                <p><strong>Selected Plan:</strong> ${plan}</p>
                <p><strong>Business Message:</strong></p>
                <blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #002672; margin: 0;">
                    ${message || 'No additional details provided.'}
                </blockquote>
                <hr style="margin-top: 20px; border: none; border-top: 1px solid #eee;" />
                <p style="font-size: 11px; color: #888;">
                    Sent automatically from Fluxospot Software Services website.
                </p>
            </div>
        `;

        // Mail Options
        const mailOptions = {
            from: 'Fluxospot Website <onboarding@resend.dev>', // Replace with your verified Resend domain if applicable
            to: 'fluxospot@gmail.com',
            subject: `New Lead: ${name} (${plan})`,
            html: htmlContent
        };

        // Send Email via Nodemailer
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.messageId);

        return res.status(200).json({
            success: true,
            message: 'Lead notification sent successfully!'
        });

    } catch (error) {
        console.error('Error sending lead email:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to send lead email. Please try again later.'
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});