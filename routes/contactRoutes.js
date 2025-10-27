// backend/routes/contactRoutes.js
import express from "express";
import dotenv from "dotenv";
import Message from "../models/Message.js";
import { Resend } from "resend";

dotenv.config();
const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY);

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

        // Send email using Resend API
        const data = await resend.emails.send({
            from: "Portfolio Contact <onboarding@resend.dev>", // Resend-approved sender
            to: process.env.RECEIVER_EMAIL,
            subject: `New Contact Message from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`,
        });

        console.log("✅ Email sent via Resend:", data);
        res.status(200).json({ success: true, message: "Message sent successfully!" });
    } catch (error) {
        console.error("❌ Email send failed:", error);
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

export default router;
