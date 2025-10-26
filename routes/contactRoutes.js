import express from "express";
import dotenv from "dotenv";
import Message from "../models/Message.js";
import nodemailer from "nodemailer";

dotenv.config();
const router = express.Router();

router.post("/", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log("📩 Incoming request:", { name, email, message });

        if (!name || !email || !message) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Save message to MongoDB
        const newMessage = new Message({ name, email, message });
        await newMessage.save();
        console.log("✅ Message saved to MongoDB");

        // Setup mail transport
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.RECEIVER_EMAIL || process.env.EMAIL_USER,
            subject: `New Contact Message from ${name}`,
            text: `
Name: ${name}
Email: ${email}
Message: ${message}
      `,
        };

        console.log("📤 Sending email...");
        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);

        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Email send failed:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

export default router;
