const nodemailer = require("nodemailer");

const allowInvalidCert = process.env.EMAIL_ALLOW_INVALID_CERT === "true";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  // Some local/corporate networks inject self-signed certs into TLS traffic.
  // Keep strict validation by default and allow override via env when needed.
  tls: {
    rejectUnauthorized: !allowInvalidCert,
  },
});

module.exports = transporter;
