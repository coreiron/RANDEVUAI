import express from 'express';
import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

const router = express.Router();

// E-posta gönderici yapılandırması
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// E-posta gönderim endpoint'i
router.post('/send', async (req, res) => {
    try {
        const { to, subject, html, text } = req.body;

        if (!to || !subject || (!html && !text)) {
            return res.status(400).json({ error: 'Eksik parametreler' });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            html,
            text
        };

        await transporter.sendMail(mailOptions);
        console.log('E-posta gönderildi:', to);
        res.json({ success: true });
    } catch (error) {
        console.error('E-posta gönderim hatası:', error);
        res.status(500).json({ error: 'E-posta gönderilemedi' });
    }
});

export default router; 