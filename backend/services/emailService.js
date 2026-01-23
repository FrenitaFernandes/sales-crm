const transporter = require("../config/mail");

// Send Welcome Email (No OTP)
exports.sendWelcomeEmail = async (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Welcome to Sales CRM!",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thank you for registering with our System.</p>
      <p>Your account has been created successfully.</p>
      <br/>
      <p>Regards,<br/>Sales CRM Team</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
