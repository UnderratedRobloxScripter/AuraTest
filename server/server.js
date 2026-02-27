// server/server.js
require('dotenv').config();
const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");

// In-memory OTP store
const otpStore = {};

// Gmail transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

transporter.verify((err, success) => {
  if (err) console.error("SMTP ERROR:", err);
  else console.log("SMTP Ready ✅");
});

// Handler
async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { action, email, otp } = req.body;

  if (!action || !email) return res.status(400).json({ error: "Missing required fields" });

  try {
    if (action === "send") {
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[email] = code;

      // send email
      await transporter.sendMail({
        from: `"Aura Dev" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Your OTP Code",
        text: `Your OTP is ${code}`
      });

      console.log("OTP sent to", email);
      return res.json({ success: true });
    }

    if (action === "verify") {
      if (otpStore[email] === otp) {
        delete otpStore[email];
        return res.json({ success: true });
      } else {
        return res.status(400).json({ error: "Invalid OTP" });
      }
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (err) {
    console.error("SERVER ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// Express app
const app = express();
app.use(cors());
app.use(express.json());
app.post("/api/otp", (req, res) => handler(req, res));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`OTP server running on http://localhost:${PORT}`));

module.exports = handler;